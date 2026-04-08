import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import supabase from '../config/supabase.js';
import {
  upload,
  uploadFile,
  getUserDocuments,
  deleteDocument,
  getDocument,
} from '../controllers/filesController.js';

const router = express.Router();

/**
 * POST /api/files/upload
 * Upload a file to Supabase Storage
 * Body: multipart/form-data with file and module fields
 */
router.post('/upload', authMiddleware, upload.single('file'), async (req, res, next) => {
  try {
    await uploadFile(req, res, supabase, req.userId);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/files
 * Get all documents uploaded by current user
 * Query: module (optional), limit, offset
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    await getUserDocuments(req, res, supabase, req.userId);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/files/:documentId
 * Get specific document details
 */
router.get('/:documentId', authMiddleware, async (req, res, next) => {
  try {
    await getDocument(req, res, supabase, req.userId);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/files/:documentId
 * Delete a document
 */
router.delete('/:documentId', authMiddleware, async (req, res, next) => {
  try {
    await deleteDocument(req, res, supabase, req.userId);
  } catch (error) {
    next(error);
  }
});

export default router;
