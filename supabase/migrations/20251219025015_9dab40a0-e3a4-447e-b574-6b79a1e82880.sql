-- Remove the policy that allows course users to view their own course
DROP POLICY IF EXISTS "Course users can view their own course" ON public.courses;