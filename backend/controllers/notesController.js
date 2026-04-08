import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

export const getNotes = async (req, res) => {
  try {
    const { subject, yearLevel, search, sortBy } = req.query;
    const userId = req.userId;

    let query = supabase.from('notes').select('*');

    if (subject) query = query.eq('subject', subject);
    if (yearLevel) query = query.eq('year_level', yearLevel);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query
      .order(sortBy === 'rating' ? 'rating_average' : 'created_at', {
        ascending: false,
      });

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    throw error;
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, subject, description, yearLevel, fileUrl } = req.body;
    const userId = req.userId;

    if (!title || !subject || !yearLevel) {
      throw new AppError('Missing required fields: title, subject, yearLevel', 400);
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        author_id: userId,
        title,
        subject,
        description,
        year_level: yearLevel,
        file_url: fileUrl,
        rating_average: 0,
        view_count: 0,
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject, yearLevel } = req.body;
    const userId = req.userId;

    // Verify ownership
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !note) {
      throw new AppError('Note not found', 404);
    }

    if (note.author_id !== userId) {
      throw new AppError('Unauthorized: You can only edit your own notes', 403);
    }

    const { data, error } = await supabase
      .from('notes')
      .update({
        title,
        description,
        subject,
        year_level: yearLevel,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Note updated successfully',
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify ownership
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !note) {
      throw new AppError('Note not found', 404);
    }

    if (note.author_id !== userId) {
      throw new AppError('Unauthorized: You can only delete your own notes', 403);
    }

    const { error } = await supabase.from('notes').delete().eq('id', id);

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};

export const rateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.userId;

    if (!rating || rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Check if note exists
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('id')
      .eq('id', id)
      .single();

    if (noteError || !note) {
      throw new AppError('Note not found', 404);
    }

    // Upsert rating
    const { error: ratingError } = await supabase
      .from('note_ratings')
      .upsert(
        {
          note_id: id,
          user_id: userId,
          rating,
        },
        { onConflict: 'note_id,user_id' }
      );

    if (ratingError) throw new AppError(ratingError.message, 400);

    // Get updated averageRating
    const { data: ratings, error: avgError } = await supabase
      .from('note_ratings')
      .select('rating')
      .eq('note_id', id);

    if (!avgError && ratings && ratings.length > 0) {
      const avgRating =
        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

      await supabase
        .from('notes')
        .update({ rating_average: avgRating })
        .eq('id', id);
    }

    res.json({
      success: true,
      message: 'Rating submitted successfully',
    });
  } catch (error) {
    throw error;
  }
};
