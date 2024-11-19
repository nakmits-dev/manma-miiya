import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserPosts } from '../lib/posts';
import { PostCard } from '../components/PostCard';
import type { Post } from '../types/post';

export function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadUserPosts = async () => {
      try {
        setError(null);
        const fetchedPosts = await getUserPosts(user.uid);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error loading user posts:', error);
        setError('投稿の読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    loadUserPosts();
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-[1440px] mx-auto">
      <Link 
        to="/"
        className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 mb-6 font-black"
      >
        <ArrowLeft className="w-5 h-5" />
        一覧に戻る
      </Link>

      <div className="ticket-container mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500 p-3">
              <User className="w-6 h-6 text-black" />
            </div>
            <div>
              {!user.isAnonymous && (
                <h2 className="text-xl font-black text-yellow-500 mb-1">
                  {user.email}
                </h2>
              )}
              <p className="text-lg font-black text-yellow-500">
                ID: {user.uid.slice(0, 4)}
              </p>
              <p className="text-sm text-yellow-600 mt-1 font-bold">
                投稿数: {posts.length}
              </p>
              {!user.isAnonymous && !user.emailVerified && (
                <div className="flex items-center gap-2 text-red-500 mt-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-bold">メール未確認</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-950 text-red-100 
                     hover:bg-red-900 transition-colors font-black"
          >
            <LogOut className="w-5 h-5" />
            <span>ログアウト</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950 border-4 border-red-500 text-red-500 p-4 mb-6 font-bold">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <h3 className="jirou-heading text-3xl">
          まかない履歴
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {!error && posts.length === 0 && (
          <div className="ticket-container text-center py-12">
            <p className="text-yellow-500 font-black text-xl">
              まだ投稿がないぞ！飯を投稿しろ！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}