import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

const SEARCH_LIMIT = parseInt(process.env.SEARCH_LIMIT || 20);
const MIN_SEARCH_CHARS = parseInt(process.env.SEARCH_MIN_CHARS || 2);

/**
 * Global search across all modules
 * Searches notes, posts, wiki pages, messages, schedules
 */
export const globalSearch = async (req, res) => {
  try {
    const { q, limit = SEARCH_LIMIT, offset = 0 } = req.query;
    const userId = req.userId;

    if (!q || q.trim().length < MIN_SEARCH_CHARS) {
      throw new AppError(
        `Search query must be at least ${MIN_SEARCH_CHARS} characters`,
        400
      );
    }

    const searchQuery = q.trim().toLowerCase();
    const searchLimit = Math.min(parseInt(limit), 100);

    // Parallel searches across modules
    const [notes, posts, wikis, schedules, messages] = await Promise.all([
      searchNotes(searchQuery, userId, searchLimit),
      searchPosts(searchQuery, userId, searchLimit),
      searchWikis(searchQuery, userId, searchLimit),
      searchSchedules(searchQuery, userId, searchLimit),
      searchMessages(searchQuery, userId, searchLimit),
    ]);

    // Combine and rank results
    const allResults = [
      ...notes.map((r) => ({ ...r, type: 'note' })),
      ...posts.map((r) => ({ ...r, type: 'post' })),
      ...wikis.map((r) => ({ ...r, type: 'wiki' })),
      ...schedules.map((r) => ({ ...r, type: 'schedule' })),
      ...messages.map((r) => ({ ...r, type: 'message' })),
    ];

    res.json({
      query: q,
      results: allResults.slice(0, searchLimit),
      total: allResults.length,
      limit: searchLimit,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};

/**
 * Search notes using PostgreSQL FTS
 */
async function searchNotes(query, userId, limit) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('id, title, content, subject, year_level, author_id, created_at')
      .or(
        `title.ilike.%${query}%, content.ilike.%${query}%, subject.ilike.%${query}%`
      )
      .limit(limit);

    if (error) throw error;

    return (data || []).map((note) => ({
      id: note.id,
      title: note.title,
      excerpt: note.content.substring(0, 150),
      metadata: {
        subject: note.subject,
        yearLevel: note.year_level,
        authorId: note.author_id,
      },
      createdAt: note.created_at,
    }));
  } catch (error) {
    console.error('Error searching notes:', error.message);
    return [];
  }
}

/**
 * Search forum posts using PostgreSQL FTS
 */
async function searchPosts(query, userId, limit) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, content, category, created_at, author_id')
      .or(`title.ilike.%${query}%, content.ilike.%${query}%, category.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;

    return (data || []).map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.content.substring(0, 150),
      metadata: {
        category: post.category,
        authorId: post.author_id,
      },
      createdAt: post.created_at,
    }));
  } catch (error) {
    console.error('Error searching posts:', error.message);
    return [];
  }
}

/**
 * Search wiki pages using PostgreSQL FTS
 */
async function searchWikis(query, userId, limit) {
  try {
    const { data, error } = await supabase
      .from('wikipages')
      .select('id, title, slug, content, is_public, created_at, author_id')
      .or(`title.ilike.%${query}%, content.ilike.%${query}%`)
      .eq('is_public', true)
      .limit(limit);

    if (error) throw error;

    return (data || []).map((wiki) => ({
      id: wiki.id,
      title: wiki.title,
      excerpt: wiki.content.substring(0, 150),
      metadata: {
        slug: wiki.slug,
        isPublic: wiki.is_public,
        authorId: wiki.author_id,
      },
      createdAt: wiki.created_at,
    }));
  } catch (error) {
    console.error('Error searching wikis:', error.message);
    return [];
  }
}

/**
 * Search schedules
 */
async function searchSchedules(query, userId, limit) {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('id, event_name, description, event_type, start_time, user_id')
      .eq('user_id', userId)
      .or(`event_name.ilike.%${query}%, description.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;

    return (data || []).map((schedule) => ({
      id: schedule.id,
      title: schedule.event_name,
      excerpt: schedule.description || '',
      metadata: {
        type: schedule.event_type,
        startTime: schedule.start_time,
      },
      createdAt: schedule.start_time,
    }));
  } catch (error) {
    console.error('Error searching schedules:', error.message);
    return [];
  }
}

