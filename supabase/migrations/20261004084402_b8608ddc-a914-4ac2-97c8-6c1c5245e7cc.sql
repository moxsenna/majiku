CREATE TYPE public.trial_status AS ENUM ('submitted', 'scheduled', 'awaiting_review', 'recommended', 'repeat_trial', 'not_suitable', 'admitted');
CREATE TYPE public.trial_recommendation AS ENUM ('suitable', 'repeat_trial', 'not_suitable');

CREATE TABLE public.trial_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id uuid NOT NULL,
  program_key text NOT NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  tutor_id uuid REFERENCES public.tutors(id) ON DELETE SET NULL,
  child_name text NOT NULL,
  child_nickname text,
  child_birth_date date,
  child_gender text,
  allergies text,
  medical_notes text,
  parent_name text NOT NULL,
  parent_phone text NOT NULL,
  parent_email text NOT NULL,
  address text,
  emergency_contact text,
  emergency_phone text,
  requested_start_date date,
  parent_notes text,
  trial_scheduled_at timestamptz,
  trial_completed_at timestamptz,
  status public.trial_status NOT NULL DEFAULT 'submitted',
  recommendation public.trial_recommendation,
  observation_notes text,
  reviewed_at timestamptz,
  admitted_at timestamptz,
  admitted_student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trial_application_review_complete CHECK (
    (recommendation IS NULL AND observation_notes IS NULL AND reviewed_at IS NULL)
    OR
    (recommendation IS NOT NULL AND observation_notes IS NOT NULL AND reviewed_at IS NOT NULL)
  )
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trial_applications TO authenticated;
GRANT ALL ON public.trial_applications TO service_role;

ALTER TABLE public.trial_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage trial applications"
ON public.trial_applications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents create own trial applications"
ON public.trial_applications
FOR INSERT
TO authenticated
WITH CHECK (parent_user_id = auth.uid());

CREATE POLICY "Parents view own trial applications"
ON public.trial_applications
FOR SELECT
TO authenticated
USING (parent_user_id = auth.uid());

CREATE POLICY "Tutors view assigned trial applications"
ON public.trial_applications
FOR SELECT
TO authenticated
USING (
  tutor_id IN (
    SELECT id FROM public.tutors WHERE user_id = auth.uid()
  )
);

CREATE INDEX trial_applications_parent_idx ON public.trial_applications(parent_user_id, created_at DESC);
CREATE INDEX trial_applications_tutor_idx ON public.trial_applications(tutor_id, status);
CREATE INDEX trial_applications_status_idx ON public.trial_applications(status, created_at DESC);

CREATE TRIGGER update_trial_applications_updated_at
BEFORE UPDATE ON public.trial_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.submit_trial_review(
  _trial_id uuid,
  _recommendation public.trial_recommendation,
  _observation_notes text
)
RETURNS public.trial_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _trial public.trial_applications;
BEGIN
  IF nullif(trim(_observation_notes), '') IS NULL THEN
    RAISE EXCEPTION 'Catatan observasi wajib diisi';
  END IF;

  SELECT ta.* INTO _trial
  FROM public.trial_applications ta
  JOIN public.tutors t ON t.id = ta.tutor_id
  WHERE ta.id = _trial_id
    AND t.user_id = auth.uid()
    AND ta.status IN ('scheduled', 'awaiting_review', 'repeat_trial');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trial tidak ditemukan atau tidak dapat direview';
  END IF;

  UPDATE public.trial_applications
  SET recommendation = _recommendation,
      observation_notes = trim(_observation_notes),
      reviewed_at = now(),
      trial_completed_at = COALESCE(trial_completed_at, now()),
      status = CASE _recommendation
        WHEN 'suitable' THEN 'recommended'::public.trial_status
        WHEN 'repeat_trial' THEN 'repeat_trial'::public.trial_status
        ELSE 'not_suitable'::public.trial_status
      END
  WHERE id = _trial_id
  RETURNING * INTO _trial;

  RETURN _trial;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_trial_review(uuid, public.trial_recommendation, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_trial_review(uuid, public.trial_recommendation, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admit_trial_candidate(_trial_id uuid)
RETURNS public.trial_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _trial public.trial_applications;
  _student_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat menerima calon murid';
  END IF;

  SELECT * INTO _trial
  FROM public.trial_applications
  WHERE id = _trial_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pengajuan trial tidak ditemukan';
  END IF;

  IF _trial.status = 'admitted' AND _trial.admitted_student_id IS NOT NULL THEN
    RETURN _trial;
  END IF;

  IF _trial.status <> 'recommended'
     OR _trial.recommendation <> 'suitable'
     OR _trial.reviewed_at IS NULL
     OR _trial.trial_completed_at IS NULL THEN
    RAISE EXCEPTION 'Calon murid belum menyelesaikan trial dan mendapat rekomendasi cocok';
  END IF;

  IF _trial.class_id IS NULL THEN
    RAISE EXCEPTION 'Kelas tujuan belum dipilih';
  END IF;

  INSERT INTO public.students (
    name, date_of_birth, parent_user_id, parent_name, parent_phone, parent_email, is_active
  ) VALUES (
    _trial.child_name, _trial.child_birth_date, _trial.parent_user_id,
    _trial.parent_name, _trial.parent_phone, _trial.parent_email, true
  ) RETURNING id INTO _student_id;

  INSERT INTO public.student_enrollments (student_id, class_id, is_active)
  VALUES (_student_id, _trial.class_id, true);

  UPDATE public.trial_applications
  SET status = 'admitted', admitted_at = now(), admitted_student_id = _student_id
  WHERE id = _trial_id
  RETURNING * INTO _trial;

  RETURN _trial;
END;
$$;

REVOKE ALL ON FUNCTION public.admit_trial_candidate(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admit_trial_candidate(uuid) TO authenticated;