/**
 * Client-side API utility for authenticated requests
 */

const SESSION_TOKEN_KEY = "vault_session_token";

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

export function setSessionToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_TOKEN_KEY, token);
}

export function clearSessionToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_TOKEN_KEY);
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getSessionToken();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["X-Session-Token"] = token;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Include cookies
  });

  const data = await response.json();

  if (!response.ok) {
    // If unauthorized, clear token
    if (response.status === 401) {
      clearSessionToken();
    }
    throw new Error(data.message || `Request failed: ${response.statusText}`);
  }

  return data;
}

