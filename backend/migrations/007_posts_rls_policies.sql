-- Migration: Enable RLS and Create Policies for Posts Table
-- This allows users to update and delete their own posts

-- ============= ENABLE RLS ON POSTS TABLE =============
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ============= DROP EXISTING POLICIES (if any) =============
DROP POLICY IF EXISTS "Users can view all posts" ON posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
DROP POLICY IF EXISTS "Service role can manage all posts" ON posts;

-- ============= CREATE SELECT POLICY =============
-- All authenticated users can view all posts
CREATE POLICY "Users can view all posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

-- ============= CREATE INSERT POLICY =============
-- Users can create posts (author_id will be set to their auth.uid())
CREATE POLICY "Users can create their own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- ============= CREATE UPDATE POLICY =============
-- Users can only update their own posts
CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- ============= CREATE DELETE POLICY =============
-- Users can only delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- ============= SERVICE ROLE CAN MANAGE ALL =============
-- Allow service role for admin operations
CREATE POLICY "Service role can manage all posts"
  ON posts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============= ENABLE RLS ON POST_COMMENTS TABLE =============
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- ============= DROP EXISTING COMMENT POLICIES (if any) =============
DROP POLICY IF EXISTS "Users can view all comments" ON post_comments;
DROP POLICY IF EXISTS "Users can create comments" ON post_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON post_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON post_comments;
DROP POLICY IF EXISTS "Service role can manage all comments" ON post_comments;

-- ============= CREATE COMMENT POLICIES =============
CREATE POLICY "Users can view all comments"
  ON post_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON post_comments FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update their own comments"
  ON post_comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON post_comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Service role can manage all comments"
  ON post_comments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============= ENABLE RLS ON VOTES TABLE =============
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- ============= DROP EXISTING VOTE POLICIES (if any) =============
DROP POLICY IF EXISTS "Users can view all votes" ON votes;
DROP POLICY IF EXISTS "Users can create votes" ON votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON votes;
DROP POLICY IF EXISTS "Service role can manage all votes" ON votes;

-- ============= CREATE VOTE POLICIES =============
CREATE POLICY "Users can view all votes"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create votes"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own votes"
  ON votes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own votes"
  ON votes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all votes"
  ON votes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
