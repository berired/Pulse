import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

export const getPosts = async (req, res) => {
  try {
    const { category, search, sortBy } = req.query;

    let query = supabase
      .from('posts')
      .select('*, profiles(username, avatar_url)');

    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('content', `%${search}%`);

    const { data, error } = await query.order(
      sortBy === 'recent' ? 'created_at' : 'vote_count',
      { ascending: false }
    );

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

export const createPost = async (req, res) => {
  try {
    const { content, category } = req.body;
    const userId = req.userId;

    if (!content || !category) {
      throw new AppError('Missing required fields: content, category', 400);
    }

    if (content.length > 5000) {
      throw new AppError('Post content exceeds 5000 character limit', 400);
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: userId,
        content,
        category,
        vote_count: 0,
      })
      .select('*, profiles(username, avatar_url)')
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, category } = req.body;
    const userId = req.userId;

    // Verify ownership
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !post) {
      throw new AppError('Post not found', 404);
    }

    if (post.author_id !== userId) {
      throw new AppError('Unauthorized: You can only edit your own posts', 403);
    }

    const { data, error } = await supabase
      .from('posts')
      .update({
        content,
        category,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select('*, profiles(username, avatar_url)')
      .single();

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Post updated successfully',
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify ownership
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !post) {
      throw new AppError('Post not found', 404);
    }

    if (post.author_id !== userId) {
      throw new AppError('Unauthorized: You can only delete your own posts', 403);
    }

    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};

export const votePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;
    const userId = req.userId;

    if (!['upvote', 'downvote'].includes(voteType)) {
      throw new AppError('Vote type must be upvote or downvote', 400);
    }

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', id)
      .single();

    if (postError || !post) {
      throw new AppError('Post not found', 404);
    }

    // Check existing vote
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id, vote_type')
      .eq('post_id', id)
      .eq('user_id', userId)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if same type
        await supabase
          .from('votes')
          .delete()
          .eq('post_id', id)
          .eq('user_id', userId);
      } else {
        // Update vote if different type
        await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('post_id', id)
          .eq('user_id', userId);
      }
    } else {
      // Insert new vote
      await supabase.from('votes').insert({
        post_id: id,
        user_id: userId,
        vote_type: voteType,
      });
    }

    // Calculate updated vote count
    const { data: votes } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('post_id', id);

    const voteCount =
      votes?.reduce((sum, v) => {
        return sum + (v.vote_type === 'upvote' ? 1 : -1);
      }, 0) || 0;

    // Update post vote count
    await supabase
      .from('posts')
      .update({ vote_count: voteCount })
      .eq('id', id);

    res.json({
      success: true,
      message: 'Vote submitted successfully',
      voteCount,
    });
  } catch (error) {
    throw error;
  }
};
