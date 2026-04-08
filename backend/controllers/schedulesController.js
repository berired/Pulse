import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

export const getSchedules = async (req, res) => {
  try {
    const userId = req.userId;
    const { eventType, startDate, endDate } = req.query;

    let query = supabase
      .from('schedules')
      .select('*')
      .eq('user_id', userId);

    if (eventType) query = query.eq('event_type', eventType);
    if (startDate) query = query.gte('start_time', startDate);
    if (endDate) query = query.lte('end_time', endDate);

    const { data, error } = await query.order('start_time', {
      ascending: true,
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

export const createSchedule = async (req, res) => {
  try {
    const {
      eventName,
      description,
      eventType,
      startTime,
      endTime,
      location,
      color,
      isAllDay,
    } = req.body;
    const userId = req.userId;

    if (!eventName || !eventType || !startTime || !endTime) {
      throw new AppError(
        'Missing required fields: eventName, eventType, startTime, endTime',
        400
      );
    }

    const { data, error } = await supabase
      .from('schedules')
      .insert({
        user_id: userId,
        event_name: eventName,
        description,
        event_type: eventType,
        start_time: startTime,
        end_time: endTime,
        location,
        color: color || '#1E293B',
        is_all_day: isAllDay || false,
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      success: true,
      message: 'Schedule event created successfully',
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      eventName,
      description,
      eventType,
      startTime,
      endTime,
      location,
      color,
      isAllDay,
    } = req.body;
    const userId = req.userId;

    // Verify ownership
    const { data: schedule, error: fetchError } = await supabase
      .from('schedules')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !schedule) {
      throw new AppError('Schedule event not found', 404);
    }

    if (schedule.user_id !== userId) {
      throw new AppError(
        'Unauthorized: You can only edit your own schedule events',
        403
      );
    }

    const { data, error } = await supabase
      .from('schedules')
      .update({
        event_name: eventName,
        description,
        event_type: eventType,
        start_time: startTime,
        end_time: endTime,
        location,
        color,
        is_all_day: isAllDay,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Schedule event updated successfully',
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify ownership
    const { data: schedule, error: fetchError } = await supabase
      .from('schedules')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !schedule) {
      throw new AppError('Schedule event not found', 404);
    }

    if (schedule.user_id !== userId) {
      throw new AppError(
        'Unauthorized: You can only delete your own schedule events',
        403
      );
    }

    const { error } = await supabase.from('schedules').delete().eq('id', id);

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Schedule event deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};
