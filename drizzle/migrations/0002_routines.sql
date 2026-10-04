CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
--> statement-breakpoint
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('classes', 'tutors', 'tutor_class_assignments', 'students', 'student_enrollments', 'attendance', 'invoices', 'waiting_list', 'trial_applications', 'user', 'session', 'account', 'verification')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I;', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', t);
  END LOOP;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.has_role(_user_id text, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.submit_trial_review(
  p_trial_id text,
  p_reviewer_user_id text,
  p_recommendation public.trial_recommendation,
  p_observation_notes text
)
RETURNS public.trial_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _trial public.trial_applications;
BEGIN
  IF nullif(trim(p_observation_notes), '') IS NULL THEN
    RAISE EXCEPTION 'Catatan observasi wajib diisi';
  END IF;

  SELECT ta.* INTO _trial
  FROM public.trial_applications ta
  JOIN public.tutors t ON t.id = ta.tutor_id
  WHERE ta.id = p_trial_id
    AND t.user_id = p_reviewer_user_id
    AND ta.status IN ('scheduled', 'awaiting_review', 'repeat_trial');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trial tidak ditemukan atau tidak dapat direview';
  END IF;

  UPDATE public.trial_applications
  SET recommendation = p_recommendation,
      observation_notes = trim(p_observation_notes),
      reviewed_at = now(),
      trial_completed_at = COALESCE(trial_completed_at, now()),
      status = CASE p_recommendation
        WHEN 'suitable' THEN 'recommended'::public.trial_status
        WHEN 'repeat_trial' THEN 'repeat_trial'::public.trial_status
        ELSE 'not_suitable'::public.trial_status
      END
  WHERE id = p_trial_id
  RETURNING * INTO _trial;

  RETURN _trial;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.admit_trial_candidate(
  p_trial_id text,
  p_admitting_user_id text
)
RETURNS public.trial_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _trial public.trial_applications;
  _student_id text;
BEGIN
  IF NOT public.has_role(p_admitting_user_id, 'admin') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat menerima calon murid';
  END IF;

  SELECT * INTO _trial
  FROM public.trial_applications
  WHERE id = p_trial_id
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
    id, name, date_of_birth, parent_user_id, parent_name, parent_phone, parent_email, is_active
  ) VALUES (
    gen_random_uuid()::text, _trial.child_name, _trial.child_birth_date, _trial.parent_user_id,
    _trial.parent_name, _trial.parent_phone, _trial.parent_email, true
  ) RETURNING id INTO _student_id;

  INSERT INTO public.student_enrollments (id, student_id, class_id, is_active)
  VALUES (gen_random_uuid()::text, _student_id, _trial.class_id, true);

  UPDATE public.trial_applications
  SET status = 'admitted', admitted_at = now(), admitted_student_id = _student_id
  WHERE id = p_trial_id
  RETURNING * INTO _trial;

  RETURN _trial;
END;
$$;
