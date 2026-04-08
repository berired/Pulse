import { createContext, useContext, useEffect, useState } from 'react';
import { authService, profileService } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          setUser(session.user);
          
          // Fetch profile from database
          try {
            const profileData = await profileService.getProfile(session.user.id);
            if (profileData) {
              setProfile(profileData);
            } else {
              setProfile(null);
            }
          } catch (profileError) {
            console.error('Error fetching profile:', profileError);
            setProfile(null);
            // Still allow user to be logged in even if profile fetch fails
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const subscription = authService.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        // Fetch profile when auth state changes
        profileService
          .getProfile(session.user.id)
          .then((profileData) => {
            if (profileData) {
              setProfile(profileData);
            } else {
              setProfile(null);
            }
          })
          .catch((err) => {
            console.error('Error fetching profile:', err);
            setProfile(null);
          });
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const logout = () => {
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    setProfile,
    loading,
    error,
    setError,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
