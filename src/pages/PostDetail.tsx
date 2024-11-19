import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { getPost, updatePostReaction, addComment } from '../lib/posts';
import type { Post } from '../types/post';

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [localRealCount, setLocalRealCount] = useState(0);
  const [localFakeCount, setLocalFakeCount] = useState(0);
  const isOwnPost = user?.uid === post?.userId;

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;
      try {
        const fetchedPost = await getPost(id);
        setPost(fetchedPost);
        if (fetchedPost) {
          setLocalRealCount(fetchedPost.realCount);
          setLocalFakeCount(fetchedPost.fakeCount);
        }
      } catch (error) {
        console.error('Error loading post:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  const handleReaction = async (type: 'real' | 'fake') => {
    if (!post || !user || isOwnPost) return;
    
    try {
      await updatePostReaction(post.id, type);
      if (type === 'real') {
        setLocalRealCount(prev => Math.min(prev + 1, 999));
      } else {
        setLocalFakeCount(prev => Math.min(prev + 1, 999));
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !user || !comment.trim()) return;

    try {
      const newComment = await addComment(post.id, user.uid, comment.trim());
      if (newComment) {
        setPost(prev => prev ? {
          ...prev,
          comments: [...prev.comments, newComment]
        } : null);
        setComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="ticket-container">
          <p className="text-yellow-500 font-black text-xl text-center">
            投稿が見つかりませんでした。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link 
        to="/"
        className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 mb-6 font-black"
      >
        <ArrowLeft className="w-5 h-5" />
        一覧に戻る
      </Link>

      <div className="ticket-container relative">
        <div className="user-id-tag">
          ID: {post.userId.slice(0, 4)}
        </div>

        <div className="aspect-square mb-4 bg-black overflow-hidden">
          <img
            src={post.imageUrl}
            alt="投稿された料理"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <p className="text-yellow-500 font-bold">
            {post.description}
          </p>

          <div className="text-sm text-yellow-600 font-bold">
            {format(post.createdAt, 'yyyy/MM/dd HH:mm')}
          </div>

          <div className="flex gap-1.5">
            <button 
              onClick={() => handleReaction('real')}
              className="reaction-button flex-1 py-1.5"
              disabled={isOwnPost || localRealCount >= 999}
              title={isOwnPost ? "自分の投稿にはリアクションできません" : undefined}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="reaction-text text-sm">リアル</span>
                <span className="reaction-count relative">{localRealCount.toLocaleString()}</span>
              </div>
            </button>
            <button 
              onClick={() => handleReaction('fake')}
              className="reaction-button flex-1 py-1.5"
              disabled={isOwnPost || localFakeCount >= 999}
              title={isOwnPost ? "自分の投稿にはリアクションできません" : undefined}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="reaction-text text-sm">ウソ</span>
                <span className="reaction-count relative">{localFakeCount.toLocaleString()}</span>
              </div>
            </button>
            <div className="reaction-button flex-none px-4 py-1.5">
              <div className="flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="reaction-count relative">{(post.comments?.length || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t-4 border-yellow-600">
          <h3 className="text-xl font-black text-yellow-500 mb-4">コメント</h3>
          <form onSubmit={handleComment} className="flex gap-2 mb-6">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="コメントを入力..."
              className="ticket-input flex-1 px-4 py-2"
            />
            <button
              type="submit"
              disabled={!comment.trim()}
              className="ticket-button px-6"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>

          <div className="space-y-4">
            {post.comments?.map(comment => (
              <div key={comment.id} className="bg-zinc-800 p-4 border-4 border-yellow-600">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="bg-yellow-500 text-black px-2 py-0.5 font-black text-sm">
                      ID: {comment.userId.slice(0, 4)}
                    </div>
                    <div className="text-sm text-yellow-600 font-bold">
                      {format(comment.createdAt, 'yyyy/MM/dd HH:mm')}
                    </div>
                  </div>
                  <p className="text-yellow-500 font-bold">{comment.text}</p>
                </div>
              </div>
            ))}
            {post.comments?.length === 0 && (
              <p className="text-yellow-600 font-bold text-center">
                まだコメントがありません。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}