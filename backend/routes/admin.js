import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getAllUsers,
  getUserPosts,
  banUserByIP,
  getBannedIPs,
  unbanIP,
  getDashboardStats,
} from '../controllers/adminController.js';

const router = express.Router();

// Middleware to check if user is admin
const adminOnly = async (req, res, next) => {
  try {
    const { data: profile } = await req.app.locals.supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user?.id)
      .single();

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify admin status' });
  }
};

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// Dashboard
router.get('/stats', getDashboardStats);

// Users management
router.get('/users', getAllUsers);
router.get('/users/:userId/posts', getUserPosts);

// IP Bans
router.post('/users/:userId/ban', banUserByIP);
router.get('/banned-ips', getBannedIPs);
router.delete('/banned-ips/:ipId', unbanIP);

export default router;
