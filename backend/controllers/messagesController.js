import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { emitMessageEvent } from '../config/pusher.js';

export const getDirectMessages = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.userId;

    if (!otherUserId) {
      throw new AppError('User ID is required', 400);
    }

    // Get all messages between two users
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*, sender:profiles(id,username,avatar_url)')
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
      )
      .order('created_at', { ascending: true });

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

export const sendDirectMessage = async (req, res) => {
  try {
    const { userId: receiverId } = req.params;
    const { body } = req.body;
    const senderId = req.userId;

    if (!receiverId) {
      throw new AppError('Receiver ID is required', 400);
    }

    if (!body || !body.trim()) {
      throw new AppError('Message body is required', 400);
    }

    // Verify receiver exists
    const { data: receiver, error: receiverError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', receiverId)
      .single();

    if (receiverError || !receiver) {
      throw new AppError('Receiver not found', 404);
    }

    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        body: body.trim(),
        is_read: false,
      })
      .select('*, sender:profiles(id,username,avatar_url)')
      .single();

    if (error) throw new AppError(error.message, 400);

    // Emit Pusher event for real-time messaging
    const channel = `direct-messages-${[senderId, receiverId].sort().join('-')}`;
    await emitMessageEvent(channel, 'new-message', {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      body: data.body,
      createdAt: data.created_at,
      sender: data.sender,
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    // Verify message exists and user is receiver
    const { data: message, error: messageError } = await supabase
      .from('direct_messages')
      .select('id, receiver_id')
      .eq('id', messageId)
      .single();

    if (messageError || !message) {
      throw new AppError('Message not found', 404);
    }

    if (message.receiver_id !== userId) {
      throw new AppError(
        'Unauthorized: You can only mark your received messages as read',
        403
      );
    }

    const { data, error } = await supabase
      .from('direct_messages')
      .update({
        is_read: true,
        read_at: new Date(),
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.json({
      success: true,
      message: 'Message marked as read',
      data,
    });
  } catch (error) {
    throw error;
  }
};
