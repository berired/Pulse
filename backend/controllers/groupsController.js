import supabase from '../config/supabase.js';
import { emitGroupMessageEvent } from '../config/pusher.js';
import { AppError } from '../middleware/errorHandler.js';
import { createNotificationInternal } from './notificationsController.js';

/**
 * Get all groups for current user
 */
export const getGroups = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const userId = req.userId;

    const { data: groups, count, error } = await supabase
      .from('message_groups')
      .select('*, group_members(count)', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json({
      groups,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};

/**
 * Create a new group
 */
export const createGroup = async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;
    const userId = req.userId;

    if (!name || !name.trim()) {
      throw new AppError('Group name is required', 400);
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      throw new AppError('At least one member must be specified', 400);
    }

    // Create group
    const { data: group, error: groupError } = await supabase
      .from('message_groups')
      .insert([
        {
          name: name.trim(),
          description: description || null,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (groupError) {
      throw new AppError(groupError.message, 500);
    }

    // Add creator as member
    const uniqueMembers = [...new Set([userId, ...memberIds])];

    const memberRecords = uniqueMembers.map((memberId) => ({
      group_id: group.id,
      user_id: memberId,
      joined_at: new Date().toISOString(),
    }));

    const { error: memberError } = await supabase
      .from('group_members')
      .insert(memberRecords);

    if (memberError) {
      throw new AppError(memberError.message, 500);
    }

    // Create notifications for all new members (excluding creator)
    for (const memberId of memberIds) {
      if (memberId !== userId) {
        await createNotificationInternal(
          memberId, // user who receives notification
          'group_invite', // type
          userId, // actor (the one creating the group)
          null, // target_user_id
          group.id // group_id
        );
      }
    }

    res.status(201).json({
      id: group.id,
      name: group.name,
      description: group.description,
      createdBy: group.created_by,
      createdAt: group.created_at,
      memberCount: uniqueMembers.length,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};

/**
 * Update group details
 */
export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;
    const userId = req.userId;

    // Verify user is group member
    const { data: member, error: memberError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !member) {
      throw new AppError('You are not a member of this group', 403);
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description) updateData.description = description;
    if (Object.keys(updateData).length === 0) {
      throw new AppError('No fields to update', 400);
    }

    const { data: group, error: updateError } = await supabase
      .from('message_groups')
      .update(updateData)
      .eq('id', groupId)
      .select()
      .single();

    if (updateError) {
      throw new AppError(updateError.message, 500);
    }

    res.json(group);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};

/**
 * Get group messages
 */
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.userId;

    // Verify user is member
    const { data: member, error: memberError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !member) {
      throw new AppError('You are not a member of this group', 403);
    }

    const { data: messages, count, error } = await supabase
      .from('group_messages')
      .select('*, sender:user_id(*)', { count: 'exact' })
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json({
      messages: messages.reverse(),
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};

/**
 * Send message to group
 */
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!content || !content.trim()) {
      throw new AppError('Message content is required', 400);
    }

    // Verify user is member
    const { data: member, error: memberError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !member) {
      throw new AppError('You are not a member of this group', 403);
    }

    const { data: message, error } = await supabase
      .from('group_messages')
      .insert([
        {
          group_id: groupId,
          user_id: userId,
          content: content.trim(),
        },
      ])
      .select('*, sender:user_id(id, name, email)')
      .single();

    if (error) {
      throw new AppError(error.message, 500);
    }

    // Emit real-time event
    await emitGroupMessageEvent(groupId, 'new-message', {
      id: message.id,
      senderId: message.user_id,
      senderName: message.sender.name,
      content: message.content,
      createdAt: message.created_at,
    });

    res.status(201).json({
      id: message.id,
      groupId: message.group_id,
      content: message.content,
      sender: message.sender,
      createdAt: message.created_at,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};

/**
 * Delete group message
 */
export const deleteGroupMessage = async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const userId = req.userId;

    // Get message and verify ownership
    const { data: message, error: fetchError } = await supabase
      .from('group_messages')
      .select('*')
      .eq('id', messageId)
      .eq('group_id', groupId)
      .single();

    if (fetchError || !message) {
      throw new AppError('Message not found', 404);
    }

    if (message.user_id !== userId) {
      throw new AppError('You can only delete your own messages', 403);
    }

    const { error } = await supabase
      .from('group_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      throw new AppError(error.message, 500);
    }

    // Emit real-time event
    await emitGroupMessageEvent(groupId, 'message-deleted', {
      messageId,
      deletedAt: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};

/**
 * Add member to group
 */
export const addGroupMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId: newMemberId } = req.body;
    const userId = req.userId;

    if (!newMemberId) {
      throw new AppError('User ID is required', 400);
    }

    // Verify requester is group member
    const { data: member, error: memberError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !member) {
      throw new AppError('You are not a member of this group', 403);
    }

    // Check if new member already exists
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', newMemberId)
      .single();

    if (existing) {
      throw new AppError('User is already a member', 400);
    }

    // Add new member
    const { data: newMember, error } = await supabase
      .from('group_members')
      .insert([
        {
          group_id: groupId,
          user_id: newMemberId,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.status(201).json({
      success: true,
      message: 'Member added',
      memberId: newMemberId,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};

/**
 * Remove member from group
 */
export const removeGroupMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.userId;

    // Verify requester is group member
    const { data: member, error: memberError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !member) {
      throw new AppError('You are not a member of this group', 403);
    }

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', memberId);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};

/**
 * Get group members
 */
export const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    // Verify user is member
    const { data: member, error: memberError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !member) {
      throw new AppError('You are not a member of this group', 403);
    }

    const { data: members, error } = await supabase
      .from('group_members')
      .select('user_id, user:user_id(*), joined_at')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.json({
      members: members.map((m) => ({
        userId: m.user_id,
        user: m.user,
        joinedAt: m.joined_at,
      })),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.name,
      message: error.message,
    });
  }
};
