import { Utensils, LogOut, PlusCircle, User, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      <header className="bg-yellow-500 border-b-[8px] border-yellow-600 relative z-50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 md:gap-4 group">
              <Utensils className="w-8 h-8 md:w-12 md:h-12 text-black transform group-hover:rotate-12 transition-transform" />
              <span className="text-3xl md:text-5xl font-black tracking-tighter text-black hover:scale-105 transition-transform">
                まんまみいや
              </span>
            </Link>
            
            {user && (
              <>
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-4">
                  <Link 
                    to="/new" 
                    className="ticket-button px-6 py-3 flex items-center gap-2"
                  >
                    <PlusCircle className="w-6 h-6" />
                    飯を投稿
                  </Link>

                  <Link 
                    to="/profile"
                    className="bg-black text-yellow-500 p-3 hover:bg-yellow-600 hover:text-black transition-colors"
                  >
                    <User className="w-8 h-8" />
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="bg-black text-yellow-500 p-3 hover:bg-yellow-600 hover:text-black transition-colors"
                  >
                    <LogOut className="w-8 h-8" />
                  </button>
                </nav>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden bg-black text-yellow-500 p-2 hover:bg-yellow-600 hover:text-black transition-colors"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {user && (
        <>
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}>
              <nav className="absolute top-[72px] left-0 right-0 bg-yellow-500 border-b-[8px] border-yellow-600">
                <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                  <div className="flex gap-4">
                    <Link 
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 bg-black text-yellow-500 p-3 hover:bg-yellow-600 hover:text-black transition-colors flex items-center justify-center gap-2"
                    >
                      <User className="w-6 h-6" />
                      プロフィール
                    </Link>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex-1 bg-black text-yellow-500 p-3 hover:bg-yellow-600 hover:text-black transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-6 h-6" />
                      ログアウト
                    </button>
                  </div>
                </div>
              </nav>
            </div>
          )}

          {/* Fixed Post Button on Mobile */}
          <div className="fixed bottom-6 right-6 md:hidden z-50">
            <Link 
              to="/new" 
              className="ticket-button w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            >
              <PlusCircle className="w-8 h-8" />
            </Link>
          </div>
        </>
      )}
    </>
  );
}