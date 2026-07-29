import type { Track } from "@/data";
import { getAccessToken } from "./auth";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  "https://skymusic-api.onrender.com/api"
).replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 15_000;

interface ApiEnvelope<T> {
  data: T;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface User {
  id?: string | number;
  _id?: string | number;
  email: string;
  username?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export interface Selection {
  _id: string | number;
  name: string;
  items: Track[];
}

interface SelectionResponse extends Omit<Selection, "items"> {
  items: unknown[];
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

function collectErrorMessages(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectErrorMessages);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectErrorMessages);
  }
  return [];
}

function errorMessage(body: unknown): string {
  if (typeof body === "string" && body.trim()) return body;
  if (!body || typeof body !== "object") return "Не удалось выполнить запрос";
  
  const messages = collectErrorMessages(body);
  return messages.join(". ") || "Не удалось выполнить запрос";
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  authenticated = false,
): Promise<T> {
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
    const responseText = await response.text();
    let body: unknown = null;
    if (responseText) {
      try {
        body = JSON.parse(responseText) as unknown;
      } catch {
        body = responseText;
      }
    }

    if (!response.ok) throw new ApiError(errorMessage(body), response.status);
    return body as T;
  } catch (error: unknown) {
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

  function unwrap<T>(value: T | ApiEnvelope<T>): T {
  return value && typeof value === "object" && "data" in value
    ? (value as ApiEnvelope<T>).data
    : value;
}

  function isTrack(value: unknown): value is Track {
  if (!value || typeof value !== "object") return false;
   const track = value as Partial<Track>;

  return (
    (typeof track._id === "number" || typeof track._id === "string") &&
    typeof track.name === "string" &&
    typeof track.author === "string" &&
    typeof track.release_date === "string" &&
    Array.isArray(track.genre) &&
    track.genre.every((genre) => typeof genre === "string") &&
    typeof track.duration_in_seconds === "number" &&
    typeof track.album === "string" &&
    (typeof track.logo === "string" || track.logo === null) &&
    typeof track.track_file === "string" &&
    Array.isArray(track.stared_user)
  );
}

 function parseTracks(value: unknown): Track[] {
  const unwrapped = unwrap(value as unknown | ApiEnvelope<unknown>);
  if (!Array.isArray(unwrapped) || !unwrapped.every(isTrack)) {
    throw new ApiError("Сервер вернул некорректный список треков", 0);
  }
  return unwrapped; 
}

export async function getTracks(): Promise<Track[]> {
  const response = unwrap(await request<unknown>("/tracks"));
  const tracks =
    response && typeof response === "object" && "tracks" in response
      ? (response as { tracks: unknown }).tracks
      : response;
  return parseTracks(tracks);
}

export async function getSelection(id: string): Promise<Selection> {
  const selection = unwrap(
    await request<SelectionResponse | ApiEnvelope<SelectionResponse>>(
      `/selections/${encodeURIComponent(id)}`,
    ),
  );

  if (
    !selection ||
    (typeof selection._id !== "number" && typeof selection._id !== "string") ||
    typeof selection.name !== "string" ||
    !Array.isArray(selection.items)
  ) {
    throw new ApiError("Сервер вернул некорректную подборку", 0);
  }

  if (selection.items.every(isTrack)) {
    return { ...selection, items: selection.items };
  }

  const tracks = await getTracks();
  const tracksById = new Map(tracks.map((track) => [String(track._id), track]));
  const items = selection.items.map((id) => tracksById.get(String(id)));
  if (items.some((track) => !track)) {
    throw new ApiError("Не удалось найти все треки подборки", 0);
  }

  return { ...selection, items: items as Track[] };
}
export async function signUp(credentials: Credentials): Promise<void> {
  await request<unknown>("/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function signIn(credentials: Credentials): Promise<AuthResult> {
 const response = unwrap(
    await request<unknown>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  ) as Record<string, unknown>;
  const rawUser = (response.user ?? response) as Record<string, unknown>;
  const rawTokens = (response.tokens ?? response) as Record<string, unknown>;
  const access = rawTokens.access ?? rawTokens.accessToken ?? rawTokens.token;
  const refresh = rawTokens.refresh ?? rawTokens.refreshToken ?? "";
  const id = rawUser._id ?? rawUser.id ?? response.userId;

  if (
    typeof access !== "string" ||
    (typeof id !== "string" && typeof id !== "number")
  ) {
    throw new ApiError("Сервер вернул некорректные данные авторизации", 0);
  }

  return {
    user: {
      _id: id,
      email: typeof rawUser.email === "string" ? rawUser.email : credentials.email,
    },
    tokens: { access, refresh: String(refresh) },
  };
}

export async function getFavoriteTracks(): Promise<Track[]> {
  return parseTracks(
    await request<unknown>("/favorites", {}, true),
  );
}
export async function toggleFavorite(
  trackId: string | number,
  favorite: boolean,
): Promise<void> {
  await request(
    `/tracks/${encodeURIComponent(String(trackId))}/favorite`,
    { method: favorite ? "POST" : "DELETE" },
    true,
  );
}