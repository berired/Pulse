# Pulse Backend API

Clinical workspace for nursing students - Express.js Backend API

## 📋 Project Structure

```
backend/
├── index.js                      # Main server entry point
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies
├── config/
│   ├── supabase.js              # Supabase client initialization
│   └── pusher.js                # Pusher real-time messaging config
├── middleware/
│   ├── auth.js                  # JWT authentication middleware
│   ├── errorHandler.js          # Global error handling
│   ├── rateLimit.js             # Rate limiting configuration
│   └── pusherAuth.js            # Pusher channel authentication
├── routes/
│   ├── health.js                # Health check endpoint
│   ├── notes.js                 # Knowledge Exchange routes
│   ├── posts.js                 # Breakroom Forum routes
│   ├── messages.js              # Direct Messaging routes
│   ├── schedules.js             # Clinical Schedule routes
│   ├── rotations.js             # Clinical Rotations & Tasks routes
│   ├── careplans.js             # Care Plan Builder routes
│   ├── wikipages.js             # Personal Wiki routes
│   ├── files.js                 # File Upload & Storage routes (NEW)
│   ├── groups.js                # Group Messaging routes (NEW)
│   ├── search.js                # Full-text Search routes (NEW)
│   └── pusher.js                # Pusher authentication routes (NEW)
├── controllers/
│   ├── notesController.js       # Knowledge Exchange logic
│   ├── postsController.js       # Breakroom Forum logic
│   ├── messagesController.js    # Messaging logic (+ Pusher integration)
│   ├── schedulesController.js   # Schedule logic
│   ├── rotationsController.js   # Rotation & Task logic
│   ├── careplansController.js   # Care Plan logic
│   ├── wikipagesController.js   # Wiki Page logic
│   ├── filesController.js       # File upload logic (NEW)
│   ├── groupsController.js      # Group messaging logic (NEW)
│   └── searchController.js      # Full-text search logic (NEW)
└── migrations/
    ├── 001_initial_schema.sql        # PostgreSQL base schema
    └── 002_advanced_features.sql     # Advanced features (NEW)
```

## ✨ New Features

### Real-time Chat (Pusher)
- Live message delivery for direct messages and group chats
- Typing indicators and presence tracking
- Channel-based authentication

### File Storage
- Supabase Storage integration
- Document upload with owner-based access control
- File management and deletion

### Group Messaging
- Multi-user group conversations
- Group member management
- Real-time event broadcasting

### Full-text Search
- Global search across all modules
- Module-specific search with filters
- Autocomplete suggestions
- Search history tracking

For detailed documentation, see [FEATURES.md](./FEATURES.md)

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase project with database configured
- `.env` file with required configuration

### Installation

```bash
cd backend
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Running the Server

**Development Mode (with hot reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

Server will start on `http://localhost:5000` (or port specified in `.env`)

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Server health status (no auth required)

### Knowledge Exchange (Notes)
- `GET /api/notes` - Get all notes (with filtering: subject, yearLevel, search, sortBy)
- `POST /api/notes` - Create new note
- `PATCH /api/notes/:id` - Update note (owner only)
- `DELETE /api/notes/:id` - Delete note (owner only)
- `POST /api/notes/:id/rate` - Rate a note (1-5 stars)

### Breakroom Forum (Posts)
- `GET /api/posts` - Get all posts (with filtering: category, search, sortBy)
- `POST /api/posts` - Create new post
- `PATCH /api/posts/:id` - Update post (owner only)
- `DELETE /api/posts/:id` - Delete post (owner only)
- `POST /api/posts/:id/vote` - Vote on post (upvote/downvote)

### Direct Messaging
- `GET /api/messages/:userId` - Get conversation with user
- `POST /api/messages/:userId` - Send message to user
- `PATCH /api/messages/:messageId/read` - Mark message as read

### Clinical Schedule
- `GET /api/schedules` - Get user's schedule events (with filtering: eventType, startDate, endDate)
- `POST /api/schedules` - Create schedule event
- `PATCH /api/schedules/:id` - Update schedule event (owner only)
- `DELETE /api/schedules/:id` - Delete schedule event (owner only)

### Clinical Rotations
- `GET /api/rotations` - Get user's rotations (with filtering: status)
- `POST /api/rotations` - Create rotation
- `PATCH /api/rotations/:id` - Update rotation (owner only)
- `DELETE /api/rotations/:id` - Delete rotation (owner only)

### Rotation Tasks
- `GET /api/rotations/:rotationId/tasks` - Get tasks for rotation
- `POST /api/rotations/:rotationId/tasks` - Create task
- `PATCH /api/rotations/:rotationId/tasks/:taskId` - Update task (owner only)
- `DELETE /api/rotations/:rotationId/tasks/:taskId` - Delete task (owner only)

