import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPosts } from '../lib/posts';
import { PostCard } from '../components/PostCard';
import type { Post } from '../types/post';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const lastPostRef = useRef<Post | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const result = await getPosts(lastPostRef.current);
      setPosts(prev => [...prev, ...result.posts]);
      setHasMore(result.hasMore);
      lastPostRef.current = result.posts[result.posts.length - 1] || null;
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadInitialPosts = async () => {
      try {
        const result = await getPosts();
        setPosts(result.posts);
        setHasMore(result.hasMore);
        lastPostRef.current = result.posts[result.posts.length - 1] || null;
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialPosts();
  }, [user, navigate]);

  useEffect(() => {
    if (loading) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreTriggerRef.current) {
      observerRef.current.observe(loadMoreTriggerRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [loading, loadMorePosts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto">
      <h1 className="jirou-heading text-4xl mb-8 text-center">本日のまかない</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {posts.length === 0 && (
        <div className="ticket-container p-8">
          <p className="text-yellow-500 font-black text-xl text-center">
            まだ投稿がないぞ！飯を投稿しろ！
          </p>
        </div>
      )}
      {hasMore && (
        <div 
          ref={loadMoreTriggerRef}
          className="flex justify-center items-center h-20 mt-4"
        >
          {loadingMore && (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-600"></div>
          )}
        </div>
      )}
    </div>
  );
}