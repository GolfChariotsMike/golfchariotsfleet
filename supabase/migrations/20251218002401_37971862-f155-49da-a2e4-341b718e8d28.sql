-- Create app role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'course_user');

-- Create status enums
CREATE TYPE public.trike_status AS ENUM ('available', 'out_of_service', 'in_repair');
CREATE TYPE public.issue_type AS ENUM ('damage', 'breakdown', 'battery', 'tyres', 'brakes', 'other');
CREATE TYPE public.issue_severity AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.issue_status AS ENUM ('reported', 'acknowledged', 'in_repair', 'resolved');

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table (links to auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'course_user',
  UNIQUE (user_id, role)
);

-- Create trikes table
CREATE TABLE public.trikes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  asset_tag TEXT,
  status trike_status NOT NULL DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create issues table
CREATE TABLE public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  trike_id UUID NOT NULL REFERENCES public.trikes(id) ON DELETE CASCADE,
  issue_type issue_type NOT NULL,
  severity issue_severity NOT NULL DEFAULT 'low',
  status issue_status NOT NULL DEFAULT 'reported',
  description TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_by_name TEXT,
  admin_notes TEXT,
  cost_estimate DECIMAL(10,2),
  cost_final DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to get user's course_id
CREATE OR REPLACE FUNCTION public.get_user_course_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT course_id FROM public.profiles WHERE id = _user_id
$$;

-- RLS Policies for courses
CREATE POLICY "Admins can do everything with courses"
ON public.courses FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Course users can view their own course"
ON public.courses FOR SELECT
TO authenticated
USING (id = public.get_user_course_id(auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles (admin only)
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for trikes
CREATE POLICY "Admins can do everything with trikes"
ON public.trikes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Course users can view their course trikes"
ON public.trikes FOR SELECT
TO authenticated
USING (course_id = public.get_user_course_id(auth.uid()));

-- RLS Policies for issues
CREATE POLICY "Admins can do everything with issues"
ON public.issues FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Course users can view their course issues"
ON public.issues FOR SELECT
TO authenticated
USING (course_id = public.get_user_course_id(auth.uid()));

CREATE POLICY "Course users can create issues for their course"
ON public.issues FOR INSERT
TO authenticated
WITH CHECK (course_id = public.get_user_course_id(auth.uid()));

-- Function to handle new user signup (creates profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Default to course_user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'course_user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trikes_updated_at BEFORE UPDATE ON public.trikes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for issue photos
INSERT INTO storage.buckets (id, name, public) VALUES ('issue-photos', 'issue-photos', true);

-- Storage policies for issue photos
CREATE POLICY "Anyone can view issue photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'issue-photos');

CREATE POLICY "Authenticated users can upload issue photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'issue-photos');

CREATE POLICY "Admins can delete issue photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'issue-photos');

-- Seed data: 3 golf courses
INSERT INTO public.courses (id, name, contact_name, phone, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Royal Melbourne Golf Club', 'John Smith', '03 9598 6755', 'manager@royalmelbourne.com.au'),
  ('22222222-2222-2222-2222-222222222222', 'Bonville Golf Resort', 'Sarah Johnson', '02 6653 4002', 'operations@bonvillegolf.com.au'),
  ('33333333-3333-3333-3333-333333333333', 'Sanctuary Cove Golf Club', 'Mike Williams', '07 5530 8100', 'proshop@sanctuarycove.com.au');

-- Seed data: 10 trikes across courses
INSERT INTO public.trikes (course_id, name, asset_tag, status, notes) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Trike 01', 'GCA-001', 'available', 'Regular maintenance up to date'),
  ('11111111-1111-1111-1111-111111111111', 'Trike 02', 'GCA-002', 'available', NULL),
  ('11111111-1111-1111-1111-111111111111', 'Trike 03', 'GCA-003', 'in_repair', 'Brake pads being replaced'),
  ('11111111-1111-1111-1111-111111111111', 'Trike 04', 'GCA-004', 'available', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Trike 05', 'GCA-005', 'available', 'New battery installed March 2024'),
  ('22222222-2222-2222-2222-222222222222', 'Trike 06', 'GCA-006', 'out_of_service', 'Awaiting parts'),
  ('22222222-2222-2222-2222-222222222222', 'Trike 07', 'GCA-007', 'available', NULL),
  ('33333333-3333-3333-3333-333333333333', 'Trike 08', 'GCA-008', 'available', NULL),
  ('33333333-3333-3333-3333-333333333333', 'Trike 09', 'GCA-009', 'available', 'Premium model'),
  ('33333333-3333-3333-3333-333333333333', 'Trike 10', 'GCA-010', 'in_repair', 'Tyre replacement scheduled');

-- Seed data: Example issues
INSERT INTO public.issues (course_id, trike_id, issue_type, severity, status, description, reported_by_name, admin_notes, cost_estimate) VALUES
  ('11111111-1111-1111-1111-111111111111', (SELECT id FROM public.trikes WHERE name = 'Trike 03'), 'brakes', 'medium', 'in_repair', 'Brakes squeaking loudly and not responsive. Needs immediate attention.', 'Course Staff', 'Ordered new brake pads', 150.00),
  ('22222222-2222-2222-2222-222222222222', (SELECT id FROM public.trikes WHERE name = 'Trike 06'), 'breakdown', 'high', 'acknowledged', 'Complete electrical failure. Trike will not start at all.', 'Pro Shop', 'Waiting on diagnostic from mechanic', 500.00),
  ('33333333-3333-3333-3333-333333333333', (SELECT id FROM public.trikes WHERE name = 'Trike 10'), 'tyres', 'low', 'in_repair', 'Front left tyre is worn and needs replacement soon.', 'Maintenance Team', NULL, 80.00),
  ('11111111-1111-1111-1111-111111111111', (SELECT id FROM public.trikes WHERE name = 'Trike 01'), 'damage', 'low', 'resolved', 'Minor scratch on body panel from cart collision.', 'Course Staff', 'Buffed out, no repair needed', NULL);