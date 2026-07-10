import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { setTokens } from '../lib/api';
import { useAppStore } from '../stores/useAppStore';

/**
 * Landing spot for the backend's OAuth redirect
 * (`/v1/auth/oauth/:provider/callback`). Tokens arrive in the URL
 * *fragment* (`#accessToken=...&refreshToken=...`), never the query string,
 * so they never hit server logs or a Referer header. This page's only job
 * is to pull them out, store them, mark the local session as signed in,
 * and get the fragment out of the address bar.
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const signIn = useAppStore((s) => s.signIn);
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // StrictMode runs effects twice in dev; only consume the fragment once
    ran.current = true;

    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    const params = new URLSearchParams(hash || window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const providerError = params.get('error');

    // Clear the fragment immediately so tokens don't linger in browser history.
    window.history.replaceState(null, '', window.location.pathname);

    if (providerError) {
      setError('That sign-in didn\u2019t go through. Please try again.');
      setTimeout(() => navigate('/login', { replace: true }), 1800);
      return;
    }
    if (!accessToken || !refreshToken) {
      setError('Missing sign-in details. Please try again.');
      setTimeout(() => navigate('/login', { replace: true }), 1800);
      return;
    }

    setTokens(accessToken, refreshToken);
    signIn();
    navigate('/app', { replace: true });
  }, [navigate, signIn]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: 'var(--ink, #0A0A0A)' }}>
      <div className="flex flex-col items-center gap-3">
        {error ? (
          <p className="text-sm" style={{ color: 'var(--text-muted, #8A8A8A)' }}>{error}</p>
        ) : (
          <>
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--violet, #7C3AED)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted, #8A8A8A)' }}>Finishing sign-in&hellip;</p>
          </>
        )}
      </div>
    </div>
  );
}
