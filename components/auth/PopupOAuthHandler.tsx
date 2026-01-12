import React, { useEffect, useRef } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Popup OAuth Initiator
 * This page is opened in the popup and initiates the OAuth flow
 * After OAuth completes, it sends postMessage and closes
 */
export default function PopupOAuthHandler() {
  const { signIn } = useAuthActions();
  const [searchParams] = useSearchParams();
  const provider = searchParams.get('provider') || 'google';
  const user = useQuery(api.profiles.getCurrentUser);
  const authStartedRef = useRef(false);
  const authCompletedRef = useRef(false);

  useEffect(() => {
    // Check if we're in a popup
    if (!window.opener || window.opener === window) {
      // Not a popup, go to home
      window.location.href = '/';
      return;
    }

    // If user is now authenticated, close the popup
    if (user?.id && !authCompletedRef.current) {
      authCompletedRef.current = true;
      // Send success to parent
      window.opener?.postMessage(
        {
          type: 'oauth_complete',
          success: true,
        },
        window.location.origin
      );
      // Close popup
      setTimeout(() => window.close(), 100);
      return;
    }

    // Start OAuth flow if not already started
    if (!authStartedRef.current && user === null) {
      authStartedRef.current = true;
      try {
        signIn(provider);
      } catch (err) {
        console.error('signIn failed:', err);
        window.opener?.postMessage(
          {
            type: 'oauth_complete',
            success: false,
            error: 'OAuth failed',
          },
          window.location.origin
        );
        setTimeout(() => window.close(), 500);
      }
    }
  }, [user, provider, signIn]);

  return (
    // Don't render anything - signIn() will redirect immediately
    null
  );
}
