
-- ==========================================
-- MAJIKU Database Schema
-- ==========================================

-- Enum types
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'permit');
CREATE TYPE public.permit_type AS ENUM ('sick', 'family', 'other');
CREATE TYPE public.invoice_status AS ENUM ('unpaid', 'paid', 'overdue', 'partial');
CREATE TYPE public.waiting_list_status AS ENUM ('waiting', 'notified', 'confirmed', 'expired', 'cancelled');
CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- ==========================================
-- 1. Classes table
-- ==========================================
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL DEFAULT 10,
  price_per_month NUMERIC NOT NULL DEFAULT 0,
  sessions_per_month INTEGER NOT NULL DEFAULT 8,
  schedule TEXT,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Classes are viewable by authenticated users" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage classes" ON public.classes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 2. Tutors table
-- ==========================================
CREATE TABLE public.tutors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tutors viewable by authenticated" ON public.tutors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage tutors" ON public.tutors FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 3. Tutor-Class assignments with per-session rate
-- ==========================================
CREATE TABLE public.tutor_class_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  rate_per_session NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tutor_id, class_id)
);

ALTER TABLE public.tutor_class_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assignments viewable by authenticated" ON public.tutor_class_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage assignments" ON public.tutor_class_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 4. Tutor bonuses
-- ==========================================
CREATE TABLE public.tutor_bonuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tutor_bonuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bonuses viewable by authenticated" ON public.tutor_bonuses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage bonuses" ON public.tutor_bonuses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 5. Students table
-- ==========================================
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date_of_birth DATE,
  parent_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  photo_url TEXT,
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students viewable by authenticated" ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage students" ON public.students FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 6. Student-Class enrollments (with quota tracking)
-- ==========================================
CREATE TABLE public.student_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  sessions_quota INTEGER NOT NULL DEFAULT 8,
  sessions_used INTEGER NOT NULL DEFAULT 0,
  free_permits_allowed INTEGER NOT NULL DEFAULT 1,
  free_permits_used INTEGER NOT NULL DEFAULT 0,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  billing_day INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id)
);

ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enrollments viewable by authenticated" ON public.student_enrollments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage enrollments" ON public.student_enrollments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 7. Attendance records
-- ==========================================
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES public.student_enrollments(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status attendance_status NOT NULL DEFAULT 'present',
  check_in_time TIME,
  check_out_time TIME,
  permit_type permit_type,
  permit_reason TEXT,
  is_free_permit BOOLEAN NOT NULL DEFAULT false,
  checked_in_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attendance viewable by authenticated" ON public.attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage attendance" ON public.attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX idx_attendance_class_date ON public.attendance(class_id, date);

-- ==========================================
-- 8. Invoices
-- ==========================================
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES public.student_enrollments(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'unpaid',
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Invoices viewable by authenticated" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage invoices" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_invoices_student ON public.invoices(student_id);

-- ==========================================
-- 9. Waiting list
-- ==========================================
CREATE TABLE public.waiting_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT,
  parent_email TEXT,
  parent_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  status waiting_list_status NOT NULL DEFAULT 'waiting',
  notified_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  priority INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.waiting_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Waiting list viewable by authenticated" ON public.waiting_list FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage waiting list" ON public.waiting_list FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_waiting_list_class ON public.waiting_list(class_id, status);

-- ==========================================
-- Timestamp trigger function
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON public.tutors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tutor_class_assignments_updated_at BEFORE UPDATE ON public.tutor_class_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_enrollments_updated_at BEFORE UPDATE ON public.student_enrollments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_waiting_list_updated_at BEFORE UPDATE ON public.waiting_list FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
