import { useState } from 'react';
import { usePopupOAuth } from '../../hooks/usePopupOAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function Login() {
  const { openOAuthPopup } = usePopupOAuth();
  const navigate = useNavigate();
  const user = useQuery(api.profiles.getCurrentUser);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to dashboard if already authenticated
  if (user?.id) {
    navigate('/app/dashboard');
    return null;
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    openOAuthPopup({
      provider: 'google',
      width: 500,
      height: 600,
      onSuccess: () => {
        setIsLoading(false);
        setTimeout(() => {
          navigate('/app/dashboard');
        }, 500);
      },
      onError: (err) => {
        setError(err);
        setIsLoading(false);
      },
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(to bottom, #040507 0%, #040507 65%, #004DFF 100%)",
      }}
    >
      {/* Star animation styles */}
      <style>{`
        @keyframes starPulse {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(45deg) scale(1.1); }
        }
        .star-pulse {
          animation: starPulse 8s ease-in-out infinite;
        }
      `}</style>

      <div className="w-full max-w-md relative z-10">
        {/* Star background - positioned at top-right corner of the card */}
        <img
          src="/Hero/Spark.webp"
          alt=""
          className="absolute left-[360px] top-[5px] w-[180px] h-[180px] object-contain pointer-events-none star-pulse z-0"
        />

        {/* Logo / Titre */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sellest</h1>
          <p className="text-gray-400">Connect to continue</p>
        </div>

        {/* Card */}
        <div className="relative z-20 bg-[#0a0b0f]/80 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-100 disabled:bg-gray-300 text-gray-900 font-semibold rounded-xl transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <p className="mt-6 text-center text-gray-500 text-xs">
            By continuing, you accept our terms of use
          </p>
        </div>

        {/* Retour à l'accueil */}
        <div className="mt-6 text-center">
          <a href="/" className="text-gray-500 hover:text-gray-400 text-sm">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
