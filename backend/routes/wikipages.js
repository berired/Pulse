import express from 'express';
import {
  getWikipages,
  createWikipage,
  updateWikipage,
  deleteWikipage,
  getWikipageBySlug,
} from '../controllers/wikipagesController.js';
import { optionalAuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/wikipages - Get all wiki pages for current user
router.get('/', getWikipages);

// POST /api/wikipages - Create a new wiki page
router.post('/', createWikipage);

// PATCH /api/wikipages/:id - Update wiki page
router.patch('/:id', updateWikipage);

// DELETE /api/wikipages/:id - Delete wiki page
router.delete('/:id', deleteWikipage);

// GET /api/wikipages/:userId/:slug - Get public wiki page by slug (optional auth)
router.get('/:userId/:slug', optionalAuthMiddleware, getWikipageBySlug);

export default router;