/**
 * Search direct messages
 */
async function searchMessages(query, userId, limit) {
  try {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('id, content, sender_id, receiver_id, created_at')
      .or(`content.ilike.%${query}%`)
      .or(`sender_id.eq.${userId}, receiver_id.eq.${userId}`)
      .limit(limit);

    if (error) throw error;

    return (data || []).map((msg) => ({
      id: msg.id,
      title: msg.content.substring(0, 50),
      excerpt: msg.content,
      metadata: {
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
      },
      createdAt: msg.created_at,
    }));
  } catch (error) {
    console.error('Error searching messages:', error.message);
    return [];
  }
}

/**
 * Search notes with filters
 */
export const searchNotesBySubject = async (req, res) => {
  try {
    const { subject, query, limit = SEARCH_LIMIT } = req.query;
    const userId = req.userId;

    if (!query || query.trim().length < MIN_SEARCH_CHARS) {
      throw new AppError('Search query too short', 400);
    }

    let queryBuilder = supabase
      .from('notes')
      .select('*')
      .or(`title.ilike.%${query}%, content.ilike.%${query}%`);

    if (subject) {
      queryBuilder = queryBuilder.eq('subject', subject);
    }

    const { data, error } = await queryBuilder.limit(parseInt(limit));

    if (error) throw new AppError(error.message, 500);

    res.json({ results: data || [], query });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};

/**
 * Search posts by category
 */
export const searchPostsByCategory = async (req, res) => {
  try {
    const { category, query, limit = SEARCH_LIMIT } = req.query;

    if (!query || query.trim().length < MIN_SEARCH_CHARS) {
      throw new AppError('Search query too short', 400);
    }

    let queryBuilder = supabase
      .from('posts')
      .select('*')
      .or(`title.ilike.%${query}%, content.ilike.%${query}%`);

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    const { data, error } = await queryBuilder.limit(parseInt(limit));

    if (error) throw new AppError(error.message, 500);

    res.json({ results: data || [], query });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};

/**
 * Autocomplete search for notes
 */
export const autocompleteNotes = async (req, res) => {
  try {
    const { prefix, limit = 10 } = req.query;

    if (!prefix || prefix.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const { data, error } = await supabase
      .from('notes')
      .select('id, title')
      .ilike('title', `${prefix}%`)
      .limit(parseInt(limit));

    if (error) throw new AppError(error.message, 500);

    res.json({
      suggestions: (data || []).map((n) => ({
        id: n.id,
        label: n.title,
      })),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};

/**
 * Autocomplete search for posts
 */
export const autocompletePosts = async (req, res) => {
  try {
    const { prefix, limit = 10 } = req.query;

    if (!prefix || prefix.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const { data, error } = await supabase
      .from('posts')
      .select('id, title')
      .ilike('title', `${prefix}%`)
      .limit(parseInt(limit));

    if (error) throw new AppError(error.message, 500);

    res.json({
      suggestions: (data || []).map((p) => ({
        id: p.id,
        label: p.title,
      })),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};

/**
 * Get recent searches from user
 */
export const getRecentSearches = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 10 } = req.query;

    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw new AppError(error.message, 500);

    res.json({ searches: data || [] });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};

/**
 * Save search query to history
 */
export const saveSearch = async (req, res) => {
  try {
    const userId = req.userId;
    const { query } = req.body;

    if (!query || query.trim().length < 2) {
      throw new AppError('Invalid search query', 400);
    }

    const { data, error } = await supabase
      .from('search_history')
      .insert([
        {
          user_id: userId,
          query: query.trim(),
        },
      ])
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    res.status(201).json({ saved: true, id: data.id });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};
