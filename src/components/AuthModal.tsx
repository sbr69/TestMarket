import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { X } from 'lucide-react';
import { connectStellarAuthWallet, signStellarMessage } from '../utils/stellarWallet';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { addToast } = useToastStore();

  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });

      const data = await res.json();
      if (res.ok) {
        setAuth(data.user);
        addToast('Successfully logged in with Google!', 'success');
        onClose();
      } else {
        addToast(data.error || 'Google Authentication failed', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStellarLogin = async () => {
    try {
      setLoading(true);
      const { address } = await connectStellarAuthWallet();

      const challengeResponse = await fetch('/api/auth/stellar/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: address })
      });
      const challengeData = await challengeResponse.json();
      if (!challengeResponse.ok) {
        throw new Error(challengeData.error || 'Unable to create a wallet sign-in challenge');
      }

      const { signedMessage } = await signStellarMessage(challengeData.challenge, address);

      const authRes = await fetch('/api/auth/stellar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: address, challenge: challengeData.challenge, signature: signedMessage })
      });
      
      const data = await authRes.json();
      if (authRes.ok) {
        setAuth(data.user);
        addToast('Successfully logged in with Stellar Wallet!', 'success');
        onClose();
      } else {
        addToast(data.error || 'Stellar Authentication failed', 'error');
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id'}>
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 font-sans mb-2">Welcome Back</h2>
        <p className="text-gray-500 mb-8">
          Sign in to access your orders and saved items.
        </p>

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-full h-10 overflow-hidden rounded-xl bg-[#F97316] shadow-md">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm font-bold text-white">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                  <path fill="#4285F4" d="M21.35 12.21c0-.71-.06-1.39-.18-2.04H12v3.86h5.24a4.48 4.48 0 0 1-1.94 2.94v2.51h3.14c1.84-1.7 2.91-4.2 2.91-7.27Z" />
                  <path fill="#34A853" d="M12 21.71c2.63 0 4.84-.87 6.45-2.35l-3.14-2.51c-.87.58-1.99.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.59A9.74 9.74 0 0 0 12 21.71Z" />
                  <path fill="#FBBC05" d="M6.53 13.74A5.86 5.86 0 0 1 6.22 12c0-.6.11-1.18.31-1.74V7.67H3.28A9.71 9.71 0 0 0 2.29 12c0 1.56.37 3.04.99 4.33l3.25-2.59Z" />
                  <path fill="#EA4335" d="M12 6.23c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.33 14.63 2.29 12 2.29a9.74 9.74 0 0 0-8.72 5.38l3.25 2.59C7.3 7.95 9.46 6.23 12 6.23Z" />
                </svg>
              </span>
              Continue with Google
            </div>
            <div className="absolute inset-0 opacity-0">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => addToast('Google Sign-In failed', 'error')}
                  theme="filled_black"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="100%"
                />
            </div>
          </div>
          <button
            type="button"
            onClick={handleStellarLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#1B1F5E] text-white font-bold rounded-xl hover:bg-indigo-900 transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
          >
            Login with Stellar Wallet
          </button>
        </div>
      </div>
    </div>
    </GoogleOAuthProvider>
  );
}
