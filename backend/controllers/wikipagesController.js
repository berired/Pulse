import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

export const getWikipages = async (req, res) => {
  try {
    const userId = req.userId;

    const { data, error } = await supabase
      .from('wiki_pages')
      .select('*')
      .eq('user_id', userId)
      .is('parent_page_id', null) // Only root pages
      .order('created_at', { ascending: false });

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

export const createWikipage = async (req, res) => {
  try {
    const { title, slug, content, parentPageId, isPublic } = req.body;
    const userId = req.userId;

    if (!title || !slug) {
      throw new AppError('Missing required fields: title, slug', 400);
    }

    const { data, error } = await supabase
      .from('wiki_pages')
      .insert({
        user_id: userId,
        title,
        slug,
        content: content || {},
        parent_page_id: parentPageId,
        is_public: isPublic || false,
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      success: true,
      message: 'Wiki page created successfully',
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const updateWikipage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, isPublic } = req.body;
    const userId = req.userId;

    // Verify ownership
    const { data: page, error: fetchError } = await supabase
      .from('wiki_pages')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !page) {
      throw new AppError('Wiki page not found', 404);
    }

    if (page.user_id !== userId) {
      throw new AppError(
        'Unauthorized: You can only edit your own wiki pages',
        403
      );
    }

    const { data, error } = await supabase
      .from('wiki_pages')
      .update({
        title,
        slug,
        content,
        is_public: isPublic,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Wiki page updated successfully',
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteWikipage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify ownership
    const { data: page, error: fetchError } = await supabase
      .from('wiki_pages')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !page) {
      throw new AppError('Wiki page not found', 404);
    }

    if (page.user_id !== userId) {
      throw new AppError(
        'Unauthorized: You can only delete your own wiki pages',
        403
      );
    }

    const { error } = await supabase
      .from('wiki_pages')
      .delete()
      .eq('id', id);

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Wiki page deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};

export const getWikipageBySlug = async (req, res) => {
  try {
    const { userId, slug } = req.params;
    const currentUserId = req.userId; // May be undefined if not authenticated

    const { data: page, error } = await supabase
      .from('wiki_pages')
      .select('*')
      .eq('user_id', userId)
      .eq('slug', slug)
      .single();

    if (error || !page) {
      throw new AppError('Wiki page not found', 404);
    }

    // Check if page is public or user is owner
    if (!page.is_public && page.user_id !== currentUserId) {
      throw new AppError('This wiki page is private', 403);
    }

    res.json({
      success: true,
      data: page,
    });
  } catch (error) {
    throw error;
  }
};
