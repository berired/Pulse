-- Enable RLS on followers table and create policies
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all followers (for display purposes)
CREATE POLICY "Users can view all followers"
  ON followers FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can insert follows where they are the follower
CREATE POLICY "Users can follow other users"
  ON followers FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = follower_id
  );

-- Policy: Users can delete follows they created
CREATE POLICY "Users can unfollow"
  ON followers FOR DELETE
  TO authenticated
  USING (
    auth.uid() = follower_id
  );
