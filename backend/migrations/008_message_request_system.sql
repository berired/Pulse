-- Message Request System Migration
-- Adds security for direct messages and group chat requests

-- Alter direct_messages table to add request tracking
-- Add status column (pending, accepted, declined, deleted)
-- Add request timestamp
ALTER TABLE direct_messages 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'declined', 'deleted'));

ALTER TABLE direct_messages 
ADD COLUMN IF NOT EXISTS is_request BOOLEAN DEFAULT FALSE;

ALTER TABLE direct_messages 
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;

-- Create direct_message_requests table for better tracking
CREATE TABLE IF NOT EXISTS direct_message_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_message_id UUID REFERENCES direct_messages(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(sender_id, receiver_id)
);

-- Create cohort_member_requests table for group chat invitations
CREATE TABLE IF NOT EXISTS cohort_member_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(cohort_id, user_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_direct_message_requests_receiver ON direct_message_requests(receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_direct_message_requests_sender ON direct_message_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_cohort_member_requests_user ON cohort_member_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_cohort_member_requests_cohort ON cohort_member_requests(cohort_id);

-- Enable Row Level Security
ALTER TABLE direct_message_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_member_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for direct_message_requests
CREATE POLICY "Users can view their own message requests" 
  ON direct_message_requests FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can create message requests" 
  ON direct_message_requests FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

CREATE POLICY "Receivers can update their received requests" 
  ON direct_message_requests FOR UPDATE USING (
    auth.uid() = receiver_id
  ) WITH CHECK (
    auth.uid() = receiver_id
  );

-- RLS Policies for cohort_member_requests
CREATE POLICY "Cohort members can view group requests" 
  ON cohort_member_requests FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM cohort_members WHERE cohort_id = cohort_member_requests.cohort_id)
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can request to join cohort" 
  ON cohort_member_requests FOR INSERT WITH CHECK (
    auth.uid() = invited_by
  );

CREATE POLICY "Users can respond to cohort requests" 
  ON cohort_member_requests FOR UPDATE USING (
    auth.uid() = user_id
  ) WITH CHECK (
    auth.uid() = user_id
  );
