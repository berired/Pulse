import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import KnowledgeExchange from './pages/KnowledgeExchange';
import Messaging from './pages/Messaging';
import Breakroom from './pages/Breakroom';
import ClinicalCommandCenter from './pages/ClinicalCommandCenter';
import EditProfile from './pages/EditProfile';
import UserProfile from './pages/UserProfile';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {user ? (
          <>
            {/* Protected Routes with Navbar */}
            <Route
              path="/dashboard"
              element={
                <div className="app-layout">
                  <Navbar />
                  <div className="app-content">
                    <Dashboard />
                  </div>
                </div>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/knowledge-exchange"
              element={
                <div className="app-layout">
                  <Navbar />
                  <div className="app-content">
                    <KnowledgeExchange />
                  </div>
                </div>
              }
            />
            <Route
              path="/messages"
              element={
                <div className="app-layout">
                  <Navbar />
                  <div className="app-content">
                    <Messaging />
                  </div>
                </div>
              }
            />
            <Route
              path="/breakroom"
              element={
                <div className="app-layout">
                  <Navbar />
                  <div className="app-content">
                    <Breakroom />
                  </div>
                </div>
              }
            />
            <Route
              path="/clinical-center"
              element={
                <div className="app-layout">
                  <Navbar />
                  <div className="app-content">
                    <ClinicalCommandCenter />
                  </div>
                </div>
              }
            />
            <Route
              path="/edit-profile"
              element={
                <div className="app-layout">
                  <Navbar />
                  <div className="app-content">
                    <EditProfile />
                  </div>
                </div>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <div className="app-layout">
                  <Navbar />
                  <div className="app-content">
                    <UserProfile />
                  </div>
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
