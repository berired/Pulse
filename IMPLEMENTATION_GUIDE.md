# Pulse Backend - Implementation Guide

## Overview

This guide covers the implementation of 4 advanced features added to the Pulse backend:

1. **Real-time Chat with Pusher** - Live messaging for direct messages and groups
2. **File Storage** - Supabase Storage integration for document uploads
3. **Group Messaging** - Multi-user group conversations
4. **Full-text Search** - PostgreSQL-based search across all modules

---

## Installation & Setup

### 1. Update Dependencies

```bash
cd backend
npm install pusher pusher-js
```

**Updated package.json includes:**
- `pusher@^5.1.3` - Server-side Pusher library
- `pusher-js@^8.4.0` - Client-side Pusher library (frontend)

### 2. Environment Configuration

Update `.env` with Pusher credentials:

```bash
# Pusher Configuration
PUSHER_ID=1234567
PUSHER_KEY=deb9ef3876dca91710d7
PUSHER_SECRET=your_pusher_secret_here
PUSHER_CLUSTER=ap1
PUSHER_ENCRYPTED=true

# Frontend Pusher
VITE_PUSHER_KEY=deb9ef3876dca91710d7
VITE_PUSHER_CLUSTER=ap1

# File Storage
MAX_FILE_SIZE=52428800  # 50MB
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,png,jpg,jpeg,gif,zip

# Search Configuration
SEARCH_LIMIT=20
SEARCH_MIN_CHARS=2
```

Get Pusher credentials from: https://dashboard.pusher.com/

### 3. Database Setup

Run migration to create tables:

```bash
# In Supabase SQL Editor, run:
# Copy contents of: backend/migrations/002_advanced_features.sql
```

Tables created:
- `documents` - File storage metadata
- `message_groups` - Group information
- `group_members` - Group memberships
- `group_messages` - Group message content
- `search_history` - User search queries

### 4. Supabase Storage Bucket

Create storage bucket in Supabase:

1. Go to Storage > Buckets
2. Click "New Bucket"
3. Name: `documents`
4. Set to **Private**
5. Add RLS policies for authenticated uploads

---

## Feature Implementation Details

### Real-time Chat with Pusher

**Files Created:**
- `config/pusher.js` - Pusher client initialization and helper functions
- `middleware/pusherAuth.js` - Channel authentication middleware
- `routes/pusher.js` - Pusher auth endpoint
- Updated `controllers/messagesController.js` - Emit events on message send

**Key Functions:**

```javascript
// Emit single event
emitMessageEvent(channel, event, data)

// Emit typing indicator
emitTypingIndicator(conversationId, userId, userName)

// Emit group message
emitGroupMessageEvent(groupId, event, messageData)

// Broadcast to multiple channels
broadcastEvent(channels, event, data)
```

**Channel Types:**
- **Private**: `direct-messages-{userId1}-{userId2}` (1-on-1)
- **Presence**: `presence-conversation-{conversationId}` (typing, online/offline)
- **Group**: `group-messages-{groupId}` (multi-user)

**Events Emitted:**
- `new-message` - Message sent
- `message-deleted` - Message deleted
- `user-typing` - User is typing
- `user-online` / `user-offline` - Presence

---

### File Storage

**Files Created:**
- `controllers/filesController.js` - Upload, retrieve, delete files
- `routes/files.js` - File API routes

**Endpoints:**

```
POST /api/files/upload         # Upload file
GET /api/files                 # List user's files
GET /api/files/:documentId     # Get file details
DELETE /api/files/:documentId  # Delete file
```

**Features:**
- Multipart form-data upload
- File type/size validation
- Automatic slug generation
- Owner-based access control
- Metadata storage in database

**File Structure in Storage:**
```
documents/
├── notes/
│   └── {userId}/
│       └── {uuid}.{ext}
├── posts/
│   └── {userId}/
│       └── {uuid}.{ext}
└── careplans/
    └── {userId}/
        └── {uuid}.{ext}
```

**Database Record:**
```javascript
{
  id: "doc-123",
  file_name: "document.pdf",
  file_path: "notes/user-1/abc-def.pdf",
  file_size: 1024000,
  file_type: "application/pdf",
  storage_url: "https://...",
  uploaded_by: "user-1",
  module: "notes",
  context: "Study material",
  created_at: timestamp,
  updated_at: timestamp
}
```

