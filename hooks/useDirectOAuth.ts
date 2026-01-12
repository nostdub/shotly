import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useDirectOAuth() {
  const navigate = useNavigate();

  const signInDirect = useCallback(
    (provider: string) => {
      // Navigate to OAuth init page which calls signIn()
      navigate(`/auth/${provider}?provider=${provider}`);
    },
    [navigate]
  );

  return { signInDirect };
}
