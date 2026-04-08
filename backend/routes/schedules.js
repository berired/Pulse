import express from 'express';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '../controllers/schedulesController.js';

const router = express.Router();

// GET /api/schedules - Get all schedules for current user
router.get('/', getSchedules);

// POST /api/schedules - Create a new schedule event
router.post('/', createSchedule);

// PATCH /api/schedules/:id - Update schedule event
router.patch('/:id', updateSchedule);

// DELETE /api/schedules/:id - Delete schedule event
router.delete('/:id', deleteSchedule);

export default router;
