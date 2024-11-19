import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { updatePostReaction } from '../lib/posts';
import { useAuth } from '../contexts/AuthContext';
import type { Post } from '../types/post';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [localRealCount, setLocalRealCount] = useState(post.realCount);
  const [localFakeCount, setLocalFakeCount] = useState(post.fakeCount);
  const isOwnPost = user?.uid === post.userId;

  const handleReaction = async (type: 'real' | 'fake', e: React.MouseEvent) => {
    e.preventDefault();
    if (isOwnPost) return;
    
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

  return (
    <Link 
      to={`/posts/${post.id}`}
      className="ticket-container block transition-transform hover:-translate-y-1 relative"
    >
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

      <div className="space-y-2">
        <p className="text-yellow-500 font-bold line-clamp-1">
          {post.description}
        </p>

        <div className="text-sm text-yellow-600 font-bold">
          {format(post.createdAt, 'yyyy/MM/dd HH:mm')}
        </div>

        <div className="flex gap-1.5">
          <button 
            onClick={(e) => handleReaction('real', e)}
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
            onClick={(e) => handleReaction('fake', e)}
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
    </Link>
  );
}