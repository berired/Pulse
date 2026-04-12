import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Check if user has admin role
  if (!user || !profile || profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
