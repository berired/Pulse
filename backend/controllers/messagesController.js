import supabase from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { emitMessageEvent } from '../config/pusher.js';
import { createNotificationInternal } from './notificationsController.js';

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
      .select('id, sender_id, receiver_id, body, created_at, is_read, sender:sender_id(id,username,avatar_url)')
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
      .select('id, sender_id, receiver_id, body, created_at, is_read')
      .single();

    if (error) throw new AppError(error.message, 400);

    // Emit Pusher event for real-time messaging - use correct channel name with private- prefix
    const sortedIds = [senderId, receiverId].sort();
    const channel = `private-dm-${sortedIds[0]}-${sortedIds[1]}`;
    await emitMessageEvent(channel, 'message', {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      body: data.body,
      createdAt: data.created_at,
    });

    // Also emit to user-specific channels for conversations list refresh
    await emitMessageEvent(`private-conversations-${senderId}`, 'message-sent', { senderId, receiverId });
    await emitMessageEvent(`private-conversations-${receiverId}`, 'message-received', { senderId, receiverId });

    // Create notification for new message
    await createNotificationInternal(
      receiverId, // user who receives notification
      'message', // type
      senderId, // actor (the one sending)
      null, // target_user_id
      null, // group_id
      data.id // message_id
    );

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

// Direct Message Requests
export const sendDirectMessageRequest = async (req, res) => {
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

    // Check if request already exists
    const { data: existingRequest } = await supabase
      .from('direct_message_requests')
      .select('id, status')
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId)
      .single();

    if (existingRequest && existingRequest.status === 'pending') {
      throw new AppError('Message request already sent', 400);
    }

    if (existingRequest && existingRequest.status === 'accepted') {
      // If already accepted, send as normal message
      return sendDirectMessage(req, res);
    }

    // Create the message with pending status
    const { data: message, error: msgError } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        body: body.trim(),
        is_read: false,
        is_request: true,
        status: 'pending',
      })
      .select('id, sender_id, receiver_id, body, created_at, sender:profiles!direct_messages_sender_id_fkey(id,username,avatar_url)')
      .single();

    if (msgError) throw new AppError(msgError.message, 400);

    // Create request record
    const { error: reqError } = await supabase
      .from('direct_message_requests')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        first_message_id: message.id,
        status: 'pending',
      });

    if (reqError && !reqError.message.includes('duplicate')) {
      throw new AppError(reqError.message, 400);
    }

    // Emit Pusher event for real-time notification
    const channel = `private-requests-${receiverId}`;
    await emitMessageEvent(channel, 'new-request', {
      id: message.id,
      senderId: message.sender_id,
      receiverId: message.receiver_id,
      body: message.body,
      createdAt: message.created_at,
      sender: message.sender,
    });

    // Create notification for message request
    await createNotificationInternal(
      receiverId, // user who receives notification
      'message', // type
      senderId, // actor (the one sending)
      null, // target_user_id
      null, // group_id
      message.id // message_id
    );

    res.status(201).json({
      success: true,
      message: 'Message request sent',
      data: message,
    });
  } catch (error) {
    throw error;
  }
};

export const getPendingDirectMessageRequests = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new AppError('User ID not found in request', 400);
    }

    const { data, error } = await supabase
      .from('direct_message_requests')
      .select(`
        id,
        sender_id,
        receiver_id,
        status,
        created_at,
        sender:profiles!direct_message_requests_sender_id_fkey(id,username,avatar_url,bio)
      `)
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching message requests:', error);
      // If table doesn't exist, return empty array instead of failing
      if (error.message.includes('relation') || error.message.includes('not found')) {
        return res.json({
          success: true,
          data: [],
          count: 0,
          note: 'Message requests table not yet initialized',
        });
      }
      throw new AppError(`Database error: ${error.message}`, 400);
    }

    res.json({
      success: true,
      data: data || [],
      count: (data || []).length,
    });
  } catch (error) {
    throw error;
  }
};