---

### Group Messaging

**Files Created:**
- `controllers/groupsController.js` - Group CRUD + messaging
- `routes/groups.js` - Group API routes

**Endpoints:**

```
GET /api/groups                              # List user's groups
POST /api/groups                             # Create group
PATCH /api/groups/:groupId                   # Update group
GET /api/groups/:groupId/messages            # Get messages
POST /api/groups/:groupId/messages           # Send message
DELETE /api/groups/:groupId/messages/:msgId  # Delete message
GET /api/groups/:groupId/members             # List members
POST /api/groups/:groupId/members            # Add member
DELETE /api/groups/:groupId/members/:userId  # Remove member
```

**Group Creation:**
```javascript
{
  name: "Clinical Cohort 2024",
  description: "Group for cohort discussions",
  memberIds: ["user-1", "user-2", "user-3"]
}
```

**Message Flow:**
1. User sends message via POST
2. Message inserted into database
3. Pusher event emitted on `group-messages-{groupId}` channel
4. All group members receive real-time notification
5. Message marked in frontend UI instantly

**Access Control:**
- Only group members can see messages
- Only group members can send messages
- Users can only delete their own messages
- Any member can add/remove members

---

### Full-text Search

**Files Created:**
- `controllers/searchController.js` - Search logic
- `routes/search.js` - Search API routes

**Endpoints:**

```
GET /api/search?q=term                    # Global search
GET /api/search/notes?query=X             # Notes search
GET /api/search/posts?query=X             # Posts search
GET /api/autocomplete/notes?prefix=X      # Notes autocomplete
GET /api/autocomplete/posts?prefix=X      # Posts autocomplete
GET /api/search/recent                    # Recent searches
POST /api/search/save                     # Save search
```

