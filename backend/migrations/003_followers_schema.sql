-- Create followers table for tracking follow relationships
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Create index for faster queries on following_id (for finding followers of a user)
CREATE INDEX idx_followers_following_id ON followers(following_id);

-- Create index for faster queries on follower_id (for finding who a user is following)
CREATE INDEX idx_followers_follower_id ON followers(follower_id);

-- Create index for created_at for sorting by most recent follows
CREATE INDEX idx_followers_created_at ON followers(created_at DESC);