export const respondDirectMessageRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    const userId = req.userId;

    if (!['accept', 'decline'].includes(action)) {
      throw new AppError('Invalid action. Must be accept or decline', 400);
    }

    // Verify request exists and user is receiver
    const { data: request, error: reqError } = await supabase
      .from('direct_message_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (reqError || !request) {
      throw new AppError('Request not found', 404);
    }

    if (request.receiver_id !== userId) {
      throw new AppError('Unauthorized: Can only respond to your own requests', 403);
    }

    if (request.status !== 'pending') {
      throw new AppError('Request has already been responded to', 400);
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    // Update request status
    const { data, error } = await supabase
      .from('direct_message_requests')
      .update({
        status: newStatus,
        responded_at: new Date(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    // Emit Pusher event
    const channel = `message-requests-${request.sender_id}`;
    await emitMessageEvent(channel, 'request-response', {
      requestId: data.id,
      status: newStatus,
      respondedBy: userId,
    });

    res.json({
      success: true,
      message: `Message request ${newStatus}`,
      data,
    });
  } catch (error) {
    throw error;
  }
};

// Group Chat (Cohort) Member Requests
export const sendGroupInvite = async (req, res) => {
  try {
    const { userId: newMemberId } = req.params;
    const { cohortId } = req.body;
    const inviterId = req.userId;

    if (!cohortId || !newMemberId) {
      throw new AppError('Cohort ID and user ID are required', 400);
    }

    // Verify cohort exists
    const { data: cohort, error: cohortError } = await supabase
      .from('cohorts')
      .select('id')
      .eq('id', cohortId)
      .single();

    if (cohortError || !cohort) {
      throw new AppError('Cohort not found', 404);
    }

    // Verify inviter is in cohort
    const { data: inviterMember } = await supabase
      .from('cohort_members')
      .select('id')
      .eq('cohort_id', cohortId)
      .eq('user_id', inviterId)
      .single();

    if (!inviterMember) {
      throw new AppError('You must be a member of this cohort to invite others', 403);
    }

    // Verify new member exists
    const { data: newMember, error: memberError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', newMemberId)
      .single();

    if (memberError || !newMember) {
      throw new AppError('User not found', 404);
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('cohort_members')
      .select('id')
      .eq('cohort_id', cohortId)
      .eq('user_id', newMemberId)
      .single();

    if (existingMember) {
      throw new AppError('User is already a member of this cohort', 400);
    }

    // Create invite request
    const { data, error } = await supabase
      .from('cohort_member_requests')
      .insert({
        cohort_id: cohortId,
        user_id: newMemberId,
        invited_by: inviterId,
        status: 'pending',
      })
      .select(`
        id,
        cohort_id,
        user_id,
        invited_by,
        status,
        created_at,
        inviter:profiles!cohort_member_requests_invited_by_fkey(id,username,avatar_url),
        cohort:cohorts(id,name)
      `)
      .single();

    if (error) {
      if (error.message.includes('duplicate')) {
        throw new AppError('User has already been invited to this cohort', 400);
      }
      throw new AppError(error.message, 400);
    }

    // Emit Pusher event
    const channel = `private-invites-${newMemberId}`;
    await emitMessageEvent(channel, 'new-invite', {
      requestId: data.id,
      cohortId: data.cohort_id,
      invitedBy: data.invited_by,
      cohortName: data.cohort.name,
    });

    // Create notification for group invite
    await createNotificationInternal(
      newMemberId, // user who receives notification
      'group_invite', // type
      inviterId, // actor (the one sending invite)
      null, // target_user_id
      cohortId // group_id
    );

    res.status(201).json({
      success: true,
      message: 'Invite sent successfully',
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const getPendingGroupInvites = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new AppError('User ID not found in request', 400);
    }

    const { data, error } = await supabase
      .from('cohort_member_requests')
      .select(`
        id,
        cohort_id,
        user_id,
        invited_by,
        status,
        created_at,
        cohort:cohorts(id,name,description),
        inviter:profiles!cohort_member_requests_invited_by_fkey(id,username,avatar_url)
      `)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching group invites:', error);
      // If table doesn't exist, return empty array instead of failing
      if (error.message.includes('relation') || error.message.includes('not found')) {
        return res.json({
          success: true,
          data: [],
          count: 0,
          note: 'Group invites table not yet initialized',
        });
      }
      throw new AppError(`Database error: ${error.message}`, 400);
    }

    res.json({
      success: true,
      data: data || [],
      count: (data || []).length,
    });
  } catch (error) {
    throw error;
  }
};

export const respondGroupInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    const userId = req.userId;

    if (!['accept', 'decline'].includes(action)) {
      throw new AppError('Invalid action. Must be accept or decline', 400);
    }

    // Verify invite exists and user is the invitee
    const { data: invite, error: inviteError } = await supabase
      .from('cohort_member_requests')
      .select('*')
      .eq('id', inviteId)
      .single();

    if (inviteError || !invite) {
      throw new AppError('Invite not found', 404);
    }

    if (invite.user_id !== userId) {
      throw new AppError('Unauthorized: Can only respond to your own invites', 403);
    }

    if (invite.status !== 'pending') {
      throw new AppError('Invite has already been responded to', 400);
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    // Update invite status
    const { data, error } = await supabase
      .from('cohort_member_requests')
      .update({
        status: newStatus,
        responded_at: new Date(),
      })
      .eq('id', inviteId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    // If accepted, add user to cohort members
    if (action === 'accept') {
      const { error: addError } = await supabase
        .from('cohort_members')
        .insert({
          cohort_id: invite.cohort_id,
          user_id: userId,
        });

      if (addError && !addError.message.includes('duplicate')) {
        throw new AppError(addError.message, 400);
      }
    }

    // Emit Pusher event
    const channel = `group-invites-${invite.invited_by}`;
    await emitMessageEvent(channel, 'invite-response', {
      inviteId: data.id,
      cohortId: invite.cohort_id,
      userId: userId,
      status: newStatus,
    });

    res.json({
      success: true,
      message: `Group invite ${newStatus}`,
      data,
    });
  } catch (error) {
    throw error;
  }
};
