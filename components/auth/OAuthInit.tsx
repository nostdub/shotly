import React, { useEffect } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useSearchParams } from 'react-router-dom';

/**
 * OAuth Initiator Page
 * User is redirected here from /login
 * This page calls signIn() which redirects to Google
 * After OAuth, Google redirects back and user ends up on /app/dashboard
 */
export default function OAuthInit() {
  const { signIn } = useAuthActions();
  const [searchParams] = useSearchParams();
  const provider = searchParams.get('provider') || 'google';

  useEffect(() => {
    // Initiate OAuth flow
    try {
      signIn(provider);
    } catch (err) {
      console.error(`${provider} OAuth failed:`, err);
      // Fallback to login page on error
      window.location.href = '/login';
    }
  }, [provider, signIn]);

  return (
    <div className="min-h-screen bg-[#040507] flex items-center justify-center">
      <p className="text-white">Redirecting to {provider}...</p>
    </div>
  );
}
