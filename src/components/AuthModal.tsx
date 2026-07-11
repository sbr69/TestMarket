import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { name, email, password };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAuth(data.token, data.user);
        addToast(isLogin ? 'Successfully logged in!' : 'Account created!', 'success');
        onClose();
      } else {
        addToast(data.error || 'Authentication failed', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 font-sans mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-500 mb-8">
          {isLogin ? 'Sign in to access your orders and saved items.' : 'Join us to get the best shopping experience.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
              <input required type="text" name="name" className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all" placeholder="John Doe" />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
            <input required type="email" name="email" className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
            <input required type="password" name="password" className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all" placeholder="••••••••" />
          </div>

          <button disabled={loading} type="submit" className="w-full py-3.5 px-4 bg-[#F97316] text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 shadow-md active:scale-[0.98] mt-2">
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-[#1B1F5E] font-bold hover:underline">
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
