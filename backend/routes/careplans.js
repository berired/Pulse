import express from 'express';
import {
  getCareplans,
  createCareplan,
  updateCareplan,
  deleteCareplan,
} from '../controllers/careplansController.js';

const router = express.Router();

// GET /api/careplans - Get all care plans for current user
router.get('/', getCareplans);

// POST /api/careplans - Create a new care plan
router.post('/', createCareplan);

// PATCH /api/careplans/:id - Update care plan
router.patch('/:id', updateCareplan);

// DELETE /api/careplans/:id - Delete care plan
router.delete('/:id', deleteCareplan);

export default router;
