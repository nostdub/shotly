import React, { useEffect, useRef } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * OAuth Callback page for popup flow
 * This page runs inside a popup window and handles the OAuth callback
 * Then sends a message back to the main window
 */
export default function OAuthCallback() {
  const { signIn } = useAuthActions();
  const [searchParams] = useSearchParams();
  const provider = searchParams.get('provider') || 'google';
  const user = useQuery(api.profiles.getCurrentUser);
  const authAttemptedRef = useRef(false);
  const sentMessageRef = useRef(false);

  // Detect popup and check if user is authenticated at the top level
  useEffect(() => {
    // Check if this is a popup and has a parent window
    if (!window.opener || window.opener === window) {
      // Not a popup, redirect to home
      window.location.href = '/';
      return;
    }

    // CRITICAL: Check user authentication FIRST before anything else
    // This detects auth immediately when user returns from Google
    if (user?.id && !sentMessageRef.current) {
      sentMessageRef.current = true;
      console.log('User authenticated in popup, closing...');
      // User is authenticated, send success message to main window
      window.opener.postMessage(
        {
          type: 'oauth_complete',
          success: true,
        },
        window.location.origin
      );
      // Close immediately without waiting
      window.close();
      return;
    }

    // Only attempt sign in if user is explicitly null (not authenticated, not loading)
    if (user === null && !authAttemptedRef.current) {
      // User is explicitly not authenticated, initiate OAuth flow
      authAttemptedRef.current = true;
      console.log('Starting OAuth flow...');
      try {
        signIn(provider);
        // After signIn, the page will redirect. But useEffect will re-run when user auth state changes
      } catch (err) {
        console.error('signIn error:', err);
        if (!sentMessageRef.current) {
          sentMessageRef.current = true;
          window.opener.postMessage(
            {
              type: 'oauth_complete',
              success: false,
              error: `Failed to initiate ${provider} sign in`,
            },
            window.location.origin
          );
          setTimeout(() => window.close(), 500);
        }
      }
    }
  }, [user, provider, signIn]);

  return (
    <div className="min-h-screen bg-[#040507] flex items-center justify-center">
      <p className="text-white">Connecting...</p>
    </div>
  );
}