### Care Plans
- `GET /api/careplans` - Get user's care plans (with filtering: templateType, isTemplate)
- `POST /api/careplans` - Create care plan
- `PATCH /api/careplans/:id` - Update care plan (owner only)
- `DELETE /api/careplans/:id` - Delete care plan (owner only)

### Wiki Pages
- `GET /api/wikipages` - Get user's wiki pages (root level)
- `POST /api/wikipages` - Create wiki page
- `PATCH /api/wikipages/:id` - Update wiki page (owner only)
- `DELETE /api/wikipages/:id` - Delete wiki page (owner only)
- `GET /api/wikipages/:userId/:slug` - Get public wiki page by slug

### File Storage (NEW)
- `POST /api/files/upload` - Upload file to Supabase Storage
- `GET /api/files` - Get user's documents (with filtering: module, limit, offset)
- `GET /api/files/:documentId` - Get document details
- `DELETE /api/files/:documentId` - Delete document (owner only)

### Group Messaging (NEW)
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create new group
- `PATCH /api/groups/:groupId` - Update group (creator only)
- `GET /api/groups/:groupId/messages` - Get group messages
- `POST /api/groups/:groupId/messages` - Send message to group
- `DELETE /api/groups/:groupId/messages/:messageId` - Delete message (sender only)
- `GET /api/groups/:groupId/members` - Get group members
- `POST /api/groups/:groupId/members` - Add member to group
- `DELETE /api/groups/:groupId/members/:memberId` - Remove member from group

### Full-text Search (NEW)
- `GET /api/search?q=term` - Global search across all modules
- `GET /api/search/notes?query=term&subject=X` - Search notes with filter
- `GET /api/search/posts?query=term&category=X` - Search posts with filter
- `GET /api/autocomplete/notes?prefix=car` - Autocomplete note titles
- `GET /api/autocomplete/posts?prefix=nur` - Autocomplete post titles
- `GET /api/search/recent` - Get user's recent searches
- `POST /api/search/save` - Save search to history

### Pusher Authentication (NEW)
- `POST /api/pusher/auth` - Authenticate Pusher channel subscription

## 🔐 Authentication

All endpoints except `/api/health` require Bearer token authentication:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/notes
```

Tokens are provided by Supabase Auth and should be included in the `Authorization` header.

## 📝 Request/Response Examples

### Create a Note
```bash
POST /api/notes
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "title": "Anatomy Study Guide",
  "subject": "Anatomy and Physiology",
  "description": "Comprehensive guide to human anatomy",
  "yearLevel": "1",
  "fileUrl": "https://example.com/file.pdf"
}
```

Response:
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "id": "uuid",
    "author_id": "uuid",
    "title": "Anatomy Study Guide",
    "subject": "Anatomy and Physiology",
    "rating_average": 0,
    "view_count": 0,
    "created_at": "2026-04-07T12:00:00Z"
  }
}
```

### Create a Post
```bash
POST /api/posts
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "content": "Anyone have tips for clinical rotations?",
  "category": "Clinical Experience"
}
```

### Send a Message
```bash
POST /api/messages/recipient-user-id
Content-Type: application/json
Authorization: Bearer TOKEN

{
  "body": "Hey, did you get the lecture notes?"
}
```

## 🛡️ Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error Type",
  "message": "Descriptive error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized / Missing Auth
- `403` - Forbidden / Insufficient Permissions
- `404` - Not Found
- `500` - Server Error

## 🔄 Database Schema

The backend uses the PostgreSQL schema defined in `migrations/001_initial_schema.sql`. Key tables:

- **profiles** - User profiles extended from Supabase Auth
- **notes** - Knowledge Exchange study guides
- **note_ratings** - Ratings for notes
- **posts** - Breakroom forum posts
- **votes** - Voting system for posts
- **direct_messages** - 1-on-1 messages
- **schedules** - Clinical schedule events
- **clinical_rotations** - Rotation periods
- **rotation_tasks** - Tasks within rotations (Kanban)
- **care_plans** - Care plans with Tiptap JSON content
- **wiki_pages** - Wiki pages with hierarchical structure

## 🔧 Features

- ✅ JWT Authentication (Supabase)
- ✅ Rate Limiting (100 req/15 min)
- ✅ CORS Enabled
- ✅ Compression Middleware
- ✅ Helmet Security Headers
- ✅ Async Error Handling
- ✅ Pagination Ready
- ✅ Filter & Sort Support
- ✅ Owner-based Authorization

## 📊 Performance

- Compression enabled for all responses
- Rate limiting to prevent abuse
- Database connection pooling via Supabase
- Request logging in development mode
- Index optimization for common queries

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Compatible with any Node.js hosting (Heroku, Railway, DigitalOcean, etc.)

## 📚 Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [JWT Authentication](https://jwt.io/)

## 📝 License

MIT License

## 👥 Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Open a Pull Request
