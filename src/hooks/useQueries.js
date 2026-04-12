import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

// Notes Queries and Mutations
export function useNotes(filters = {}) {
  return useQuery({
    queryKey: ['notes', filters],
    queryFn: async () => {
      let query = supabase.from('notes').select('*, profiles(username, avatar_url)');

      if (filters.subject) {
        query = query.eq('subject', filters.subject);
      }
      if (filters.yearLevel) {
        query = query.eq('year_level', filters.yearLevel);
      }
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteData) => {
      const { data, error } = await supabase
        .from('notes')
        .insert([noteData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId) => {
      const { error } = await supabase.from('notes').delete().eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

// Posts Queries and Mutations
export function usePosts(filters = {}) {
  return useQuery({
    queryKey: ['posts', filters],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select('*, profiles(id, username, avatar_url, full_name), post_comments(*)');

      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.search) {
        query = query.ilike('content', `%${filters.search}%`);
      }

      const { data, error } = await query
        .order('is_pinned', { ascending: false })
        .order('vote_count', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Get posts by a specific author
export function usePostsByAuthor(authorId) {
  return useQuery({
    queryKey: ['postsByAuthor', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(id, username, avatar_url, full_name), post_comments(*)')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!authorId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData) => {
      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postsByAuthor'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      console.log('Mutation: Updating post', { id, updates });
      // Add updated_at timestamp
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      console.log('Update data with timestamp:', updateData);
      
      const { data, error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id)
        .select('*, profiles(id, username, avatar_url, full_name), post_comments(*)')
        .single();

      if (error) {
        console.error('Update error from Supabase:', error);
        console.error('Error details:', { message: error.message, code: error.code, details: error.details });
        throw error;
      }
      console.log('Update success:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Update onSuccess: Invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postsByAuthor'] });
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId) => {
      console.log('Mutation: Deleting post', postId);
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Delete error from Supabase:', error);
        console.error('Error details:', { message: error.message, code: error.code, details: error.details });
        throw new Error(`Failed to delete post: ${error.message}`);
      }
      console.log('Delete success for post:', postId);
    },
    onSuccess: (data, postId) => {
      console.log('Delete onSuccess: Invalidating queries for post:', postId);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postsByAuthor'] });
    },
    onError: (error, postId) => {
      console.error('Delete mutation error for post', postId, ':', error.message);
    },
  });
}

// Post Comments
export function usePostComments(postId) {
  return useQuery({
    queryKey: ['postComments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*, profiles(id, username, avatar_url, full_name)')
        .eq('post_id', postId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!postId,
  });
}

export function useCreatePostComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentData) => {
      const { data, error } = await supabase
        .from('post_comments')
        .insert([commentData])
        .select('*, profiles(id, username, avatar_url, full_name)')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['postComments', variables.post_id],
      });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePostComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, post_id, ...updates }) => {
      const { data, error } = await supabase
        .from('post_comments')
        .update(updates)
        .eq('id', id)
        .select('*, profiles(id, username, avatar_url, full_name)')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['postComments', variables.post_id],
      });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postsByAuthor'] });
    },
  });
}

export function useDeletePostComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, postId }) => {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['postComments', variables.postId],
      });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postsByAuthor'] });
    },
  });
}

// Direct Messages
export function useDirectMessages(userId, otherUserId) {
  const channelName = `direct-message-${[userId, otherUserId].sort().join('-')}`;

  return useQuery({
    queryKey: ['directMessages', userId, otherUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useSendDirectMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ senderId, receiverId, body }) => {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert([
          {
            sender_id: senderId,
            receiver_id: receiverId,
            body,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['directMessages', data.sender_id, data.receiver_id],
      });
    },
  });
}

// Schedules
export function useSchedules(userId) {
  return useQuery({
    queryKey: ['schedules', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleData) => {
      const { data, error } = await supabase
        .from('schedules')
        .insert([scheduleData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleData) => {
      const { id, ...updateData } = scheduleData;
      const { data, error } = await supabase
        .from('schedules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleId) => {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;
      return scheduleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}

// Wiki Pages
export function useWikiPages(userId) {
  return useQuery({
    queryKey: ['wikiPages', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('user_id', userId)
        .is('parent_page_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Clinical Rotations
export function useClinicalRotations(userId) {
  return useQuery({
    queryKey: ['clinicalRotations', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinical_rotations')
        .select('*, rotation_tasks(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateClinicalRotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rotationData) => {
      const { data, error } = await supabase
        .from('clinical_rotations')
        .insert([rotationData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicalRotations'] });
    },
  });
}

export function useUpdateClinicalRotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rotationData) => {
      const { id, ...updateData } = rotationData;
      const { data, error } = await supabase
        .from('clinical_rotations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicalRotations'] });
    },
  });
}

export function useDeleteClinicalRotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rotationId) => {
      const { error } = await supabase
        .from('clinical_rotations')
        .delete()
        .eq('id', rotationId);

      if (error) throw error;
      return rotationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicalRotations'] });
    },
  });
}

export function useUpdateRotationTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('rotation_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicalRotations'] });
    },
  });
}

