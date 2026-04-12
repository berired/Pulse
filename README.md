# Pulse 🫀

*A clinical workspace platform for nursing students to collaborate, learn, and grow.*

## 📋 Overview

**Pulse** is a full-stack web application designed specifically for nursing students and clinical educators. It provides a comprehensive digital workspace combining communication, knowledge sharing, scheduling, and clinical planning in one unified platform.

The application is built with modern technologies emphasizing real-time collaboration, secure data management, and an intuitive user experience for healthcare professionals in training.

---

## ✨ Key Features

### 📚 **Knowledge Exchange**
- Comprehensive note-taking and study guide system
- Full-text search functionality for quick knowledge discovery
- Filterable note library by subject, topic, and date
- Rich text editing with code snippet support via Lexical editor

### 💬 **Messaging & Communication**
- Real-time direct messaging between users
- Secure message request system (users can accept/decline DMs from non-followers)
- Group chat functionality for cohort collaboration
- Message notifications with sound and browser alerts
- Presence awareness with Pusher real-time updates

### 📰 **Breakroom (Social Feed)**
- Create and share posts within your nursing cohort
- Vote on posts (upvote/downvote system)
- Comment and discussion threads
- Activity feed showing recent community engagement
- Real-time post updates

### 📅 **Clinical Scheduling**
- Create and manage clinical rotations and schedules
- Calendar view of upcoming rotations
- Integration with clinical calendar system
- Rotation details and assignments tracking

### 📋 **Care Planning**
- Build comprehensive clinical care plans
- Care plan templates for common conditions
- Structured patient information tracking
- Medical record number and patient demographics
- Classification by plan type (acute, chronic, preventative)

### 🗂️ **Knowledge Management (WikiPages)**
- Create collaborative wiki pages
- Public/private page visibility controls
- Link sharing within the platform
- Structured knowledge repository

### 👥 **Social Features**
- User profiles with bio, role, and specialization
- Follow/unfollow system for staying connected
- User search and discovery
- Contact list with followers/following tracking
- Activity feed showing community activity

### 🔔 **Notifications**
- Real-time notification delivery via Pusher
- Multi-type notifications (follow, message, group invite)
- Unread notification badge counter
- Mark as read / delete notifications
- Sound alerts and browser notifications
- Notification routing (click to navigate to relevant content)

### 📁 **File Management**
- Upload and manage files related to notes and care plans
- Secure file storage integration
- File preview and download capabilities

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.4
- **Build Tool**: Vite 8.0.4
- **Routing**: React Router v6
- **State Management**: React Context API + React Query
- **Database Client**: Supabase JS SDK
- **Real-time**: Pusher JS
- **UI Components**: Lucide React Icons
- **Text Editor**: Lexical (advanced rich text editing)
- **Drag & Drop**: dnd-kit
- **Animations**: Framer Motion, GSAP
- **Date Utilities**: date-fns
- **CSS**: Tailwind-like custom CSS + CSS Modules

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 4.18.2
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Pusher
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Utilities**: UUID, compression, async error handling

### Infrastructure
- **Database**: Supabase PostgreSQL with Row-Level Security (RLS)
- **Real-time Messaging**: Pusher Channels
- **File Storage**: Supabase Storage

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Git
- Supabase account with project set up
- Pusher account for real-time features

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd pulse
```

#### 2. Install dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

#### 3. Environment Setup

Create `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create `.env` file in the `backend` directory:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Pusher
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
```

#### 4. Database Setup

Run migrations to set up the database schema:
```bash
cd backend
npm run migrate
cd ..
```

#### 5. Run the Application

**Development mode:**
```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
npm run dev
```

The application will be available at `http://localhost:5173`

**Production build:**
```bash
npm run build
```

---

## 📁 Project Structure

```
pulse/
├── backend/                    # Express.js backend server
│   ├── config/                 # Configuration files (Supabase, Pusher)
│   ├── controllers/            # Business logic for each feature
│   ├── middleware/             # Express middleware (auth, error, rate limit)
│   ├── migrations/             # Database schema migrations (SQL)
│   ├── routes/                 # API endpoint definitions
│   ├── .env                    # Backend environment variables
│   ├── index.js                # Express app setup and middleware
│   └── package.json            # Backend dependencies
│
├── src/                        # React frontend application
│   ├── components/             # Reusable React components
│   ├── context/                # React Context (Auth, etc.)
│   ├── hooks/                  # Custom React hooks
│   ├── pages/                  # Page components (Dashboard, Messaging, etc.)
│   ├── services/               # API & external service integrations
│   ├── utils/                  # Utility functions
│   ├── App.jsx                 # Root component with routing
│   └── main.jsx                # Entry point
│
├── public/                     # Static assets
├── vite.config.js              # Vite configuration
├── eslint.config.js            # ESLint rules
├── package.json                # Frontend dependencies
└── README.md                   # This file
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out` - User logout

### Notes (Knowledge Exchange)
- `GET /api/notes` - Fetch notes with filtering
- `POST /api/notes` - Create new note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Posts (Breakroom)
- `GET /api/posts` - Fetch posts
- `POST /api/posts` - Create post
- `POST /api/posts/:id/vote` - Vote on a post
- `POST /api/posts/:id/comments` - Add comment
- `DELETE /api/posts/:id` - Delete post

### Messages
- `GET /api/messages/:userId` - Get message thread
- `POST /api/messages/:userId` - Send direct message
- `POST /api/messages/:userId/request` - Send message request
- `GET /api/messages/requests/pending` - Get pending message requests
- `PATCH /api/messages/requests/:requestId/respond` - Respond to message request
- `POST /api/messages/:userId/group-invite` - Send group invite
- `GET /api/messages/group-invites/pending` - Get pending group invites

