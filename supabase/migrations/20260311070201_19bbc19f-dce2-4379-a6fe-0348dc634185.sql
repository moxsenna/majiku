
-- Fix ALL RLS policies: change from RESTRICTIVE to PERMISSIVE

-- ===== user_roles =====
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== students =====
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
DROP POLICY IF EXISTS "Parents can view own children" ON public.students;

CREATE POLICY "Admins can manage students" ON public.students
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Parents can view own children" ON public.students
  FOR SELECT TO authenticated USING (parent_user_id = auth.uid());

-- ===== attendance =====
DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Attendance: admin or parent" ON public.attendance;

CREATE POLICY "Admins can manage attendance" ON public.attendance
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Parents can view own attendance" ON public.attendance
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE parent_user_id = auth.uid()));

-- ===== invoices =====
DROP POLICY IF EXISTS "Admins can manage invoices" ON public.invoices;
DROP POLICY IF EXISTS "Invoices: admin or parent" ON public.invoices;

CREATE POLICY "Admins can manage invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Parents can view own invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE parent_user_id = auth.uid()));

-- ===== student_enrollments =====
DROP POLICY IF EXISTS "Admins can manage enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Enrollments: admin or parent" ON public.student_enrollments;

CREATE POLICY "Admins can manage enrollments" ON public.student_enrollments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Parents can view own enrollments" ON public.student_enrollments
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM public.students WHERE parent_user_id = auth.uid()));

-- ===== classes =====
DROP POLICY IF EXISTS "Admins can manage classes" ON public.classes;
DROP POLICY IF EXISTS "Classes viewable by authenticated" ON public.classes;

CREATE POLICY "Admins can manage classes" ON public.classes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Classes viewable by authenticated" ON public.classes
  FOR SELECT TO authenticated USING (true);

-- ===== tutors =====
DROP POLICY IF EXISTS "Admins can manage tutors" ON public.tutors;
DROP POLICY IF EXISTS "Tutors: admin or self" ON public.tutors;

CREATE POLICY "Admins can manage tutors" ON public.tutors
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Tutors can view self" ON public.tutors
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ===== tutor_bonuses =====
DROP POLICY IF EXISTS "Admins can manage bonuses" ON public.tutor_bonuses;
DROP POLICY IF EXISTS "Tutor bonuses: admin or own tutor" ON public.tutor_bonuses;

CREATE POLICY "Admins can manage bonuses" ON public.tutor_bonuses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Tutors can view own bonuses" ON public.tutor_bonuses
  FOR SELECT TO authenticated
  USING (tutor_id IN (SELECT id FROM public.tutors WHERE user_id = auth.uid()));

-- ===== tutor_class_assignments =====
DROP POLICY IF EXISTS "Admins can manage assignments" ON public.tutor_class_assignments;
DROP POLICY IF EXISTS "Assignments: admin or own tutor" ON public.tutor_class_assignments;

CREATE POLICY "Admins can manage assignments" ON public.tutor_class_assignments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Tutors can view own assignments" ON public.tutor_class_assignments
  FOR SELECT TO authenticated
  USING (tutor_id IN (SELECT id FROM public.tutors WHERE user_id = auth.uid()));

-- ===== waiting_list =====
DROP POLICY IF EXISTS "Admins can manage waiting list" ON public.waiting_list;
DROP POLICY IF EXISTS "Waiting list: admin or own parent" ON public.waiting_list;

CREATE POLICY "Admins can manage waiting list" ON public.waiting_list
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Parents can view own waiting list" ON public.waiting_list
  FOR SELECT TO authenticated USING (parent_user_id = auth.uid());
