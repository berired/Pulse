import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Auth Service
export const authService = {
  async checkUsernameAvailable(username) {
    try {
      const normalizedUsername = username.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', normalizedUsername)
        .limit(1);

      if (error) {
        console.error('Username check error:', error);
        return true; // Assume available on error to not block signup
      }

      // If data is empty, username is available
      if (!data || data.length === 0) {
        return true;
      }

      // If we got here, username already exists
      return false;
    } catch (error) {
      console.error('Username availability check failed:', error);
      return true; // Assume available on error to not block signup
    }
  },

  async checkEmailAvailable(email) {
    try {
      const { data, error } = await supabase
        .rpc('is_email_available', { email_to_check: email });

      if (error) {
        console.error('Email availability check error:', error);
        return true; // Assume available on error to not block signup
      }

      // data is a boolean: true if available, false if taken
      return data;
    } catch (error) {
      console.error('Email availability check failed:', error);
      return true; // Assume available on error to not block signup
    }
  },

  async signup(email, password, profile) {
    try {
      // Normalize username to lowercase for consistency
      const normalizedUsername = profile.username.toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profile.full_name,
            username: normalizedUsername,
            nursing_year: profile.nursing_year,
            institution: profile.institution,
          },
        },
      });

      if (error) {
        // Handle rate limiting
        if (error.status === 429) {
          throw new Error('Too many signup attempts. Please wait a minute before trying again.');
        }
        // Handle auth errors
        if (error.status === 401) {
          throw new Error('Authentication configuration error. Please contact support.');
        }
        throw error;
      }

      if (data.user) {
        // Profile will be automatically created by the database trigger
        // No need to manually insert
        console.log('User registered successfully. Profile will be created by trigger.');
      }
    } catch (error) {
      // Provide user-friendly error messages
      if (error.message === 'Failed to fetch') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  onAuthStateChange(callback) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  },
};

// Default profile creation helper
const createDefaultProfileData = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          username: 'Student',
          nursing_year: 1,
          institution: 'Your Institution',
        },
      ]);

    if (error) {
      console.error('Error creating default profile:', error);
      return null;
    }

    return Array.isArray(data) ? data[0] : data;
  } catch (err) {
    console.error('Error creating default profile:', err);
    return null;
  }
};

// Profile Service
export const profileService = {
  async getProfile(userId) {
    // First try to fetch without .single() to see what we get
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);

    if (error) {
      throw error;
    }
    
    // Handle both single and multiple results
    const profileData = Array.isArray(data) ? data[0] : data;
    
    if (!profileData) {
      // Try to create a default profile if it doesn't exist
      return await createDefaultProfileData(userId);
    }
    
    return profileData;
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadAvatar(userId, file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return data.publicUrl;
  },
};

// Storage Service for Files
export const storageService = {
  async uploadFile(bucket, path, file) {
    const { error } = await supabase.storage.from(bucket).upload(path, file);

    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  async deleteFile(bucket, path) {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;
  },

  getPublicUrl(bucket, path) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
};

// Export supabase client for direct use
export default supabase;
