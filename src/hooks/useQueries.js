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
        .select('*, profiles(username, avatar_url), post_comments(count)');

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
      const { data, error } = await supabase
        .from('care_plans')
        .insert([careplanData])
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
