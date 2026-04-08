# Pulse - Clinical Digital Workspace for Nursing Students

A specialized integrated ecosystem designed for nursing students. Pulse replaces fragmented tools like Discord and Notion with a clinical, high-performance, and snappy digital workspace.

## 🏥 Project Vision

Pulse is built with nursing education in mind, featuring:
- **Clinical Aesthetic**: Neutral color palette (whites, cool grays, medical blues) with no gradients
- **High Performance**: Optimized for real-time collaboration
- **Professional Design**: Component-based, modular architecture
- **Accessibility**: Responsive design for tablets and laptops used in clinical settings

## 📋 Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Language**: JavaScript only (strict - no TypeScript)
- **State Management**: TanStack Query (React Query)
- **Real-time**: Pusher
- **Rich Text Editor**: Tiptap (Headless)
- **Drag & Drop**: dnd-kit
- **Icons**: Lucide React (no emojis)
- **Styling**: CSS with component-based approach

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time Messaging**: Pusher

## 📁 Project Structure

```
pulse/
├── backend/
│   └── migrations/
│       └── 001_initial_schema.sql    # Complete DB schema with RLS
├── src/
│   ├── components/                   # Reusable UI components
│   │   ├── NoteUploadForm.jsx
│   │   ├── NoteCard.jsx
│   │   ├── FilterSidebar.jsx
│   │   ├── DirectMessageThread.jsx
│   │   ├── ContactList.jsx
│   │   ├── PostCard.jsx
│   │   ├── CreatePostForm.jsx
│   │   ├── ScheduleCalendar.jsx
│   │   └── KanbanBoard.jsx
│   ├── pages/                        # Page components (routes)
│   │   ├── KnowledgeExchange.jsx
│   │   ├── Messaging.jsx
│   │   ├── Breakroom.jsx
│   │   └── ClinicalCommandCenter.jsx
│   ├── hooks/                        # Custom React hooks
│   │   └── useQueries.js             # React Query hooks
│   ├── services/                     # Service layer
│   │   ├── supabase.js               # Supabase client & auth
│   │   └── pusher.js                 # Pusher real-time service
│   ├── context/                      # React Context
│   │   └── AuthContext.jsx           # Auth state management
│   ├── utils/                        # Utility functions
│   ├── App.jsx                       # Router & app layout
│   ├── App.css                       # Global styles
│   ├── index.css                     # Base styles
│   └── main.jsx                      # React DOM root
├── package.json
├── vite.config.js
└── README.md (this file)
```

## 🚀 Modules Built

### ✅ 1. Knowledge Exchange (Study Guides)
**Status**: Complete

**Features**:
- Searchable repository for study guides and mnemonics
- Browser-side image compression before upload
- Multi-step upload form
- Dynamic filtering by subject and year level
- Sorting by date, rating, or views
- Rating system with automatic average calculation
- View counts

**Data Model**:
- `notes` table (title, subject, description, file_url, year_level, author_id)
- `note_ratings` table (for user ratings)

**UI Components**:
- `NoteUploadForm` - Multi-step form with image compression
- `NoteCard` - Individual note display with rating and download
- `FilterSidebar` - Dynamic filtering and sorting
- `KnowledgeExchange` page - Full integration

---

### ✅ 2. Peer-to-Peer Messaging (Real-time)
**Status**: Complete

**Features**:
- Direct message threads (1-on-1 chats)
- Real-time messaging via Pusher
- Typing indicators
- Read receipts (prepared in DB)
- Message timestamps
- Contact list with online status

**Data Models**:
- `direct_messages` table
- `message_read_receipts` table

**UI Components**:
- `ContactList` - List of all users to message
- `DirectMessageThread` - Real-time message thread
- `Messaging` page - Split view (contacts + thread)

**Real-time Features**:
- Pusher channels for direct messages
- Typing indicators with auto-dismiss
- Message delivery confirmation

---

### ✅ 3. The Breakroom (Community Forum)
**Status**: Complete

**Features**:
- Reddit-style feed for nursing discussions
- Category filtering (Clinical Stress, Exam Prep, Venting, etc.)
- Upvote/Downvote system
- Vote count calculation via DB triggers
- Search functionality
- Threaded structure prepared in DB

