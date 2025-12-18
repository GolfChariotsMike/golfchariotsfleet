-- Create asset type enum
CREATE TYPE public.asset_type AS ENUM ('trike', 'scooter');

-- Add asset_type column to trikes table
ALTER TABLE public.trikes ADD COLUMN asset_type asset_type NOT NULL DEFAULT 'trike';