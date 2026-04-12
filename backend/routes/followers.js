import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getFollowers,
  getFollowing,
  isFollowing,
  followUser,
  unfollowUser,
  getFollowerCount,
  getFollowingCount,
} from '../controllers/followersController.js';

const router = express.Router();

/**
 * GET /api/followers/:userId/followers
 * Get all followers for a user
 */
router.get('/:userId/followers', asyncHandler(getFollowers));

/**
 * GET /api/followers/:userId/following
 * Get all users that a user is following
 */
router.get('/:userId/following', asyncHandler(getFollowing));

/**
 * GET /api/followers/:userId/is-following
 * Check if current user is following the specified user
 */
router.get('/:userId/is-following', asyncHandler(isFollowing));

/**
 * POST /api/followers/:userId/follow
 * Follow a user
 */
router.post('/:userId/follow', asyncHandler(followUser));

/**
 * DELETE /api/followers/:userId/follow
 * Unfollow a user
 */
router.delete('/:userId/follow', asyncHandler(unfollowUser));

/**
 * GET /api/followers/:userId/count/followers
 * Get follower count
 */
router.get('/:userId/count/followers', asyncHandler(getFollowerCount));

/**
 * GET /api/followers/:userId/count/following
 * Get following count
 */
router.get('/:userId/count/following', asyncHandler(getFollowingCount));

export default router;
