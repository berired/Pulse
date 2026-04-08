import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { usePosts, useUserVotes } from '../hooks/useQueries';
import { supabase } from '../services/supabase';
import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm';
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
    },
  });

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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleCreatePost = async (postData) => {
    try {
      await createPostMutation.mutateAsync(postData);
    } catch (error) {
      console.error('Failed to create post:', error);
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
      </header>

      <div className="breakroom-container">
        {/* Create Post Section */}
        <section className="create-section">
          <CreatePostForm
            onSubmit={handleCreatePost}
            isLoading={createPostMutation.isPending}
          />
        </section>

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
              <p>No discussions found. Start the conversation!</p>
            </div>
          ) : (
            <div className="posts-feed">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onVote={handleVote}
                  onOpenThread={() => {}}
                  currentUserId={user.id}
                  currentVote={userVotes[post.id]}
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
