import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import KnowledgeExchange from './pages/KnowledgeExchange';
import Messaging from './pages/Messaging';
import Breakroom from './pages/Breakroom';
import ClinicalCommandCenter from './pages/ClinicalCommandCenter';
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
            {/* Protected Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/knowledge-exchange" element={<KnowledgeExchange />} />
            <Route path="/messages" element={<Messaging />} />
            <Route path="/breakroom" element={<Breakroom />} />
            <Route path="/clinical-center" element={<ClinicalCommandCenter />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <>
            {/* Auth Routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
