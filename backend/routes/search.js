import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  globalSearch,
  searchNotesBySubject,
  searchPostsByCategory,
  autocompleteNotes,
  autocompletePosts,
  getRecentSearches,
  saveSearch,
} from '../controllers/searchController.js';

const router = express.Router();

/**
 * GET /api/search
 * Global search across all modules
 * Query: q (search term), limit, offset
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    await globalSearch(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/search/notes
 * Search notes with optional subject filter
 * Query: query, subject (optional), limit
 */
router.get('/notes', authMiddleware, async (req, res, next) => {
  try {
    await searchNotesBySubject(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/search/posts
 * Search posts with optional category filter
 * Query: query, category (optional), limit
 */
router.get('/posts', authMiddleware, async (req, res, next) => {
  try {
    await searchPostsByCategory(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/autocomplete/notes
 * Autocomplete for note titles
 * Query: prefix, limit
 */
router.get('/autocomplete/notes', authMiddleware, async (req, res, next) => {
  try {
    await autocompleteNotes(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/autocomplete/posts
 * Autocomplete for post titles
 * Query: prefix, limit
 */
router.get('/autocomplete/posts', authMiddleware, async (req, res, next) => {
  try {
    await autocompletePosts(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/search/recent
 * Get user's recent searches
 * Query: limit
 */
router.get('/recent', authMiddleware, async (req, res, next) => {
  try {
    await getRecentSearches(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/search/save
 * Save search query to history
 * Body: query
 */
router.post('/save', authMiddleware, async (req, res, next) => {
  try {
    await saveSearch(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
