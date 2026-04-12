import { supabase } from './supabase';

export async function getAuthToken() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      console.error('Failed to get auth token:', error);
      return null;
    }
    return data.session.access_token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

export async function fetchWithAuth(url, options = {}) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}
