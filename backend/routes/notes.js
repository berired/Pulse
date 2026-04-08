import express from 'express';
import { getNotes, createNote, updateNote, deleteNote, rateNote } from '../controllers/notesController.js';

const router = express.Router();

// GET /api/notes - Get all notes with optional filtering
router.get('/', getNotes);

// POST /api/notes - Create a new note
router.post('/', createNote);

// PATCH /api/notes/:id - Update a note
router.patch('/:id', updateNote);

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', deleteNote);

// POST /api/notes/:id/rate - Rate a note
router.post('/:id/rate', rateNote);

export default router;
