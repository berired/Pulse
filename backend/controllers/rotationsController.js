import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

// ============ ROTATIONS ============

export const getRotations = async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    let query = supabase
      .from('clinical_rotations')
      .select('*, rotation_tasks(*)')
      .eq('user_id', userId);

    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('start_date', {
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

export const createRotation = async (req, res) => {
  try {
    const { title, rotationType, startDate, endDate, status } = req.body;
    const userId = req.userId;

    if (!title || !rotationType) {
      throw new AppError(
        'Missing required fields: title, rotationType',
        400
      );
    }

    const { data, error } = await supabase
      .from('clinical_rotations')
      .insert({
        user_id: userId,
        title,
        rotation_type: rotationType,
        start_date: startDate,
        end_date: endDate,
        status: status || 'Pending',
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      success: true,
      message: 'Clinical rotation created successfully',
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const updateRotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, rotationType, startDate, endDate, status } = req.body;
    const userId = req.userId;

    // Verify ownership
    const { data: rotation, error: fetchError } = await supabase
      .from('clinical_rotations')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !rotation) {
      throw new AppError('Rotation not found', 404);
    }

    if (rotation.user_id !== userId) {
      throw new AppError(
        'Unauthorized: You can only edit your own rotations',
        403
      );
    }

    const { data, error } = await supabase
      .from('clinical_rotations')
      .update({
        title,
        rotation_type: rotationType,
        start_date: startDate,
        end_date: endDate,
        status,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Clinical rotation updated successfully',
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteRotation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify ownership
    const { data: rotation, error: fetchError } = await supabase
      .from('clinical_rotations')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !rotation) {
      throw new AppError('Rotation not found', 404);
    }

    if (rotation.user_id !== userId) {
      throw new AppError(
        'Unauthorized: You can only delete your own rotations',
        403
      );
    }

    const { error } = await supabase
      .from('clinical_rotations')
      .delete()
      .eq('id', id);

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Clinical rotation deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};

// ============ ROTATION TASKS ============

export const getRotationTasks = async (req, res) => {
  try {
    const { rotationId } = req.params;

    const { data, error } = await supabase
      .from('rotation_tasks')
      .select('*')
      .eq('rotation_id', rotationId)
      .order('position', { ascending: true });

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

export const createRotationTask = async (req, res) => {
  try {
    const { rotationId } = req.params;
    const { title, description, stage, priority, dueDate } = req.body;

    if (!title || !stage) {
      throw new AppError('Missing required fields: title, stage', 400);
    }

    const { data, error } = await supabase
      .from('rotation_tasks')
      .insert({
        rotation_id: rotationId,
        title,
        description,
        stage,
        priority: priority || 'Medium',
        due_date: dueDate,
        position: 0,
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const updateRotationTask = async (req, res) => {
  try {
    const { rotationId, taskId } = req.params;
    const { title, description, stage, priority, dueDate, position } = req.body;

    const { data, error } = await supabase
      .from('rotation_tasks')
      .update({
        title,
        description,
        stage,
        priority,
        due_date: dueDate,
        position,
      })
      .eq('id', taskId)
      .eq('rotation_id', rotationId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteRotationTask = async (req, res) => {
  try {
    const { rotationId, taskId } = req.params;

    const { error } = await supabase
      .from('rotation_tasks')
      .delete()
      .eq('id', taskId)
      .eq('rotation_id', rotationId);

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};
