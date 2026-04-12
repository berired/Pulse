import express from 'express';
import { 
  submitReport, 
  getReports, 
  getReportById,
  updateReportStatus,
  deleteReport 
} from '../controllers/reportsController.js';
import { authMiddleware } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Submit a report (requires authentication)
router.post('/', authMiddleware, upload.single('image'), submitReport);

// Get all reports paginated (requires authentication - admin view)
router.get('/', authMiddleware, getReports);

// Get specific report by ID
router.get('/:reportId', authMiddleware, getReportById);

// Update report status (admin only)
router.patch('/:reportId/status', authMiddleware, updateReportStatus);

// Delete report (admin only)
router.delete('/:reportId', authMiddleware, deleteReport);

export default router;
