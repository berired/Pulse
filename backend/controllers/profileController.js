import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

// Helper function to extract client IP
const getClientIP = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

// Create profile with IP tracking
export const createProfile = async (req, res) => {
  try {
    const { userId, username, full_name, nursing_year, institution } = req.body;

    if (!userId || !username) {
      throw new AppError('User ID and username are required', 400);
    }

    const registrationIP = getClientIP(req);

    // Create profile with registration IP
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          username,
          full_name: full_name || '',
          nursing_year: nursing_year || 1,
          institution: institution || '',
          registration_ip: registrationIP,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      profile: data[0],
      message: 'Profile created successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create profile', 500);
  }
};

// Get user profile with IP info
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, nursing_year, institution, avatar_url, bio, registration_ip, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) throw new AppError(error.message || 'Profile not found', 404);

    res.json(data);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch profile', 500);
  }
};

export default { createProfile, getUserProfile };
