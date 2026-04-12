import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { createNotificationInternal } from './notificationsController.js';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
});

/**
 * Get followers for a user
 */
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    const { data, count, error } = await supabase
      .from('followers')
      .select(
        'follower_id, profiles:follower_id(id, username, avatar_url, nursing_year)',
        { count: 'exact' }
      )
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new AppError(error.message, 400);

    const followers = data?.map((f) => f.profiles) || [];

    res.json({
      success: true,
      data: followers,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get following for a user
 */
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    const { data, count, error } = await supabase
      .from('followers')
      .select(
        'following_id, profiles:following_id(id, username, avatar_url, nursing_year)',
        { count: 'exact' }
      )
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new AppError(error.message, 400);

    const following = data?.map((f) => f.profiles) || [];

    res.json({
      success: true,
      data: following,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Check if user is following another user
 */
export const isFollowing = async (req, res) => {
  try {
    const { userId: followingId } = req.params;
    const followerId = req.userId;

    if (!followingId) {
      throw new AppError('User ID is required', 400);
    }

    if (followerId === followingId) {
      return res.json({
        success: true,
        isFollowing: false,
      });
    }

    const { data, error } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new AppError(error.message, 400);
    }

    res.json({
      success: true,
      isFollowing: !!data,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Follow a user
 */
export const followUser = async (req, res) => {
  try {
    const { userId: followingId } = req.params;
    const followerId = req.userId;

    if (!followingId) {
      throw new AppError('User ID is required', 400);
    }

    console.log('[Follow] Attempting to follow - followerId:', followerId, 'followingId:', followingId);

    if (followerId === followingId) {
      throw new AppError('Cannot follow yourself', 400);
    }

    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (!checkError && existingFollow) {
      throw new AppError('Already following this user', 400);
    }

    // Verify target user exists
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', followingId)
      .single();

    if (userError || !targetUser) {
      throw new AppError('User not found', 404);
    }

    // Create follow relationship
    const { data, error } = await supabase
      .from('followers')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      })
      .select(
        'id, follower_id, following_id, created_at, follower:follower_id(id, username, avatar_url)'
      )
      .single();

    if (error) throw new AppError(error.message, 400);

    console.log('[Follow] Follow relationship created:', data?.id);

    // Create notification for the followed user
    const notification = await createNotificationInternal(
      followingId, // user who receives notification
      'follow', // type
      followerId, // actor (the one following)
      followingId // target user
    );

    console.log('[Follow] Notification created:', notification?.id);

    // Emit Pusher event for real-time updates
    try {
      await pusher.trigger(`private-user-${followingId}`, 'follow', {
        follower: data.follower,
        timestamp: Date.now(),
      });
      console.log('[Follow] Pusher event emitted for user:', followingId);
    } catch (pusherError) {
      console.error('[Follow] Error emitting Pusher event:', pusherError.message);
    }

    res.status(201).json({
      success: true,
      message: 'User followed successfully',
      data,
      notification,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (req, res) => {
  try {
    const { userId: followingId } = req.params;
    const followerId = req.userId;

    if (!followingId) {
      throw new AppError('User ID is required', 400);
    }

    console.log('[Unfollow] Attempting to unfollow - followerId:', followerId, 'followingId:', followingId);

    // Check if following exists
    const { data: follow, error: checkError } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    console.log('[Unfollow] Check result - data:', follow, 'error:', checkError?.message);

    if (checkError) {
      console.error('[Unfollow] Error checking follow:', checkError);
      throw new AppError(checkError.message || 'Error checking follow relationship', 400);
    }

    if (!follow) {
      console.error('[Unfollow] Follow relationship not found');
      throw new AppError('Not following this user', 400);
    }

    // Delete follow relationship
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('[Unfollow] Delete error:', error);
      throw new AppError(error.message, 400);
    }

    console.log('[Unfollow] Successfully unfollowed');

    res.json({
      success: true,
      message: 'User unfollowed successfully',
    });
  } catch (error) {
    console.error('[Unfollow] Error:', error);
    throw error;
  }
};

/**
 * Get follower count for a user
 */
export const getFollowerCount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    const { count, error } = await supabase
      .from('followers')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      followerCount: count || 0,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get following count for a user
 */
export const getFollowingCount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    const { count, error } = await supabase
      .from('followers')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      followingCount: count || 0,
    });
  } catch (error) {
    throw error;
  }
};
