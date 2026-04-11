-- Migration: Update Clinical Rotations Table Schema
-- Updates the clinical_rotations table to support individual rotation entries with hospital details

ALTER TABLE clinical_rotations
DROP COLUMN IF EXISTS rotation_type,
DROP COLUMN IF EXISTS start_date,
DROP COLUMN IF EXISTS end_date,
ADD COLUMN IF NOT EXISTS hospital_name VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS hospital_location VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS ward VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS time_period VARCHAR(255), -- e.g., "09:00 - 17:00" or "Morning Shift"
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update status column to allow proper values
ALTER TABLE clinical_rotations
ALTER COLUMN status SET DEFAULT 'In Progress';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_clinical_rotations_user_id_created ON clinical_rotations(user_id, created_at DESC);

-- Enable RLS if not already enabled
ALTER TABLE clinical_rotations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own clinical rotations" ON clinical_rotations;
DROP POLICY IF EXISTS "Users can create their own clinical rotations" ON clinical_rotations;
DROP POLICY IF EXISTS "Users can update their own clinical rotations" ON clinical_rotations;
DROP POLICY IF EXISTS "Users can delete their own clinical rotations" ON clinical_rotations;

-- Create RLS policies
CREATE POLICY "Users can view their own clinical rotations"
  ON clinical_rotations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own clinical rotations"
  ON clinical_rotations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own clinical rotations"
  ON clinical_rotations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own clinical rotations"
  ON clinical_rotations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
