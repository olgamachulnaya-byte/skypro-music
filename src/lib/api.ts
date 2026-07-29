import type { Track } from "@/data";
import { getAccessToken } from "./auth";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://skymusic-api.onrender.com/api").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 15_000;

export interface Credentials { email: string; password: string }
export interface User { _id: string; email: string; username?: string }
export interface AuthTokens { access: string; refresh: string }
export interface AuthResult { user: User; tokens: AuthTokens }
export interface Selection { _id: string | number; name: string; items: Track[] }
interface SelectionResponse { _id: string | number; name: string; items: unknown[] }

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

function errorMessage(body: unknown): string {
  if (typeof body === "string" && body.trim()) return body;
  if (!body || typeof body !== "object") return "Не удалось выполнить запрос";
  const value = body as Record<string, unknown>;
  const message = value.message ?? value.error ?? value.detail;
  return typeof message === "string" ? message : "Не удалось выполнить запрос";
}

async function request<T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const token = authenticated ? getAccessToken() : null;
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
    const text = await response.text();
    let body: unknown = null;
    if (text) {
      try { body = JSON.parse(text); } catch { body = text; }
    }
    if (!response.ok) throw new ApiError(errorMessage(body), response.status);
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error instanceof DOMException && error.name === "AbortError"
        ? "Сервер не ответил вовремя. Попробуйте ещё раз"
        : "Не удалось связаться с сервером. Попробуйте позже",
      0,
    );
  } finally {
    clearTimeout(timeout);
  }
}

  function payload<T>(value: T | { data: T }): T {
  return value && typeof value === "object" && "data" in value ? (value as { data: T }).data : value;
}

  function track(value: unknown): value is Track {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Track>;
  return (typeof item._id === "string" || typeof item._id === "number") &&
    typeof item.name === "string" && typeof item.author === "string" &&
    typeof item.release_date === "string" && Array.isArray(item.genre) &&
    typeof item.duration_in_seconds === "number" && typeof item.album === "string" &&
    typeof item.track_file === "string" && Array.isArray(item.stared_user);
}

  function tracksFrom(value: unknown): Track[] {
  const unwrapped = payload(value as unknown | { data: unknown });
  const list = Array.isArray(unwrapped) ? unwrapped :
    unwrapped && typeof unwrapped === "object" && "tracks" in unwrapped
      ? (unwrapped as { tracks: unknown }).tracks : null;
  if (!Array.isArray(list) || !list.every(track)) throw new ApiError("Сервер вернул некорректный список треков", 0);
  return list;
}

export async function getTracks(): Promise<Track[]> {
  return tracksFrom(await request<unknown>("/tracks"));
}

export async function getSelection(id: string): Promise<Selection> {
  const value = payload(await request<SelectionResponse | { data: SelectionResponse }>(`/selections/${encodeURIComponent(id)}`));
  if (!value || !Array.isArray(value.items)) throw new ApiError("Сервер вернул некорректную подборку", 0);
  if (value.items.every(track)) return { ...value, items: value.items as Track[] };
  const allTracks = await getTracks();
  const byId = new Map(allTracks.map((item) => [String(item._id), item]));
  const items = value.items.map((item) => byId.get(String(item))).filter((item): item is Track => Boolean(item));
  return { ...value, items };
}

  function authResult(value: unknown, email: string): AuthResult {
  const result = payload(value as unknown | { data: unknown }) as Record<string, unknown>;
  const rawUser = (result.user ?? result) as Record<string, unknown>;
  const rawTokens = (result.tokens ?? result) as Record<string, unknown>;
  const access = rawTokens.access ?? rawTokens.accessToken ?? rawTokens.token;
  const refresh = rawTokens.refresh ?? rawTokens.refreshToken ?? "";
  const id = rawUser._id ?? rawUser.id ?? result.userId;
  if (typeof access !== "string" || (typeof id !== "string" && typeof id !== "number")) {
    throw new ApiError("Сервер вернул некорректные данные авторизации", 0); 
  }

  return { user: { _id: String(id), email: typeof rawUser.email === "string" ? rawUser.email : email }, tokens: { access, refresh: String(refresh) } };
}

export async function signUp(credentials: Credentials): Promise<AuthResult> {
  return authResult(await request<unknown>("/auth/register", { method: "POST", body: JSON.stringify(credentials) }), credentials.email);
}

export async function signIn(credentials: Credentials): Promise<AuthResult> {
  return authResult(await request<unknown>("/auth/login", { method: "POST", body: JSON.stringify(credentials) }), credentials.email);
}

export async function getFavoriteTracks(): Promise<Track[]> {
  return tracksFrom(await request<unknown>("/favorites", {}, true));
}

  export async function toggleFavorite(trackId: string | number, favorite: boolean): Promise<void> {
  await request(`/tracks/${encodeURIComponent(String(trackId))}/favorite`, { method: favorite ? "POST" : "DELETE" }, true);
}