export function useCareplansByUser(userId) {
  return useQuery({
    queryKey: ['careplans', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useCreateCareplan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (careplanData) => {
      const { userId, ...data } = careplanData;
      const { data: result, error } = await supabase
        .from('care_plans')
        .insert([{ ...data, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['careplans', variables.userId],
      });
    },
  });
}

export function useUpdateCareplan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (careplanData) => {
      const { id, userId, ...updateData } = careplanData;
      const { data, error } = await supabase
        .from('care_plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['careplans', variables.userId],
      });
    },
  });
}

export function useDeleteCareplan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }) => {
      const { error } = await supabase
        .from('care_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['careplans', variables.userId],
      });
    },
  });
}

export function useWikiPagesByUser(userId) {
  return useQuery({
    queryKey: ['wikipages', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('user_id', userId)
        .is('parent_page_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useCreateWikiPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wikipageData) => {
      const { data, error } = await supabase
        .from('wiki_pages')
        .insert([wikipageData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['wikipages', variables.userId],
      });
    },
  });
}

// Dashboard Stats Queries
export function useAllUsersCount() {
  return useQuery({
    queryKey: ['usersCount'],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    },
  });
}

// User Engagement Metrics
export function useUserEngagementMetrics(userId) {
  return useQuery({
    queryKey: ['engagementMetrics', userId],
    queryFn: async () => {
      try {
        // Get user's posts
        const postsRes = await supabase
          .from('posts')
          .select('id')
          .eq('author_id', userId);

        // Get user's notes
        const notesRes = await supabase
          .from('notes')
          .select('id')
          .eq('user_id', userId);

        // Get user's votes
        const votesRes = await supabase
          .from('votes')
          .select('id')
          .eq('user_id', userId);

        const postsCount = postsRes.data?.length || 0;
        const notesCount = notesRes.data?.length || 0;
        const votesCount = votesRes.data?.length || 0;

        // Total engagement = posts + notes + votes
        const totalEngagement = postsCount + notesCount + votesCount;

        // Calculate engagement percentage (out of potential max of 100)
        const engagementPercentage = Math.min(Math.round((totalEngagement / 10) * 100), 100);

        return {
          engagementPercentage,
          postsCount,
          notesCount,
          votesCount,
          totalEngagement,
        };
      } catch (error) {
        console.error('Error calculating engagement metrics:', error);
        return {
          engagementPercentage: 0,
          postsCount: 0,
          notesCount: 0,
          votesCount: 0,
          totalEngagement: 0,
        };
      }
    },
    enabled: !!userId,
  });
}

// User Votes
export function useUserVotes(userId, postIds = []) {
  return useQuery({
    queryKey: ['userVotes', userId, postIds],
    queryFn: async () => {
      if (postIds.length === 0) return {};

      const { data, error } = await supabase
        .from('votes')
        .select('post_id, vote_type')
        .eq('user_id', userId)
        .in('post_id', postIds);

      if (error) throw error;

      // Convert to object for easier lookup
      const votesMap = {};
      data?.forEach((vote) => {
        votesMap[vote.post_id] = vote;
      });
      return votesMap;
    },
    enabled: !!userId && postIds.length > 0,
  });
}

// Followers/Following Queries
export function useFollowersCount(userId) {
  return useQuery({
    queryKey: ['followersCount', userId],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('followers')
        .select('id', { count: 'exact' })
        .eq('following_id', userId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });
}

export function useFollowingCount(userId) {
  return useQuery({
    queryKey: ['followingCount', userId],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('followers')
        .select('id', { count: 'exact' })
        .eq('follower_id', userId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });
}

export function useFollowers(userId) {
  return useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('followers')
        .select('follower:follower_id(id, username, avatar_url)')
        .eq('following_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(f => f.follower) || [];
    },
    enabled: !!userId,
  });
}

export function useFollowing(userId) {
  return useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('followers')
        .select('following:following_id(id, username, avatar_url)')
        .eq('follower_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(f => f.following) || [];
    },
    enabled: !!userId,
  });
}

export function useIsFollowing(currentUserId, targetUserId) {
  return useQuery({
    queryKey: ['isFollowing', currentUserId, targetUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .single();

      if (error?.code === 'PGRST116') {
        // Not following
        return false;
      }
      if (error) throw error;
      return !!data;
    },
    enabled: !!currentUserId && !!targetUserId && currentUserId !== targetUserId,
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ currentUserId, targetUserId, isFollowing }) => {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId);

        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert({
            follower_id: currentUserId,
            following_id: targetUserId,
          });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['followersCount', variables.targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['followingCount', variables.currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing', variables.currentUserId, variables.targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['followers', variables.targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['following', variables.currentUserId] });
    },
  });
}

// Search Users Query (for profile/navbar search)
export function useSearchUsers(searchQuery) {
  return useQuery({
    queryKey: ['searchUsers', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.trim().length < 1) {
        return [];
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, nursing_year, institution, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .limit(10)
        .order('username', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!searchQuery && searchQuery.trim().length > 0,
  });
}

// Search Users for Messaging (separate from profile search)
export function useSearchGroupUsers(currentUserId, searchQuery) {
  return useQuery({
    queryKey: ['searchGroupUsers', currentUserId, searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.trim().length < 1) {
        return [];
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .neq('id', currentUserId)
        .ilike('username', `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!searchQuery && searchQuery.trim().length > 0,
  });
}
