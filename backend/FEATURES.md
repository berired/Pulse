# Pulse Backend - Advanced Features

This document covers the advanced features added to the Pulse backend: Real-time Chat (Pusher), File Storage, Group Messaging, and Full-text Search.

## Table of Contents
1. [Real-time Chat with Pusher](#real-time-chat-with-pusher)
2. [File Storage](#file-storage)
3. [Group Messaging](#group-messaging)
4. [Full-text Search](#full-text-search)

---

## Real-time Chat with Pusher

### Overview
Pusher integration enables real-time message delivery and presence indicators without polling. Messages appear instantly across all connected clients.

### Configuration

**Environment Variables:**
```bash
PUSHER_KEY=deb9ef3876dca91710d7
PUSHER_SECRET=your_pusher_secret_here
PUSHER_ID=1234567
PUSHER_CLUSTER=ap1
PUSHER_ENCRYPTED=true

# Frontend
VITE_PUSHER_KEY=deb9ef3876dca91710d7
VITE_PUSHER_CLUSTER=ap1
```

**Installation:**
```bash
npm install pusher pusher-js
```

### Server-Side Usage

**Utilities (config/pusher.js):**

```javascript
import { emitMessageEvent, emitGroupMessageEvent, emitTypingIndicator } from './config/pusher.js';

// Send message event
await emitMessageEvent('direct-messages-user1-user2', 'new-message', {
  id: messageId,
  senderId: userId,
  content: messageBody,
  createdAt: timestamp,
});

// Typing indicator
await emitTypingIndicator('conversation-group1', userId, userName);

// Group message broadcast
await emitGroupMessageEvent('group-123', 'new-message', messageData);
```

### Channel Types

#### Private Channels
Used for 1-on-1 direct messaging:
- Format: `direct-messages-{userId1}-{userId2}`
- Only authenticated users in the conversation can access
- Uses Bearer token for authentication

**Example:**
```javascript
// Between user "alice" and user "bob"
const channel = `direct-messages-alice-bob`;
```

#### Presence Channels
Track active users in conversations:
- Format: `presence-conversation-{conversationId}`
- Returns list of currently connected users
- Triggers presence events: `subscribe`, `unsubscribe`

**Example:**
```javascript
const presenceChannel = `presence-conversation-123`;
// Automatically tracks who's online in that conversation
```

#### Group Channels
Multi-user messaging:
- Format: `group-messages-{groupId}`
- All group members receive events
- Used for team/cohort discussions

**Example:**
```javascript
const groupChannel = `group-messages-cohort-2024`;
```

### Frontend Integration (React/Vue)

**Direct Messages with Real-time Updates:**
```javascript
import Pusher from 'pusher-js';

const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER,
});

// Subscribe to conversation channel
const channel = `direct-messages-${userId}-${otherId}`;
const privateChannel = pusher.subscribe(channel);

// Listen for new messages
privateChannel.bind('new-message', (data) => {
  console.log('New message received:', data);
  // Update UI with message
});

// When user starts typing
const presenceChannel = pusher.subscribe(`presence-conversation-${conversationId}`);
presenceChannel.bind('user-typing', (data) => {
  console.log(`${data.userName} is typing...`);
});
```

### Events Emitted

| Event | Channel | Payload | Trigger |
|-------|---------|---------|---------|
| `new-message` | direct/group | id, senderId, content, createdAt | Message sent |
| `message-deleted` | direct/group | messageId, deletedAt | Message deleted |
| `user-typing` | presence | userId, userName, timestamp | User types |
| `user-online` | presence | userId, userName | User connects |
| `user-offline` | presence | userId, userName | User disconnects |

---

## File Storage

### Overview
Supabase Storage integration for secure document uploads with owner-based access control.

### Configuration

**Storage Bucket Setup:**
```sql
-- Create documents bucket in Supabase
-- Enable RLS policies for user-based access

-- Policy: Users can upload their own files
CREATE POLICY "Users can upload their own files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = owner);

-- Policy: Users can view their own files
CREATE POLICY "Users can view their own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = owner);
```

**Environment Variables:**
```bash
MAX_FILE_SIZE=52428800  # 50MB
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,png,jpg,jpeg,gif,zip
```

### API Endpoints

#### Upload File
```
POST /api/files/upload
Content-Type: multipart/form-data

Parameters:
- file: File (required)
- module: string (required) - 'notes', 'posts', 'careplans'
- context: string (optional) - contextual info

Response:
{
  "id": "file-123",
  "fileName": "document.pdf",
  "fileSize": 1024000,
  "fileType": "application/pdf",
  "url": "https://...",
  "uploadedAt": "2024-01-15T10:30:00Z",
  "module": "notes"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf" \
  -F "module=notes" \
  -F "context=Study material"
```

#### Get User Documents
```
GET /api/files?module=notes&limit=20&offset=0

Query Parameters:
- module: string (optional) - filter by module
- limit: number (default: 20)
- offset: number (default: 0)

Response:
{
  "documents": [
    {
      "id": "file-123",
      "fileName": "document.pdf",
      "fileSize": 1024000,
      "fileType": "application/pdf",
      "storageUrl": "https://...",
      "uploadedBy": "user-123",
      "module": "notes",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

#### Get Document Details
```
GET /api/files/:documentId

Response:
{
  "id": "file-123",
  "fileName": "document.pdf",
  "filePath": "notes/user-123/abc-def.pdf",
  "fileSize": 1024000,
  "fileType": "application/pdf",
  "storageUrl": "https://...",
  "uploadedBy": "user-123",
  "module": "notes",
  "context": "Study material",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Delete Document
```
DELETE /api/files/:documentId

Response:
{
  "success": true,
  "message": "Document deleted successfully",
  "id": "file-123"
}
```

### Database Schema

```sql
CREATE TABLE documents (
  id BIGINT PRIMARY KEY DEFAULT gen_random_bigint(),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(512) NOT NULL UNIQUE,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  storage_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  module VARCHAR(50) NOT NULL, -- 'notes', 'posts', 'careplans'
  context TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT file_size_limit CHECK (file_size <= 52428800)
);

CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_module ON documents(module);
```

### File Type Validation

Allowed file types (configurable):
- Documents: pdf, doc, docx, txt
- Images: png, jpg, jpeg, gif
- Archives: zip

Custom validation in `controllers/filesController.js`

---

## Group Messaging

### Overview
Extend direct messaging to support group conversations with multiple participants and shared message history.

### API Endpoints

#### Get User's Groups
```
GET /api/groups?limit=20&offset=0

Query Parameters:
- limit: number (default: 20)
- offset: number (default: 0)

Response:
{
  "groups": [
    {
      "id": "group-123",
      "name": "Clinical Cohort 2024",
      "description": "Group for cohort discussions",
      "createdBy": "user-456",
      "createdAt": "2024-01-10T08:00:00Z",
      "group_members": [
        { "count": 15 }
      ]
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

#### Create Group
```
POST /api/groups

Body:
{
  "name": "Clinical Cohort 2024",
  "description": "Group for cohort discussions",
  "memberIds": ["user-1", "user-2", "user-3"]
}

Response:
{
  "id": "group-123",
  "name": "Clinical Cohort 2024",
  "description": "Group for cohort discussions",
  "createdBy": "user-current",
  "createdAt": "2024-01-15T10:30:00Z",
  "memberCount": 4  // includes creator
}
```

#### Update Group
```
PATCH /api/groups/:groupId

Body:
{
  "name": "Updated Group Name",
  "description": "Updated description"
}

Response:
{
  "id": "group-123",
  "name": "Updated Group Name",
  "description": "Updated description",
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Get Group Messages
```
GET /api/groups/:groupId/messages?limit=50&offset=0

Query Parameters:
- limit: number (default: 50) - messages per page
- offset: number (default: 0) - pagination offset

Response:
{
  "messages": [
    {
      "id": "msg-1",
      "groupId": "group-123",
      "userId": "user-1",
      "content": "Hello team!",
      "sender": {
        "id": "user-1",
        "name": "Alice",
        "email": "alice@example.com"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 250,
  "limit": 50,
  "offset": 0
}
```

#### Send Message to Group
```
POST /api/groups/:groupId/messages

Body:
{
  "content": "This is a group message"
}

Response:
{
  "id": "msg-123",
  "groupId": "group-456",
  "content": "This is a group message",
  "sender": {
    "id": "user-1",
    "name": "Alice",
    "email": "alice@example.com"
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Real-time Event:**
- Channel: `group-messages-{groupId}`
- Event: `new-message`
- All group members notified via Pusher

#### Delete Group Message
```
DELETE /api/groups/:groupId/messages/:messageId

Response:
{
  "success": true,
  "message": "Message deleted"
}
```

#### Get Group Members
```
GET /api/groups/:groupId/members

Response:
{
  "members": [
    {
      "userId": "user-1",
      "user": {
        "id": "user-1",
        "name": "Alice",
        "email": "alice@example.com"
      },
      "joinedAt": "2024-01-10T08:00:00Z"
    }
  ]
}
```

#### Add Member to Group
```
POST /api/groups/:groupId/members

Body:
{
  "userId": "user-new"
}

Response:
{
  "success": true,
  "message": "Member added",
  "memberId": "user-new"
}
```

#### Remove Member from Group
```
DELETE /api/groups/:groupId/members/:memberId

Response:
{
  "success": true,
  "message": "Member removed"
}
```

### Database Schema

```sql
CREATE TABLE message_groups (
  id BIGINT PRIMARY KEY DEFAULT gen_random_bigint(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE group_members (
  id BIGINT PRIMARY KEY DEFAULT gen_random_bigint(),
  group_id BIGINT NOT NULL REFERENCES message_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(group_id, user_id)
);

CREATE TABLE group_messages (
  id BIGINT PRIMARY KEY DEFAULT gen_random_bigint(),
  group_id BIGINT NOT NULL REFERENCES message_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_messages_group ON group_messages(group_id);
CREATE INDEX idx_group_messages_created ON group_messages(created_at DESC);
```

---

## Full-text Search

### Overview
PostgreSQL-based full-text search across notes, posts, wiki pages, schedules, and messages with autocomplete and search history.

### Configuration

**Environment Variables:**
```bash
SEARCH_LIMIT=20          # Default results per query
SEARCH_MIN_CHARS=2       # Minimum search term length
```

### API Endpoints

#### Global Search
```
GET /api/search?q=nursing&limit=20&offset=0

Query Parameters:
- q: string (required) - search term (min 2 chars)
- limit: number (default: 20) - max 100
- offset: number (default: 0)

Response:
{
  "query": "nursing",
  "results": [
    {
      "id": "note-123",
      "type": "note",
      "title": "Nursing Fundamentals",
      "excerpt": "Introduction to nursing principles...",
      "metadata": {
        "subject": "Fundamentals",
        "yearLevel": "1st Year",
        "authorId": "user-1"
      },
      "createdAt": "2024-01-10T08:00:00Z"
    },
    {
      "id": "post-456",
      "type": "post",
      "title": "Best nursing practices",
      "excerpt": "Discussion about nursing care...",
      "metadata": {
        "category": "General",
        "authorId": "user-2"
      },
      "createdAt": "2024-01-12T14:30:00Z"
    }
  ],
  "total": 2,
  "limit": 20
}
```

**Searches in (in order of priority):**
1. Notes (title, content, subject)
2. Posts (title, content, category)
3. Wiki Pages (title, content - public only)
4. Schedules (event name, description)
5. Messages (content - user's own messages)

#### Search Notes by Subject
```
GET /api/search/notes?query=anatomy&subject=Pathology&limit=20

Query Parameters:
- query: string (required)
- subject: string (optional)
- limit: number (default: 20)

Response:
{
  "results": [
    {
      "id": "note-123",
      "title": "Cardiovascular Anatomy",
      "content": "...",
      "subject": "Pathology",
      "yearLevel": "2nd Year",
      "authorId": "user-1",
      "createdAt": "2024-01-10T08:00:00Z"
    }
  ],
  "query": "anatomy"
}
```

#### Search Posts by Category
```
GET /api/search/posts?query=rotation&category=Clinical&limit=20

Query Parameters:
- query: string (required)
- category: string (optional)
- limit: number (default: 20)

Response:
{
  "results": [
    {
      "id": "post-456",
      "title": "ICU Rotation Experience",
      "content": "...",
      "category": "Clinical",
      "authorId": "user-2",
      "createdAt": "2024-01-12T14:30:00Z"
    }
  ],
  "query": "rotation"
}
```

#### Autocomplete Notes
```
GET /api/autocomplete/notes?prefix=car&limit=10

Query Parameters:
- prefix: string (required, min 2 chars)
- limit: number (default: 10)

Response:
{
  "suggestions": [
    {
      "id": "note-123",
      "label": "Cardiovascular System"
    },
    {
      "id": "note-124",
      "label": "Cardiac Assessment"
    }
  ]
}
```

#### Autocomplete Posts
```
GET /api/autocomplete/posts?prefix=nur&limit=10

Query Parameters:
- prefix: string (required)
- limit: number (default: 10)

Response:
{
  "suggestions": [
    {
      "id": "post-1",
      "label": "Nursing Care Plans"
    },
    {
      "id": "post-2",
      "label": "Nursing Ethics Discussion"
    }
  ]
}
```

#### Get Recent Searches
```
GET /api/search/recent?limit=10

Query Parameters:
- limit: number (default: 10)

Response:
{
  "searches": [
    {
      "id": "search-1",
      "userId": "user-1",
      "query": "anatomy",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Save Search to History
```
POST /api/search/save

Body:
{
  "query": "pharmacology"
}

Response:
{
  "saved": true,
  "id": "search-123"
}
```

### Search Operators

#### Case-Insensitive Search
```
GET /api/search?q=NURSING
// Matches: nursing, Nursing, NURSING
```

#### Partial Word Matching
```
GET /api/search?q=nurs
// Matches: nursing, nurse, nurturing
```

#### Multi-word Search
```
GET /api/search?q=nursing care
// Matches content with both words (anywhere in text)
```

### Database Schema

```sql
-- Add search history table
CREATE TABLE search_history (
  id BIGINT PRIMARY KEY DEFAULT gen_random_bigint(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  query VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_created ON search_history(created_at DESC);

-- Add FTS indexes on searchable tables
ALTER TABLE notes ADD COLUMN search_vector tsvector;
CREATE INDEX idx_notes_search ON notes USING GIN(search_vector);

ALTER TABLE posts ADD COLUMN search_vector tsvector;
CREATE INDEX idx_posts_search ON posts USING GIN(search_vector);

ALTER TABLE wikipages ADD COLUMN search_vector tsvector;
CREATE INDEX idx_wikipages_search ON wikipages USING GIN(search_vector);
```

### Performance Tips

1. **Limit Results**: Use `limit` parameter to reduce response size
2. **Indexed Tables**: Search uses database indexes for fast lookups
3. **Pagination**: Use `offset` for large result sets
4. **Minimum Query Length**: Enforced at 2 characters to avoid noise

---

## Demo Usage

### Complete Flow Example

```bash
# 1. Register and get token
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "secure123"
  }'

# 2. Connect to Pusher (frontend)
const pusher = new Pusher(PUSHER_KEY, { cluster: 'ap1' });

# 3. Upload a document
curl -X POST http://localhost:5000/api/files/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@study_guide.pdf" \
  -F "module=notes"

# 4. Create a group
curl -X POST http://localhost:5000/api/groups \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cohort 2024",
    "memberIds": ["user-2", "user-3"]
  }'

# 5. Send group message (real-time via Pusher)
curl -X POST http://localhost:5000/api/groups/group-123/messages \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "How is the rotation going?"}'

# 6. Search across modules
curl http://localhost:5000/api/search?q=cardiology \
  -H "Authorization: Bearer TOKEN"

# 7. Autocomplete
curl http://localhost:5000/api/autocomplete/notes?prefix=car \
  -H "Authorization: Bearer TOKEN"
```

---

## Troubleshooting

### Pusher Issues
- **Connection refused**: Verify Pusher credentials in .env
- **Messages not appearing**: Check channel subscription on frontend
- **Authentication error**: Ensure Bearer token is valid

### File Upload Issues
- **413 Payload Too Large**: File exceeds MAX_FILE_SIZE (50MB default)
- **415 Unsupported Media Type**: File type not in ALLOWED_FILE_TYPES
- **403 Forbidden**: User not authenticated

### Search Issues
- **No results**: Query too short (min 2 chars) or terms not in database
- **Slow searches**: Add indexes on searchable columns
- **Case mismatch**: Search is case-insensitive (use .ilike)

### Group Messaging Issues
- **403 Forbidden**: User not a group member
- **404 Not Found**: Group or message doesn't exist
- **Real-time not working**: Check Pusher subscription on frontend

---

## Next Steps

1. **WebSocket Migration**: Replace Pusher polling with native WebSockets for on-premise deployments
2. **Search Analytics**: Track popular search terms and optimize results
3. **File Versioning**: Implement document version history and recovery
4. **Encryption**: Add end-to-end encryption for sensitive documents
5. **Notification System**: Build notification center for mentions and replies

