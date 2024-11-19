import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Utensils } from 'lucide-react';

type AuthMode = 'anonymous' | 'signin' | 'signup';

export function Login() {
  const { user, signIn, emailSignIn, emailSignUp, error } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('anonymous');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'anonymous') {
      await signIn();
    } else if (mode === 'signin') {
      await emailSignIn(email, password);
    } else {
      await emailSignUp(email, password);
      // 新規登録後は自動的にログイン画面に切り替え
      setMode('signin');
    }
  };

  if (user) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="ticket-container max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <Utensils className="w-20 h-20 text-yellow-500 mb-4" />
          <h1 className="jirou-heading text-4xl mb-2">まんまみいや</h1>
          <p className="text-yellow-500 font-bold">ありのままの飯を共有しろ！</p>
        </div>

        {error && (
          <div className="bg-red-950 border-2 border-red-500 text-red-500 p-4 mb-6 font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode !== 'anonymous' && (
            <>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="メールアドレス"
                  className="ticket-input w-full p-3"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワード"
                  className="ticket-input w-full p-3"
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="ticket-button w-full p-4 text-lg">
            {mode === 'anonymous' ? '匿名で入店' : 
             mode === 'signin' ? '常連入店' : '新規入店'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          {mode === 'anonymous' ? (
            <>
              <button
                onClick={() => setMode('signin')}
                className="w-full bg-zinc-800 text-yellow-500 p-4 border-4 border-yellow-600 
                         hover:bg-zinc-700 transition-all font-bold"
              >
                常連の方はこちら
              </button>
              <button
                onClick={() => setMode('signup')}
                className="w-full bg-zinc-800 text-yellow-500 p-4 border-4 border-yellow-600 
                         hover:bg-zinc-700 transition-all font-bold"
              >
                初来店の方はこちら
              </button>
            </>
          ) : (
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="w-full text-yellow-500 hover:text-yellow-400 transition-colors font-bold"
            >
              {mode === 'signin' ? '初来店の方はこちら' : '常連の方はこちら'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}