import type { AuthTokens } from "./api";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_EMAIL_KEY = "userEmail";
const USER_ID_KEY = "userId";
const AUTH_SESSION_EVENT = "skypro-auth-session-change";

export interface AuthSession {
  email: string;
  userId?: string;
  tokens: AuthTokens;
}

function getStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function saveAuthSession(session: AuthSession): void {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(ACCESS_TOKEN_KEY, session.tokens.access);
  storage.setItem(REFRESH_TOKEN_KEY, session.tokens.refresh);
  storage.setItem(USER_EMAIL_KEY, session.email);
  if (session.userId) {
    storage.setItem(USER_ID_KEY, session.userId);
  } else {
    storage.removeItem(USER_ID_KEY);
  }
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function getAuthEmail(): string | null {
  const storage = getStorage();
  if (!storage) return null;

  const email = storage.getItem(USER_EMAIL_KEY);
  const accessToken = storage.getItem(ACCESS_TOKEN_KEY);

  return email && accessToken ? email : null;
}

export function getAccessToken(): string | null {
  return getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function getAuthUserId(): string | null {
  return getStorage()?.getItem(USER_ID_KEY) ?? null;
}

export function clearAuthSession(): void {
  const storage = getStorage();
  if (!storage) return;

  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
  storage.removeItem(USER_EMAIL_KEY);
  storage.removeItem(USER_ID_KEY);
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