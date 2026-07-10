// Minimal client for the Shift backend's auth endpoints only (§4 of
// BACKEND-API-SPEC.md) — signup, login, OAuth, and token storage. Nothing
// else here on purpose; goals/activity/etc. still run on the local mock
// store until those are wired up separately.

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const ACCESS_TOKEN_KEY = "shift_access_token";
const REFRESH_TOKEN_KEY = "shift_refresh_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

async function parseErrorOrThrow(res: Response): Promise<never> {
  let code = "UNKNOWN_ERROR";
  let message = `Request failed with status ${res.status}`;
  try {
    const body = await res.json();
    if (body?.error) {
      code = body.error.code ?? code;
      message = body.error.message ?? message;
    }
  } catch {
    // Response wasn't JSON — fall back to the generic message above.
  }
  throw new ApiError(code, message);
}

export async function signup(email: string, password: string, name: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/v1/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) await parseErrorOrThrow(res);
  const data: AuthResponse = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) await parseErrorOrThrow(res);
  const data: AuthResponse = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  clearTokens();
  if (!refreshToken) return;
  // Best-effort — the user is signed out locally regardless of whether this succeeds.
  try {
    await fetch(`${API_BASE}/v1/auth/logout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // Ignore network errors on logout; local tokens are already cleared.
  }
}

/** Sends the browser to the backend's OAuth start route, which redirects to the provider. */
export function startOAuth(provider: "google" | "github" | "figma") {
  window.location.href = `${API_BASE}/v1/auth/oauth/${provider}/start`;
}

export { ApiError };
