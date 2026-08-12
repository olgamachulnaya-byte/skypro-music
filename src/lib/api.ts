import { tracksData, type Track, type TrackUser } from "@/data";
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from "./auth";
import { updateTrackFavoriteState } from "./favorites";

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

export interface SelectionTrackIds {
  _id: string | number;
  name: string;
  items: Array<string | number>;
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

    if (!response.ok) {
      throw new ApiError(errorMessage(body), response.status);
    }
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

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new ApiError("Сессия истекла. Войдите в аккаунт снова", 401);
  }

  const response = unwrap(
    await request<unknown>("/user/token/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh }),
    }),
  );

  if (!isRecord(response) || typeof response.access !== "string") {
    throw new ApiError("Сервер вернул некорректный токен авторизации", 0);
  }

  saveAccessToken(response.access);
  return response.access;
}

/** Repeats an authorized operation once after renewing an expired access token. */
export function withReAuth<Arguments extends unknown[], Result>(
  authorizedRequest: (...args: Arguments) => Promise<Result>,
): (...args: Arguments) => Promise<Result> {
  return async (...args: Arguments): Promise<Result> => {
    try {
      return await authorizedRequest(...args);
    } catch (error: unknown) {
      if (!(error instanceof ApiError) || error.status !== 401) throw error;

      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        await refreshPromise;
      } catch {
        clearAuthSession();
        throw new ApiError("Сессия истекла. Войдите в аккаунт снова", 401);
      }

      return authorizedRequest(...args);
    }
  };
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

/**
 * Extracts a track list from both the legacy response and the paginated
 * Django REST Framework response used by the current catalog API.
 */
function parseTrackListResponse(value: unknown): Track[] {
 return parseTracks(extractTrackList(value));
}

function extractTrackList(value: unknown): unknown {
  const response = unwrap(value as unknown | ApiEnvelope<unknown>);

  if (isRecord(response)) {
    if ("results" in response) return response.results;
    if ("tracks" in response) return response.tracks;
  }

  return response;
}

export async function getTracks(): Promise<Track[]> {
  try {
    return parseTrackListResponse(
      await request<unknown>("/catalog/track/all/"),
    );
  } catch {
    // Keep the catalog usable when the training API is sleeping, unavailable,
    // or temporarily returns a response from an incompatible API version.
    return tracksData.map((track) => ({
      ...track,
      genre: [...track.genre],
      stared_user: [...track.stared_user],
    }));
  }
}

export async function getSelection(
  id: string,
): Promise<SelectionTrackIds | Selection> {
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

  if (
    selection.items.every((id) => typeof id === "number" || typeof id === "string")
  ) {
    return { ...selection, items: selection.items };
  }

  throw new ApiError("Сервер вернул некорректную подборку", 0);
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

const requestFavoriteTracks = async (): Promise<Track[]> => {
  const response = extractTrackList(
    await request<unknown>("/catalog/track/favorite/all/", {}, true),
  );

  if (!Array.isArray(response)) {
    throw new ApiError("Сервер вернул некорректный список треков", 0);
  }

  const parsedTracks = response.map(parseTrack);
  if (parsedTracks.every((track): track is Track => track !== null)) {
    return parsedTracks;
  }

  // Some API versions return only track ids (or shortened track objects) from
  // the favorites endpoint. Hydrate those references from the catalog instead
  // of rejecting a valid favorites response after a page reload.
  const favoriteIds = response.map((item) => {
    if (typeof item === "string" || typeof item === "number") return item;
    if (!isRecord(item)) return null;

    const id = item._id ?? item.id;
    return typeof id === "string" || typeof id === "number" ? id : null;
  });

  if (favoriteIds.some((id) => id === null)) {
    throw new ApiError("Сервер вернул некорректный список треков", 0);
  }

  const catalog = await getTracks();
  const tracksById = new Map(
    catalog.map((track) => [String(track._id), track]),
  );
  return favoriteIds
    .map((id) => tracksById.get(String(id)))
    .filter((track): track is Track => track !== undefined);
};

export const getFavoriteTracks = withReAuth(requestFavoriteTracks);

/**
 * Reconciles catalog data with the authenticated favorites endpoint.
 *
 * The public catalog response is not an authoritative source for the current
 * user's likes. In particular, it can omit that relationship after a page
 * reload even though the favorite was persisted successfully. The private
 * endpoint remains the source of truth, so remove the current user from the
 * catalog snapshot first and then add them back to the tracks returned there.
 */
export async function loadFavoriteState(
  tracks: Track[],
  userId: string,
): Promise<Track[]> {
  const favoriteTracks = await getFavoriteTracks();
  const favoriteIds = new Set(
    favoriteTracks.map((track) => String(track._id)),
  );

  return tracks.map((track) =>
    updateTrackFavoriteState(
      updateTrackFavoriteState(track, userId, false),
      userId,
      favoriteIds.has(String(track._id)),
    ),
  );
}

const requestToggleFavorite = async (
  trackId: string | number,
  favorite: boolean,
): Promise<void> => {
  await request(
    `/catalog/track/${encodeURIComponent(String(trackId))}/favorite/`,
    { method: favorite ? "POST" : "DELETE" },
    true,
  );
};

export const toggleFavorite = withReAuth(requestToggleFavorite);