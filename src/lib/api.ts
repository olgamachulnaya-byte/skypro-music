import type { Track } from "@/data";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://webdev-music-003b5b991590.herokuapp.com";
const REQUEST_TIMEOUT_MS = 15_000;

interface ApiEnvelope<T> {
  data: T;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface User {
  id?: number;
  _id?: number;
  email: string;
  username?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface Selection {
  _id: number;
  name: string;
  items: Track[];
}

interface SelectionResponse extends Omit<Selection, "items"> {
  items: Array<Track | number>;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

function getErrorMessage(body: unknown): string {
  if (typeof body === "string" && body.trim()) return body;
  if (!body || typeof body !== "object") return "Не удалось выполнить запрос";

  const record = body as Record<string, unknown>;
  const detail = record.detail ?? record.message ?? record.error;
  if (typeof detail === "string") return detail;

  const messages = Object.entries(record).flatMap(([field, value]) =>
    collectErrorMessages(value).map((message) => `${field}: ${message}`),
  );

  return messages.join(". ") || "Не удалось выполнить запрос";
}

function collectErrorMessages(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectErrorMessages);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectErrorMessages);
  }
  return [];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  let responseText: string;
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );


  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
      signal: controller.signal,
    });
    responseText = await response.text();
  } catch (error: unknown) {
    const message =
      error instanceof DOMException && error.name === "AbortError"
        ? "Сервер не ответил вовремя. Попробуйте ещё раз"
        : "Не удалось связаться с сервером. Попробуйте позже";
    throw new ApiError(message, 0);
  } finally {
    clearTimeout(timeoutId);
  }
  
  let body: unknown = null;

  if (responseText) {
    try {
      body = JSON.parse(responseText) as unknown;
    } catch {
      body = responseText;
    }
  }

  if (!response.ok) throw new ApiError(getErrorMessage(body), response.status);
  return body as T;
}

function unwrap<T>(response: T | ApiEnvelope<T>): T {
  return typeof response === "object" && response !== null && "data" in response
    ? (response as ApiEnvelope<T>).data
    : response;
}

export async function getTracks(): Promise<Track[]> {
  const tracks = unwrap(
    await request<Track[] | ApiEnvelope<Track[]>>("/catalog/track/all/"),
  );
  if (!Array.isArray(tracks) || !tracks.every(isTrack)) {
    throw new ApiError("Сервер вернул некорректный список треков", 0);
  }
  return tracks;
}

export async function getSelection(id: string): Promise<Selection> {
  const selection = unwrap(
    await request<SelectionResponse | ApiEnvelope<SelectionResponse>>(
      `/catalog/selection/${encodeURIComponent(id)}/`,
    ),
  );
  if (
    !selection ||
    typeof selection._id !== "number" ||
    typeof selection.name !== "string" ||
    !Array.isArray(selection.items)
  ) {
    throw new ApiError("Сервер вернул некорректную подборку", 0);
  }
   
  if (selection.items.every((item): item is Track => isTrack(item))) {
    return { ...selection, items: selection.items };
  }

  if (
    selection.items.every((item): item is number => typeof item === "number")
  ) {
    const tracks = await getTracks();
    const tracksById = new Map(tracks.map((track) => [track._id, track]));
    const selectionTracks = selection.items.map((trackId) =>
      tracksById.get(trackId),
    );

    if (selectionTracks.some((track) => !track)) {
      throw new ApiError("Не удалось найти все треки подборки", 0);
    }

    return {
      ...selection,
      items: selectionTracks as Track[],
    };
  }

  throw new ApiError("Сервер вернул некорректные треки подборки", 0);
}

function isTrack(value: unknown): value is Track {
  if (!value || typeof value !== "object") return false;

  const track = value as Partial<Track>;
  return (
    typeof track._id === "number" &&
    typeof track.name === "string" &&
    typeof track.author === "string" &&
    typeof track.release_date === "string" &&
    Array.isArray(track.genre) &&
    track.genre.every((genre) => typeof genre === "string") &&
    typeof track.duration_in_seconds === "number" &&
    typeof track.album === "string" &&
    (typeof track.logo === "string" || track.logo === null) &&
    typeof track.track_file === "string" &&
    Array.isArray(track.stared_user) &&
    track.stared_user.every((userId) => typeof userId === "number")
  );
}

export async function signUp(credentials: Credentials): Promise<User> {
  const user = unwrap(
    await request<User | ApiEnvelope<User>>("/user/signup/", {
      method: "POST",
      body: JSON.stringify({ ...credentials, username: credentials.email }),
    }),
  );

  if (!user || typeof user.email !== "string") {
    throw new ApiError("Сервер вернул некорректные данные пользователя", 0);
  }

  return user;
}

export async function signIn(credentials: Credentials): Promise<AuthTokens> {
  await request<User | ApiEnvelope<User>>("/user/login/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  const tokens = unwrap(
    await request<AuthTokens | ApiEnvelope<AuthTokens>>("/user/token/", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  );
 if (
    !tokens ||
    typeof tokens.access !== "string" ||
    typeof tokens.refresh !== "string"
  ) {
    throw new ApiError("Сервер не вернул токены авторизации", 0);
  }
  return tokens;
}