**Data Models**:
- `posts` table
- `post_comments` table (threaded)
- `votes` table (polymorphic for posts & comments)

**UI Components**:
- `CreatePostForm` - New discussion creation
- `PostCard` - Post display with voting
- `Breakroom` page - Full forum experience

**Features**:
- Dynamic category filtering
- Real-time vote counting
- Search posts
- Vote toggles (upvote/downvote)

---

### ✅ 4. Clinical Command Center (Productivity Suite)
**Status**: Core complete (advanced features ready for next phase)

**Features**:

#### 4a. Dynamic Schedules
- Calendar view (month/day navigation)
- Event color coding
- List view of events for selected date
- Event types: class, shift, assignment, exam

**Components**:
- `ScheduleCalendar` - Calendar grid with event dots
- Schedule management (create/edit/delete prepared)

#### 4b. Clinical Rotations (Kanban)
- Kanban board with stages: To Do, In Progress, Review, Completed
- Drag-and-drop task management
- Task priority levels (High, Medium, Low)
- Due date tracking

**Components**:
- `KanbanBoard` - Drag-and-drop columns with tasks
- Task cards with descriptions and priority

#### 4c. Care Plan Builder & Personal Wiki
- **Framework**: Tiptap (Headless) - configured and ready to integrate
- **Status**: Prepared schema, UI scaffolding ready
- **Next Phase**: Tiptap editor integration and block-based content

**Data Models**:
- `schedules` table
- `clinical_rotations` table
- `rotation_tasks` table
- `care_plans` table (Tiptap JSON structure)
- `wiki_pages` table (Tiptap JSON structure, supports hierarchies)

---

## 🗄️ Database Schema

The complete PostgreSQL schema is in `backend/migrations/001_initial_schema.sql`:

### Core Tables
- **profiles**: User profiles with nursing year and institution
- **notes**: Knowledge Exchange study guides
- **note_ratings**: Ratings for knowledge exchange
- **posts**: Breakroom forum posts
- **post_comments**: Threaded comments on posts
- **votes**: Upvote/downvote system (polymorphic)
- **direct_messages**: Private 1-on-1 messages
- **cohorts**: Clinical cohorts (group chats)
- **cohort_members**: Group chat memberships
- **cohort_messages**: Group chat messages
- **message_read_receipts**: Read status tracking
- **schedules**: Calendar events
- **care_plans**: Clinical care plan documents
- **wiki_pages**: Personal wiki pages with hierarchy support
- **clinical_rotations**: Clinical rotation tracking
- **rotation_tasks**: Tasks within rotations

### Key Features
- **Row Level Security (RLS)**: Policies for all tables
- **Automatic Timestamps**: `created_at` and `updated_at` triggers
- **Vote Aggregation**: Triggers to recalculate vote counts
- **Indexes**: Performance optimization on frequently queried columns

---

## 🔐 Security & Authentication

- **Supabase Auth**: Email/password authentication
- **Row Level Security**: All tables protected with RLS policies
- **User Isolation**: Users can only see/modify their own data
- **Profile Management**: Auto-creation on signup

---

## 🎨 Design System

### Color Palette
```css
--primary: #1E293B           /* Hospital Navy */
--primary-dark: #0F172A
--primary-light: #F8FAFC

--secondary: #0D9488         /* Medical Teal */
--success: #22C55E           /* Healing Mint */
--danger: #E11D48            /* Code Red */

--neutral-900: #1E293B       /* Text */
--neutral-700: #64748B       /* Secondary text */
--neutral-500: #6b7280       /* Tertiary text */

--success: #16a34a
--warning: #f59e0b
--danger: #ef4444
```

### Typography
- **Font Family**: System UI fonts (-apple-system, Segoe UI, Roboto)
- **No Emojis**: Lucide React icons exclusively

### Layout Rules
- **No Gradients**: Solid colors and subtle borders only
- **Responsive**: Mobile-first, tablet, desktop support
- **Spacing**: 8px base grid (0.5rem units)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account
- Pusher account

