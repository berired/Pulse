# 🚀 Quick Start Guide - Pulse Full Stack Setup

Complete guide to run Pulse (Frontend + Backend) locally.

## Prerequisites

- **Node.js** 16+ installed [Download](https://nodejs.org/)
- **Git** for version control
- **Supabase Account** [Sign up free](https://supabase.com/)
- Code editor (VS Code recommended)

## Step-by-Step Setup

### 1️⃣ Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com/) and create new project
2. In SQL Editor, run the migration:
   ```sql
   -- Copy contents from backend/migrations/001_initial_schema.sql
   -- Paste and run in Supabase SQL Editor
   ```
3. Copy your credentials:
   - Project URL
   - Anon Key
   - Service Role Key (optional, for admin operations)

### 2️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your Supabase credentials
# VITE_SUPABASE_URL=your-url
# VITE_SUPABASE_ANON_KEY=your-key

# Start development server
npm run dev
```

Backend should start at: **http://localhost:5000**

### 3️⃣ Frontend Setup

```bash
# Navigate to frontend (pulse root)
cd ..

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# VITE_SUPABASE_URL=your-url
# VITE_SUPABASE_ANON_KEY=your-key
# VITE_PUSHER_KEY=your-pusher-key (optional)

# Start development server
npm run dev
```

Frontend should start at: **http://localhost:5173**

## 🎯 Testing the Setup

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-07T...",
  "uptime": 123.45,
  "environment": "development"
}
```

### 2. Create Account
1. Open http://localhost:5173
2. Go to Auth page
3. Sign up with email/password
4. Should redirect to Dashboard

### 3. Test Features
- Upload study guide in Knowledge Exchange
- Create post in Breakroom
- Send message in Messaging
- Create calendar event in Clinical Center

## 📁 Project Structure

```
pulse/
├── frontend code (React + Vite)
├── backend/
│   ├── index.js (server entry)
│   ├── routes/ (API endpoints)
│   ├── controllers/ (business logic)
│   ├── middleware/ (auth, errors)
│   ├── config/ (Supabase client)
│   ├── migrations/ (database schema)
│   └── package.json
└── .env.example (frontend env template)
```

## 🔐 Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_PUSHER_KEY=your-pusher-key
VITE_PUSHER_CLUSTER=mt1
```

### Backend (.env)
```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000

# Kill process on port 5173 (frontend)
# Windows: netstat -ano | findstr :5173
# Mac/Linux: lsof -i :5173
```

### Supabase Connection Error
- Verify credentials in .env
- Check database is running (Supabase dashboard)
- Ensure API keys are not expired

### CORS Error
- Make sure backend is running on port 5000
- Check `FRONTEND_URL` in backend .env matches frontend URL

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

## 📚 API Examples

### Get Notes
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/notes
```

### Create Note
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Study Guide",
    "subject": "Anatomy",
    "yearLevel": "1"
  }'
```

## 🚀 Production Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy (automatic on push)

### Backend (Vercel / Railway / Render)
1. Create account on platform
2. Connect GitHub repository
3. Set environment variables
4. Deploy

**Recommended:** Vercel for frontend + Railway/Render for backend

## 📖 Documentation

- [Backend API Docs](./backend/README.md)
- [Frontend Setup](../README.md)
- [Database Schema](./backend/migrations/001_initial_schema.sql)

## ✅ Checklist

- [ ] Node.js 16+ installed
- [ ] Supabase project created
- [ ] Database schema migrated
- [ ] Backend .env configured
- [ ] Backend running on :5000
- [ ] Frontend .env configured
- [ ] Frontend running on :5173
- [ ] Can sign up and login
- [ ] Features working

## 🎉 Next Steps

After setup is complete:

1. **Customize** - Update colors, branding
2. **Deploy** - Push to production
3. **Integrate** - Add Pusher for real-time
4. **Optimize** - Add caching, CDN
5. **Monitor** - Set up error tracking

## 📞 Support

If you encounter issues:

1. Check troubleshooting section above
2. Review error messages in console
3. Check browser DevTools (F12)
4. Review server logs in terminal

## 📝 Notes

- Both servers run simultaneously during development
- Frontend makes requests to `http://localhost:5000/api/*`
- Database operations go through Supabase
- Authentication uses Supabase Auth
- Real-time features configured via Pusher
