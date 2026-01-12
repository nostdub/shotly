import { useCallback } from "react";

interface PopupOAuthOptions {
  provider: string;
  width?: number;
  height?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function usePopupOAuth() {
  const openOAuthPopup = useCallback(async (options: PopupOAuthOptions) => {
    const { provider, width = 500, height = 600, onSuccess, onError } = options;

    // Calculate popup position (center of screen)
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // Open popup window pointing to OAuth handler that will initiate signIn
    const popupWindow = window.open(
      `/auth/popup?provider=${provider}`,
      `oauth-${provider}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!popupWindow) {
      onError?.("Failed to open popup. Please allow popups for this site.");
      return;
    }

    // Listen for message from popup
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        console.warn("Invalid origin in postMessage:", event.origin);
        return;
      }

      if (event.data?.type === "oauth_complete") {
        // Remove listener
        window.removeEventListener("message", handleMessage);

        if (event.data?.success) {
          onSuccess?.();
        } else {
          onError?.(event.data?.error || "OAuth failed");
        }

        // Close popup if still open
        if (popupWindow && !popupWindow.closed) {
          popupWindow.close();
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Check if popup is closed every 500ms
    const popupCheckInterval = setInterval(() => {
      if (popupWindow && popupWindow.closed) {
        clearInterval(popupCheckInterval);
        window.removeEventListener("message", handleMessage);
        onError?.("");
      }
    }, 500);
  }, []);

  return { openOAuthPopup };
}