### Installation

1. **Clone & Install Dependencies**
```bash
cd pulse
npm install
```

2. **Configure Environment Variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PUSHER_KEY=your-pusher-key
VITE_PUSHER_CLUSTER=your-cluster
```

3. **Setup Supabase**
- Create a new Supabase project
- Run the migration: `backend/migrations/001_initial_schema.sql`
- Create storage buckets: `avatars`, `notes`

4. **Start Development Server**
```bash
npm run dev
```

Server runs on `http://localhost:5173`

### Build for Production
```bash
npm run build
```

---

## 📦 Dependencies

### Core Dependencies
- `react@^19.2.4`
- `react-dom@^19.2.4`
- `react-router-dom@^6.28.0`
- `@tanstack/react-query@^5.48.0`
- `@supabase/supabase-js@^2.48.0`
- `pusher-js@^8.4.0`
- `@tiptap/react@^2.10.6`
- `@dnd-kit/core@^6.1.0`
- `lucide-react@^0.468.0`
- `date-fns@^3.6.0`

All dependencies are specified in `package.json`.

---

## 🔄 State Management Pattern

### React Query
- Automatic caching and synchronization
- Stale time: 2 minutes
- Cache time: 5 minutes

### Auth Context
- Global user session state
- Profile loading
- Auth change subscriptions

### Custom Hooks (`useQueries.js`)
All data operations use custom hooks:
```javascript
useNotes(filters)
useDirectMessages(userId, otherUserId)
usePosts(filters)
useSchedules(userId)
useClinicalRotations(userId)
// ... more hooks
```

---

## 🔌 Real-time Architecture

### Pusher Integration
- **Direct Messages**: Private 1-on-1 channels
- **Typing Indicators**: Real-time presence
- **Read Receipts**: Message state tracking
- **Cohort Messages**: Group chat channels

### Example Usage
```javascript
messagingService.subscribeDirectMessages(userId, recipientId, (data) => {
  // Handle new messages, typing, read receipts
});
```

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Then deploy `dist/` folder to Vercel
```

### Backend (Supabase)
- Database: Hosted on Supabase
- Run migrations via Supabase admin panel
- Configure storage buckets
- Set up RLS policies (included in migration)

### Environment Variables
Set in Vercel dashboard and Supabase console.

---

## 📝 Future Enhancements

### Phase 2 - Advanced Features
- [ ] Tiptap Rich Text Editor integration (Care Plans, Wiki)
- [ ] Block-based wiki system with hierarchical pages
- [ ] Care plan templates
- [ ] Advanced search with full-text indexing
- [ ] File attachments for messages
- [ ] Voice/video call setup (Twilio/Jitsi)
- [ ] Analytics dashboard

### Phase 3 - Community & Analytics
- [ ] User reputation system
- [ ] Achievement badges
- [ ] Notifications system
- [ ] Email digests
- [ ] Admin dashboard

### Phase 4 - Integration
- [ ] Calendar sync (Google, Outlook)
- [ ] Document collaboration (Yjs)
- [ ] Mobile apps (React Native)

---

## 📚 Code Organization Best Practices

### Component Structure
```javascript
// Each component has:
// 1. JSX with semantic HTML
// 2. Separate CSS file
// 3. Clear prop documentation
// 4. Error boundaries (prepared)
```

### Service Layer
- All API calls through `supabase.js`
- All real-time through `pusher.js`
- No direct Supabase calls in components

### Hooks as Patterns
- Custom hooks encapsulate logic
- Query hooks for data fetching
- Context hooks for global state

---

## 🤝 Contributing

The codebase follows these principles:
- **No TypeScript** - JavaScript only
- **No Emojis** - Lucide icons only
- **No Gradients** - Solid colors only
- **Component-based** - Modular, reusable
- **DRY** - Don't repeat yourself

---

## 📄 License

MIT

---

## 🎓 Support

For questions or issues:
1. Check the database schema (`backend/migrations/001_initial_schema.sql`)
2. Review component examples in `src/components/`
3. Check service layer in `src/services/`

---

**Built with ❤️ for nursing students**
