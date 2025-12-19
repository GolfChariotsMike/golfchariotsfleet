-- Create off-site locations table
CREATE TABLE public.offsite_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offsite_locations ENABLE ROW LEVEL SECURITY;

-- Admins can manage locations
CREATE POLICY "Admins can do everything with offsite_locations" 
ON public.offsite_locations 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- All authenticated users can view locations
CREATE POLICY "Authenticated users can view offsite_locations" 
ON public.offsite_locations 
FOR SELECT 
TO authenticated
USING (true);

-- Insert the existing locations
INSERT INTO public.offsite_locations (name) VALUES 
  ('Wangara'),
  ('Wembley Downs'),
  ('Greenwood');