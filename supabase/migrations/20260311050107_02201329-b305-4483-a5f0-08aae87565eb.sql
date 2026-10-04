
-- 1. Fix auto-admin: change default role to 'user'
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- 2. Fix students table: drop RESTRICTIVE policies, create PERMISSIVE ones
DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
DROP POLICY IF EXISTS "Parents can view own children" ON public.students;

CREATE POLICY "Admins can view all students" ON public.students
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Parents can view own children" ON public.students
  FOR SELECT TO authenticated
  USING (parent_user_id = auth.uid());

-- 3. Tighten invoices SELECT
DROP POLICY IF EXISTS "Invoices viewable by authenticated" ON public.invoices;
CREATE POLICY "Invoices: admin or parent" ON public.invoices
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    student_id IN (SELECT id FROM public.students WHERE parent_user_id = auth.uid())
  );

-- 4. Tighten attendance SELECT
DROP POLICY IF EXISTS "Attendance viewable by authenticated" ON public.attendance;
CREATE POLICY "Attendance: admin or parent" ON public.attendance
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    student_id IN (SELECT id FROM public.students WHERE parent_user_id = auth.uid())
  );

-- 5. Tighten tutor_bonuses SELECT
DROP POLICY IF EXISTS "Bonuses viewable by authenticated" ON public.tutor_bonuses;
CREATE POLICY "Tutor bonuses: admin or own tutor" ON public.tutor_bonuses
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    tutor_id IN (SELECT id FROM public.tutors WHERE user_id = auth.uid())
  );

-- 6. Tighten tutor_class_assignments SELECT
DROP POLICY IF EXISTS "Assignments viewable by authenticated" ON public.tutor_class_assignments;
CREATE POLICY "Assignments: admin or own tutor" ON public.tutor_class_assignments
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    tutor_id IN (SELECT id FROM public.tutors WHERE user_id = auth.uid())
  );

-- 7. Tighten student_enrollments SELECT
DROP POLICY IF EXISTS "Enrollments viewable by authenticated" ON public.student_enrollments;
CREATE POLICY "Enrollments: admin or parent" ON public.student_enrollments
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    student_id IN (SELECT id FROM public.students WHERE parent_user_id = auth.uid())
  );

-- 8. Tighten waiting_list SELECT
DROP POLICY IF EXISTS "Waiting list viewable by authenticated" ON public.waiting_list;
CREATE POLICY "Waiting list: admin or own parent" ON public.waiting_list
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    parent_user_id = auth.uid()
  );

-- 9. Tighten tutors SELECT
DROP POLICY IF EXISTS "Tutors viewable by authenticated" ON public.tutors;
CREATE POLICY "Tutors: admin or self" ON public.tutors
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    user_id = auth.uid()
  );

-- 10. Tighten classes SELECT (classes are generally safe but scope to authenticated with role)
DROP POLICY IF EXISTS "Classes are viewable by authenticated users" ON public.classes;
CREATE POLICY "Classes viewable by authenticated" ON public.classes
  FOR SELECT TO authenticated
  USING (true);
