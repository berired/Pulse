import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { usePosts, useUserVotes, useUpdatePost, useDeletePost } from '../hooks/useQueries';
import { supabase } from '../services/supabase';
import BreakroomPostCard from '../components/BreakroomPostCard';
import CreatePostModal from '../components/CreatePostModal';
import './Breakroom.css';

const CATEGORIES = [
  'All',
  'Clinical Stress',
  'Exam Prep',
  'Venting',
  'Study Tips',
  'Career Advice',
  'General Discussion',
];

function Breakroom() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filters = {
    category: selectedCategory === 'All' ? null : selectedCategory,
    search: searchInput,
  };

  const { data: posts = [], isLoading } = usePosts(filters);
  const postIds = posts.map(p => p.id);
  const { data: userVotes = {} } = useUserVotes(user?.id, postIds);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            author_id: user.id,
            ...postData,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postsByAuthor'] });
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
    },
  });

  // Update post mutation
  const updatePostMutation = useUpdatePost();

  // Delete post mutation
  const deletePostMutation = useDeletePost();

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ postId, voteType }) => {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (voteType === null) {
        // Remove vote
        if (existingVote) {
          const { error } = await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id);

          if (error) throw error;
        }
      } else if (existingVote) {
        // Update vote
        const { error } = await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);

        if (error) throw error;
      } else {
        // Insert new vote
        const { error } = await supabase.from('votes').insert([
          {
            user_id: user.id,
            post_id: postId,
            vote_type: voteType,
          },
        ]);

        if (error) throw error;
      }

      // Calculate new vote count (only upvotes)
      const { data: votes } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('post_id', postId);

      const upvoteCount = votes?.filter(v => v.vote_type === 'upvote').length || 0;

      // Update post vote count
      const { error: updateError } = await supabase
        .from('posts')
        .update({ vote_count: upvoteCount })
        .eq('id', postId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
    },
  });

  const handleCreatePost = async (postData) => {
    try {
      await createPostMutation.mutateAsync(postData);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleEditPost = async (postData) => {
    try {
      console.log('Editing post:', postData);
      await updatePostMutation.mutateAsync(postData);
      console.log('Post edited successfully');
    } catch (error) {
      console.error('Failed to edit post:', error);
      alert(`Failed to edit post: ${error.message}`);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      console.log('Deleting post:', postId);
      await deletePostMutation.mutateAsync(postId);
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert(`Failed to delete post: ${error.message}`);
    }
  };

  const handleVote = async (voteData) => {
    try {
      await voteMutation.mutateAsync(voteData);
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  return (
    <div className="breakroom-page">
      <header className="breakroom-header">
        <div className="header-content">
          <h1>The Breakroom</h1>
          <p>Community forum for nursing students: discussions, advice, and support</p>
        </div>
        <button className="start-discussion-btn" onClick={() => setIsModalOpen(true)}>
          + Start Discussion
        </button>
      </header>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
        isLoading={createPostMutation.isPending}
      />

      <div className="breakroom-container">
        {/* Filter Section */}
        <section className="filter-section">
          <div className="category-filter">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search discussions..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
        </section>

        {/* Posts Section */}
        <section className="posts-section">
          {isLoading ? (
            <div className="loading">Loading discussions...</div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <p>No discussions found. Be the first to start a conversation!</p>
            </div>
          ) : (
            <div className="posts-feed">
              {posts.map((post) => (
                <BreakroomPostCard
                  key={post.id}
                  post={post}
                  onVote={handleVote}
                  currentUserId={user.id}
                  currentVote={userVotes[post.id]}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Breakroom;
