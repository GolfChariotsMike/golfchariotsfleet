-- Make course_id nullable so assets can be at off-site locations instead
ALTER TABLE public.trikes ALTER COLUMN course_id DROP NOT NULL;

-- Add location field for off-site storage/workshop locations
ALTER TABLE public.trikes ADD COLUMN location text;

-- Add check constraint to ensure asset has either course_id or location (but not both, and not neither)
ALTER TABLE public.trikes ADD CONSTRAINT asset_location_check 
  CHECK (
    (course_id IS NOT NULL AND location IS NULL) OR 
    (course_id IS NULL AND location IS NOT NULL)
  );

-- Update RLS policies to allow admins to manage assets at any location
-- The existing admin policy already covers this since it uses has_role check