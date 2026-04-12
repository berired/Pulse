import express from 'express';
import { createProfile, getUserProfile } from '../controllers/profileController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create profile (called after Supabase auth signup)
router.post('/create', createProfile);

// Get user profile (with IP info for admins)
router.get('/:userId', authMiddleware, getUserProfile);

export default router;
