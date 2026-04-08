import express from 'express';
import {
  getRotations,
  createRotation,
  updateRotation,
  deleteRotation,
  getRotationTasks,
  createRotationTask,
  updateRotationTask,
  deleteRotationTask,
} from '../controllers/rotationsController.js';

const router = express.Router();

// GET /api/rotations - Get all rotations for current user
router.get('/', getRotations);

// POST /api/rotations - Create a new rotation
router.post('/', createRotation);

// PATCH /api/rotations/:id - Update rotation
router.patch('/:id', updateRotation);

// DELETE /api/rotations/:id - Delete rotation
router.delete('/:id', deleteRotation);

// GET /api/rotations/:rotationId/tasks - Get tasks for specific rotation
router.get('/:rotationId/tasks', getRotationTasks);

// POST /api/rotations/:rotationId/tasks - Create task for rotation
router.post('/:rotationId/tasks', createRotationTask);

// PATCH /api/rotations/:rotationId/tasks/:taskId - Update rotation task
router.patch('/:rotationId/tasks/:taskId', updateRotationTask);

// DELETE /api/rotations/:rotationId/tasks/:taskId - Delete rotation task
router.delete('/:rotationId/tasks/:taskId', deleteRotationTask);

export default router;
