-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'not_yet_reviewed', -- 'not_yet_reviewed', 'reviewing', 'done'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  admin_notes TEXT
);

-- Create index for faster queries
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Public can insert reports (create report)
CREATE POLICY "Anyone can create reports" ON reports
  FOR INSERT
  WITH CHECK (true);

-- Policy: Public can view their own reports
CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy: Admin can view all reports
CREATE POLICY "Admins can view all reports" ON reports
  FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy: Admin can update report status
CREATE POLICY "Admins can update reports" ON reports
  FOR UPDATE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy: Admin can delete reports
CREATE POLICY "Admins can delete reports" ON reports
  FOR DELETE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Create banned_ips table for IP banning
CREATE TABLE IF NOT EXISTS banned_ips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address INET NOT NULL UNIQUE,
  reason TEXT,
  banned_by UUID REFERENCES profiles(id),
  banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for IP lookups
CREATE INDEX idx_banned_ips_ip_address ON banned_ips(ip_address);

-- Enable RLS on banned_ips
ALTER TABLE banned_ips ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view banned IPs
CREATE POLICY "Admins can view banned IPs" ON banned_ips
  FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy: Only admins can insert banned IPs
CREATE POLICY "Admins can ban IPs" ON banned_ips
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy: Only admins can delete banned IPs
CREATE POLICY "Admins can unban IPs" ON banned_ips
  FOR DELETE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
