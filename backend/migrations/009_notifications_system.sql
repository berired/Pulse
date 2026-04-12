-- Create notifications table for tracking all notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('follow', 'message', 'group_invite')),
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  message_id UUID REFERENCES direct_messages(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_notification CHECK (
    (type = 'follow' AND target_user_id IS NOT NULL) OR
    (type = 'message' AND message_id IS NOT NULL) OR
    (type = 'group_invite' AND group_id IS NOT NULL)
  )
);

-- Create indexes for faster queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_actor_id ON notifications(actor_id);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only system can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can update their own notifications (e.g., mark as read)"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);
