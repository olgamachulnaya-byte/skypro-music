import type { AuthTokens } from "./api";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_EMAIL_KEY = "userEmail";
const AUTH_SESSION_EVENT = "skypro-auth-session-change";

export interface AuthSession {
  email: string;
  tokens: AuthTokens;
}

export function saveAuthSession(session: AuthSession): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.tokens.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.tokens.refresh);
  localStorage.setItem(USER_EMAIL_KEY, session.email);
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function getAuthEmail(): string | null {
  const email = localStorage.getItem(USER_EMAIL_KEY);
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  return email && accessToken ? email : null;
}

export function clearAuthSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function subscribeToAuthSession(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(AUTH_SESSION_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(AUTH_SESSION_EVENT, onStoreChange);
  };
}