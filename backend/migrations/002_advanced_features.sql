-- Migration: Add advanced features (Real-time, Storage, Groups, Search)
-- Run in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============= FILE STORAGE =============
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(512) NOT NULL UNIQUE,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  storage_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module VARCHAR(50) NOT NULL, -- 'notes', 'posts', 'careplans', etc
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT file_size_limit CHECK (file_size <= 52428800) -- 50MB max
);

CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_module ON documents(module);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);

-- RLS Policies for documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can upload their own files"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can view their own files"
  ON documents FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own files"
  ON documents FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- ============= GROUP MESSAGING =============
CREATE TABLE IF NOT EXISTS message_groups (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_groups_created_by ON message_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_message_groups_created ON message_groups(created_at DESC);

CREATE TABLE IF NOT EXISTS group_members (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES message_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_joined ON group_members(joined_at DESC);

CREATE TABLE IF NOT EXISTS group_messages (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES message_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_user_id ON group_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created ON group_messages(created_at DESC);

-- RLS Policies for group messaging
ALTER TABLE message_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see groups they're members of"
  ON message_groups FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups"
  ON message_groups FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update groups they created"
  ON message_groups FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can see group members of their groups"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add themselves to groups"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can see group messages they're members of"
  ON group_messages FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send group messages they're members of"
  ON group_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own group messages"
  ON group_messages FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============= SEARCH HISTORY =============
CREATE TABLE IF NOT EXISTS search_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON search_history(created_at DESC);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own search history"
  ON search_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can save searches"
  ON search_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============= SEARCH VECTORS (FTS) =============
-- Add full-text search vectors to existing tables

-- For notes
ALTER TABLE IF EXISTS notes ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(subject, '')), 'C')
) STORED;

CREATE INDEX IF NOT EXISTS idx_notes_search_vector ON notes USING GIN (search_vector);

-- For posts
ALTER TABLE IF EXISTS posts ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', COALESCE(content, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(category, '')), 'B')
) STORED;

CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON posts USING GIN (search_vector);

-- For wikipages
ALTER TABLE IF EXISTS wiki_pages ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(content::text, '')), 'B')
) STORED;

CREATE INDEX IF NOT EXISTS idx_wiki_pages_search_vector ON wiki_pages USING GIN (search_vector);

-- ============= STORAGE BUCKET =============
-- Create storage bucket for documents
-- Run these in Supabase SQL or use Storage UI:
-- 1. Create bucket: "documents"
-- 2. Set bucket to private
-- 3. Add RLS policies for file uploads/downloads

-- Example storage policy:
-- CREATE POLICY "Allow authenticated uploads"
--   ON storage.objects
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============= VERIFY TABLES =============
-- Run these to verify all tables were created

SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('documents', 'message_groups', 'group_members', 'group_messages', 'search_history')
ORDER BY table_name;

-- ============= OPTIONAL: CLEANUP =============
-- Only run if you need to remove this feature entirely:

-- DROP TABLE IF EXISTS search_history;
-- DROP TABLE IF EXISTS group_messages;
-- DROP TABLE IF EXISTS group_members;
-- DROP TABLE IF EXISTS message_groups;
-- DROP TABLE IF EXISTS documents;
