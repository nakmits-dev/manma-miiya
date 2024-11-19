import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createPost } from '../lib/posts';

export function NewPost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !image) return;

    setLoading(true);
    try {
      await createPost(user.uid, image, description);
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('投稿に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="ticket-container">
        <h2 className="jirou-heading text-3xl mb-6">飯を投稿</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div 
            className="relative bg-black border-4 border-yellow-600 overflow-hidden aspect-video cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img 
                src={preview} 
                alt="プレビュー" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-yellow-500">
                <Camera className="w-12 h-12 mb-2" />
                <p className="font-bold">クリックして写真を選択</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="どんな飯だ？材料は？感想は？"
            className="ticket-input w-full p-4"
            rows={4}
          />

          <button
            type="submit"
            disabled={loading || !image || !description}
            className="ticket-button w-full py-4 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Upload className="animate-spin h-6 w-6" />
                投稿中...
              </span>
            ) : (
              '投稿する'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}