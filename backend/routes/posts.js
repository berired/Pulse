import express from 'express';
import { getPosts, createPost, updatePost, deletePost, votePost } from '../controllers/postsController.js';

const router = express.Router();

// GET /api/posts - Get all posts with optional filtering
router.get('/', getPosts);

// POST /api/posts - Create a new post
router.post('/', createPost);

// PATCH /api/posts/:id - Update a post
router.patch('/:id', updatePost);

// DELETE /api/posts/:id - Delete a post
router.delete('/:id', deletePost);

// POST /api/posts/:id/vote - Vote on a post
router.post('/:id/vote', votePost);

export default router;
