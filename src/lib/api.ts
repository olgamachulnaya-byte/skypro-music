import type { Track, TrackUser } from "@/data";
import { getAccessToken } from "./auth";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  "https://webdev-music-003b5b991590.herokuapp.com"
).replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 15_000;

interface ApiEnvelope<T> {
  data: T;
}

export interface Credentials {
  email: string;
  password: string;
  username?: string;
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
 constructor(
    message: string,
    public readonly status: number,
  ) {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  authenticated = false,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const token = authenticated ? getAccessToken() : null;
  
  if (authenticated && !token) {
    clearTimeout(timeout);
    throw new ApiError("Войдите в аккаунт, чтобы выполнить это действие", 401);
  }

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
  return isRecord(value) && "data" in value ? (value.data as T) : (value as T);
}

function isTrackUser(value: unknown): value is TrackUser {
  if (!isRecord(value)) return false;

  const id = value._id ?? value.id;
  return typeof id === "number" || typeof id === "string";
}

/**
 * Converts the catalog wire format to the format used by the UI.
 *
 * The catalog has returned `genre` both as a single string and as an array in
 * different API versions. Keeping that difference at the API boundary means
 * filters and track components can consistently work with `string[]`.
 */
function parseTrack(value: unknown): Track | null {
  if (!isRecord(value)) return null;

  const id = value._id ?? value.id;
  const genre =
    typeof value.genre === "string"
      ? [value.genre]
      : Array.isArray(value.genre) &&
          value.genre.every((item) => typeof item === "string")
        ? value.genre
        : null;
  const staredUser = value.stared_user;

  if (
    (typeof id !== "number" && typeof id !== "string") ||
    typeof value.name !== "string" ||
    typeof value.author !== "string" ||
    typeof value.release_date !== "string" ||
    genre === null ||
    typeof value.duration_in_seconds !== "number" ||
    typeof value.album !== "string" ||
    (typeof value.logo !== "string" && value.logo !== null) ||
    typeof value.track_file !== "string" ||
    !Array.isArray(staredUser) ||
    !staredUser.every(
      (user) =>
        typeof user === "number" ||
        typeof user === "string" ||
        isTrackUser(user),
    )
  ) {
    return null;
  }

  return {
    _id: id,
    name: value.name,
    author: value.author,
    release_date: value.release_date,
    genre,
    duration_in_seconds: value.duration_in_seconds,
    album: value.album,
    logo: value.logo,
    track_file: value.track_file,
    stared_user: staredUser,
  };
}

function parseTracks(value: unknown): Track[] {
  const unwrapped = unwrap(value as unknown | ApiEnvelope<unknown>);
  if (!Array.isArray(unwrapped)) {
    throw new ApiError("Сервер вернул некорректный список треков", 0);
  }

  const tracks = unwrapped.map(parseTrack);
  if (tracks.some((track) => track === null)) {
    throw new ApiError("Сервер вернул некорректный список треков", 0);
  }
  return tracks as Track[];
}

export async function getTracks(): Promise<Track[]> {
  const response = unwrap(await request<unknown>("/catalog/track/all/"));
  const tracks =
    response && typeof response === "object" && "tracks" in response
      ? (response as { tracks: unknown }).tracks
      : response;
  return parseTracks(tracks);
}

export async function getSelection(id: string): Promise<Selection> {
  const selection = unwrap(
    await request<SelectionResponse | ApiEnvelope<SelectionResponse>>(
      `/catalog/selection/${encodeURIComponent(id)}/`,
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

  const selectionTracks = selection.items.map(parseTrack);
  if (selectionTracks.every((track): track is Track => track !== null)) {
    return { ...selection, items: selectionTracks };
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
  await request<unknown>("/user/signup/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function signIn(credentials: Credentials): Promise<AuthResult> {
  const response = unwrap(
    await request<unknown>("/user/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  );

  if (!isRecord(response)) {
    throw new ApiError("Сервер вернул некорректные данные авторизации", 0);
  }

  const id = response._id ?? response.id;
  const email =
    typeof response.email === "string" ? response.email : credentials.email;
  const username =
    typeof response.username === "string" ? response.username : undefined;

  if (typeof id !== "string" && typeof id !== "number") {
    throw new ApiError("Сервер вернул некорректные данные авторизации", 0);
  }

  const tokens = unwrap(
    await request<unknown>("/user/token/", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  );

  if (!isRecord(tokens)) {
    throw new ApiError("Сервер вернул некорректные токены авторизации", 0);
  }

  const access = tokens.access;
  const refresh = tokens.refresh;
  if (typeof access !== "string" || typeof refresh !== "string") {
    throw new ApiError("Сервер вернул некорректные токены авторизации", 0);
  }

  return {
    user: { _id: id, email, username },
    tokens: { access, refresh },
  };
}

export async function getFavoriteTracks(): Promise<Track[]> {
  return parseTracks(
    await request<unknown>("/catalog/track/favorite/all/", {}, true),
  );
}
export async function toggleFavorite(
  trackId: string | number,
  favorite: boolean,
): Promise<void> {
  await request(
    `/catalog/track/${encodeURIComponent(String(trackId))}/favorite/`,
    { method: favorite ? "POST" : "DELETE" },
    true,
  );
}