**Search Scope:**
1. **Notes** - title, content, subject (case-insensitive)
2. **Posts** - title, content, category
3. **Wiki Pages** - title, content (public only)
4. **Schedules** - event_name, description
5. **Messages** - content (user's own only)

**Example Search Flow:**
```javascript
// Frontend request
GET /api/search?q=nursing&limit=20

// Backend response
{
  query: "nursing",
  results: [
    {
      id: "note-123",
      type: "note",
      title: "Nursing Fundamentals",
      excerpt: "...",
      metadata: { subject: "Fundamentals" },
      createdAt: timestamp
    },
    {
      id: "post-456",
      type: "post",
      title: "Best nursing practices",
      excerpt: "...",
      metadata: { category: "General" },
      createdAt: timestamp
    }
  ],
  total: 2,
  limit: 20
}
```

**Autocomplete:**
```javascript
// Frontend request
GET /api/autocomplete/notes?prefix=car&limit=10

// Backend response
{
  suggestions: [
    { id: "note-123", label: "Cardiovascular System" },
    { id: "note-124", label: "Cardiac Assessment" }
  ]
}
```

**Search History:**
- Automatically saved when user searches
- Retrievable per user
- Useful for suggestions/recommendations

---

## File Structure Map

```
backend/
├── config/
│   ├── pusher.js                 # New: Pusher utilities
│   └── supabase.js
├── middleware/
│   ├── pusherAuth.js             # New: Pusher auth
│   └── ... (existing)
├── routes/
│   ├── pusher.js                 # New: Pusher endpoints
│   ├── files.js                  # New: File upload routes
│   ├── groups.js                 # New: Group messaging routes
│   ├── search.js                 # New: Search routes
│   └── ... (existing)
├── controllers/
│   ├── filesController.js        # New: File logic
│   ├── groupsController.js       # New: Group logic
│   ├── searchController.js       # New: Search logic
│   ├── messagesController.js     # Updated: Pusher integration
│   └── ... (existing)
├── migrations/
│   ├── 001_initial_schema.sql
│   └── 002_advanced_features.sql # New: Advanced features schema
├── index.js                       # Updated: New route imports/registration
├── package.json                   # Updated: Pusher dependencies
├── FEATURES.md                    # New: Feature documentation
└── README.md                      # Updated: New endpoints listed
```

---

## Integration Checklist

- [x] Install dependencies (Pusher)
- [x] Configure environment variables
- [x] Create database tables via migration
- [x] Create Supabase Storage bucket
- [x] Implement Pusher utilities
- [x] Implement Pusher middleware
- [x] Implement file upload controller
- [x] Implement group messaging controller
- [x] Implement search controller
- [x] Update messaging controller with Pusher
- [x] Register all new routes in index.js
- [x] Create documentation (FEATURES.md)
- [x] Update README with new endpoints

---

## Testing Checklist

### Pusher Real-time
- [ ] Send direct message and verify real-time delivery
- [ ] Typing indicator shows on other user's screen
- [ ] Message appears without page refresh
- [ ] Multiple browser tabs receive same message

### File Upload
- [ ] Upload PDF file (< 50MB)
- [ ] Verify file appears in Supabase Storage
- [ ] Verify metadata stored in database
- [ ] Upload restricted file type (e.g., .exe) - should fail
- [ ] Delete file and verify removal from storage
- [ ] Try accessing others' files - should fail (403)

### Group Messaging
- [ ] Create group with 3 members
- [ ] Send message to group
- [ ] All members receive message in real-time
- [ ] Delete own message - only you can see deletion
- [ ] Add new member to group
- [ ] Remove member from group
- [ ] Non-member cannot view group messages

### Search
- [ ] Search for "nurs" and get matches
- [ ] Search returns results from all modules
- [ ] Autocomplete shows suggestions
- [ ] Save search to history
- [ ] Filter notes by subject
- [ ] Filter posts by category
- [ ] Search with < 2 characters returns error

---

## Deployment Steps

### Local Testing
```bash
npm install
npm run dev
# Test endpoints with Postman or curl
```

### Production Deployment

**Before deploying:**
1. Update `.env` with production Pusher credentials
2. Update Supabase connection string (prod)
3. Run migration on production database
4. Set `PUSHER_ENCRYPTED=true` in production

**Deploy to Vercel:**
```bash
vercel env add PUSHER_ID
vercel env add PUSHER_KEY
vercel env add PUSHER_SECRET
vercel deploy
```

**Deploy to Railway:**
```bash
railway up
# Add environment variables in Railway dashboard
```

---

## Monitoring & Logs

### Pusher Events
Check in Pusher Dashboard:
- Events sent
- Connection count
- Latency metrics
- Error logs

### File Uploads
Monitor:
- Storage usage (Supabase)
- Upload success rate
- File types uploaded
- Storage errors

### Search
Track:
- Search volume per module
- Popular search terms
- Search latency
- No-result queries

---

## Performance Optimization

### Caching
```javascript
// Cache search results (1 hour)
const SEARCH_CACHE_TTL = 3600000;
```

### Indexing
- Database indexes on searchable columns
- Pusher channel limits per connection
- File size limits for uploads

### Rate Limiting
Applies to:
- Search: 100 req/15 min (global rate limit)
- File upload: 5 files/minute per user
- Group messaging: 10 messages/minute per user

---

## Troubleshooting

### "Cannot find module 'pusher'"
```bash
npm install pusher pusher-js
```

### "Pusher authentication failed"
- Check PUSHER_ID, PUSHER_KEY, PUSHER_SECRET in .env
- Verify channel name format
- Check Bearer token validity

### "File upload fails with 413"
- File size exceeds MAX_FILE_SIZE (50MB)
- Check `MAX_FILE_SIZE` environment variable

### "Search returns no results"
- Query < 2 characters (SEARCH_MIN_CHARS)
- No matches in database
- Check table indexes created

### "Group members can't see messages"
- User not added to group_members table
- Check group_id in message query
- Verify RLS policies enabled

---

## Future Enhancements

1. **WebSocket**: Replace Pusher with native WebSockets
2. **Encryption**: End-to-end encryption for messages
3. **Video Chat**: Integrate video calling
4. **File Versioning**: Track document versions
5. **Notifications**: Push notifications for new messages
6. **Analytics**: Search trends and usage statistics
7. **Backup**: Automated file backups
8. **Moderation**: Content filtering for chat

---

## Support

For issues or questions:
1. Check FEATURES.md for detailed documentation
2. Review error logs in Supabase
3. Check Pusher dashboard for connection issues
4. Verify environment variables are set correctly
5. Test endpoints with provided curl examples