### Followers
- `POST /api/followers/:userId/follow` - Follow a user
- `POST /api/followers/:userId/unfollow` - Unfollow a user
- `GET /api/followers/:userId/followers` - Get user's followers
- `GET /api/followers/:userId/following` - Get user's following

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PATCH /api/notifications/:notificationId/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:notificationId` - Delete notification

### Care Plans
- `GET /api/careplans` - Fetch care plans
- `POST /api/careplans` - Create care plan
- `PATCH /api/careplans/:id` - Update care plan
- `DELETE /api/careplans/:id` - Delete care plan

### Schedules & Rotations
- `GET /api/schedules` - Fetch schedules
- `POST /api/schedules` - Create schedule
- `GET /api/rotations` - Fetch rotations
- `POST /api/rotations` - Create rotation

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups` - Get user's groups
- `POST /api/groups/:groupId/members` - Add member to group

### Search
- `GET /api/search?q=query` - Global search across notes, posts, users, etc.

### Health Check
- `GET /api/health` - Health check endpoint

---

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication
- Supabase Auth integration
- User context in React Context API
- Protected routes in frontend

### Database Security
- Row-Level Security (RLS) policies on all tables
- User-based data isolation
- Service role key for backend operations (bypasses RLS for proper authorization)
- Anon key for client-side operations

### API Security
- Helmet.js for HTTP headers security
- CORS configuration for cross-origin requests
- Rate limiting on endpoints
- JWT middleware for route protection
- Express async error handling

### Data Protection
- Password hashing via Supabase Auth
- Secure WebSocket connections for Pusher
- File upload validation with Multer
- Input sanitization and validation

---

## 🔄 Real-time Features

### Pusher Integration
- **Direct Messages**: Instant message delivery and read receipts
- **Notifications**: Real-time notification push
- **Presence**: User online/offline status
- **Activity**: Real-time post updates, votes, comments
- **Typing**: User typing indicators (ready to implement)

### Implementation
```javascript
// Components subscribe to Pusher channels automatically
import Pusher from 'pusher-js';

const pusher = new Pusher(process.env.VITE_PUSHER_KEY, {
  cluster: process.env.VITE_PUSHER_CLUSTER
});

// Subscribe to user-specific channels
const channel = pusher.subscribe(`private-user-${userId}`);
channel.bind('notification', (data) => {
  // Handle incoming notification
});
```

---

## 📊 Database Schema Overview

### Core Tables
- **users** - User profiles and authentication
- **profiles** - Extended user profile information
- **posts** - Social breakroom posts
- **post_comments** - Comments on posts
- **post_votes** - Vote tracking
- **notes** - Knowledge exchange notes
- **direct_messages** - DM conversations
- **direct_message_requests** - Message request system
- **groups** - Group chats/cohorts
- **cohort_members** - Group membership
- **followers** - Follow relationships
- **notifications** - User notifications
- **care_plans** - Clinical care plans
- **schedules** - Schedule entries
- **rotations** - Clinical rotations
- **wiki_pages** - Knowledge base pages

All tables include:
- `id` (UUID primary key)
- `created_at` / `updated_at` timestamps
- `user_id` foreign key for ownership
- RLS policies for data isolation

---

## 🧪 Development

### Code Quality
- ESLint configuration with React best practices
- React Compiler enabled for optimization
- Consistent coding standards

### Frontend Development
```bash
# Start dev server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Backend Development
```bash
cd backend

# Start with nodemon (auto-reload)
npm run dev

# Start production
npm start

# Run database migrations
npm run migrate
```

---

## 📚 Component Highlights

### Key Frontend Components
- **Navbar** - Navigation with user profile and notifications
- **Dashboard** - Home page with stats and activity feed
- **KnowledgeExchange** - Note management and search
- **Breakroom** - Social feed with posts and voting
- **Messaging** - Direct messages and group chats
- **ClinicalCommandCenter** - Scheduling and rotations
- **CarePlanBuilder** - Care plan creation and management
- **SearchUsers** - User discovery
- **ContactList** - Followers and following

### Reusable Components
- `PostCard` - Display post with voting
- `NoteCard` - Display note summary
- `StatCard` - Statistics display
- `NotificationDropdown` - Notification panel
- `EventCreateModal` - Modal for creating events
- `Stepper` - Multi-step form UI

---

## 🚨 Error Handling

### Backend
- Centralized error handler middleware
- Async error wrapper for route handlers
- HTTP status codes and error messages
- Development vs. production error responses

### Frontend
- React error boundaries
- User-friendly error messages
- Toast notifications for errors
- Automatic retry for network requests

---

## 📈 Performance Optimizations

- **Vite**: Fast build and HMR
- **React Query**: Efficient data fetching and caching
- **Code Splitting**: Lazy loading of routes
- **Compression**: Gzip compression on backend
- **Minification**: Production build optimization
- **Tree Shaking**: Unused code elimination

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature description"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

### Code Style
- Follow ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components focused and reusable

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📧 Support & Contact

For questions, issues, or suggestions, please reach out to the Pulse Team.

---

## 🙏 Acknowledgments

Built with modern web technologies and best practices for healthcare education. Special thanks to:
- Supabase for backend infrastructure
- Pusher for real-time capabilities
- React and Vite communities

---

## 📌 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Video conferencing for clinical discussions
- [ ] Advanced analytics dashboard
- [ ] AI-powered study recommendations
- [ ] Offline mode support
- [ ] Calendar synchronization (Google Calendar, Outlook)
- [ ] Advanced care plan templates
- [ ] Peer review system

---

**Last Updated**: April 2026  
**Version**: 1.0.0
