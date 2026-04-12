import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const { search } = req.query;

    let query = supabase
      .from('profiles')
      .select('id, username, avatar_url, role, full_name, bio, created_at', { count: 'exact' });

    if (search) {
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: users, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new AppError(error.message, 400);

    // Try to get registration IPs if the column exists
    let usersWithIPs = users;
    if (users && users.length > 0) {
      try {
        const userIds = users.map(u => u.id);
        const { data: ipData } = await supabase
          .from('profiles')
          .select('id, registration_ip')
          .in('id', userIds);
        
        if (ipData) {
          const ipMap = ipData.reduce((acc, item) => {
            acc[item.id] = item.registration_ip;
            return acc;
          }, {});
          usersWithIPs = users.map(user => ({ ...user, registration_ip: ipMap[user.id] }));
        }
      } catch (ipError) {
        // Column might not exist yet, continue without IPs
        console.warn('Could not fetch registration IPs:', ipError.message);
      }
    }

    res.json({
      users: usersWithIPs,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch users', 500);
  }
};

// Get user's posts (from notes and posts)
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch posts from breakroom
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, content, category, created_at, vote_count')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (postsError) throw new AppError(postsError.message, 400);

    // Fetch notes from knowledge exchange
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, title, created_at')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (notesError) throw new AppError(notesError.message, 400);

    // Combine and sort by date
    const allPosts = [
      ...posts.map((p) => ({
        ...p,
        type: 'post',
        display: p.content.substring(0, 100) + (p.content.length > 100 ? '...' : ''),
      })),
      ...notes.map((n) => ({
        ...n,
        type: 'note',
        display: n.title,
      })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      userId,
      posts: allPosts,
      total: allPosts.length,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch user posts', 500);
  }
};

// Ban user by IP address
export const banUserByIP = async (req, res) => {
  try {
    const { userId } = req.params;
    const { ipAddress, reason } = req.body;
    const adminId = req.user?.id;

    if (!ipAddress) {
      throw new AppError('IP address is required', 400);
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) throw new AppError('User not found', 404);

    // Check if IP is already banned
    const { data: existingBan } = await supabase
      .from('banned_ips')
      .select('id')
      .eq('ip_address', ipAddress)
      .single();

    if (existingBan) {
      throw new AppError('This IP address is already banned', 400);
    }

    // Add IP to banned_ips table
    const { data: ban, error: banError } = await supabase
      .from('banned_ips')
      .insert({
        ip_address: ipAddress,
        reason: reason || `User ${userId} banned`,
        banned_by: adminId,
      })
      .select()
      .single();

    if (banError) throw new AppError(banError.message, 400);

    res.json({
      success: true,
      message: `IP ${ipAddress} has been banned`,
      ban,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to ban IP', 500);
  }
};

// Get all banned IPs
export const getBannedIPs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const { data: bannedIPs, count, error } = await supabase
      .from('banned_ips')
      .select('*, profiles(username)', { count: 'exact' })
      .order('banned_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new AppError(error.message, 400);

    res.json({
      bannedIPs,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch banned IPs', 500);
  }
};

// Unban IP address
export const unbanIP = async (req, res) => {
  try {
    const { ipId } = req.params;

    const { data: ban, error: fetchError } = await supabase
      .from('banned_ips')
      .select('ip_address')
      .eq('id', ipId)
      .single();

    if (fetchError || !ban) throw new AppError('Ban record not found', 404);

    const { error: deleteError } = await supabase
      .from('banned_ips')
      .delete()
      .eq('id', ipId);

    if (deleteError) throw new AppError(deleteError.message, 400);

    res.json({
      success: true,
      message: `IP ${ban.ip_address} has been unbanned`,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to unban IP', 500);
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' });

    // Total reports
    const { count: totalReports } = await supabase
      .from('reports')
      .select('id', { count: 'exact' });

    // Total banned IPs
    const { count: totalBannedIPs } = await supabase
      .from('banned_ips')
      .select('id', { count: 'exact' });

    // Unreviewed reports
    const { count: unreviewedReports } = await supabase
      .from('reports')
      .select('id', { count: 'exact' })
      .eq('status', 'not_yet_reviewed');

    res.json({
      totalUsers: totalUsers || 0,
      totalReports: totalReports || 0,
      totalBannedIPs: totalBannedIPs || 0,
      unreviewedReports: unreviewedReports || 0,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch dashboard stats', 500);
  }
};
