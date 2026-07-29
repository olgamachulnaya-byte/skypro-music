import type { Track } from "@/data";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://webdev-music-003b5b991590.herokuapp.com";

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

 const messages = Object.entries(record).flatMap(([field, value]) => {
    const values = Array.isArray(value) ? value : [value];
    return values
      .filter((item): item is string => typeof item === "string")
      .map((message) => `${field}: ${message}`);
  });

  return messages.join(". ") || "Не удалось выполнить запрос";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("Не удалось связаться с сервером. Попробуйте позже", 0);
  }
  const responseText = await response.text();
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
  if (!Array.isArray(tracks)) {
    throw new ApiError("Сервер вернул некорректный список треков", 0);
  }
  return tracks;
}

export async function getSelection(id: string): Promise<Selection> {
  const selection = unwrap(
    await request<Selection | ApiEnvelope<Selection>>(`/catalog/selection/${id}/`),
  );
  if (!selection || !Array.isArray(selection.items)) {
    throw new ApiError("Сервер вернул некорректную подборку", 0);
  }
  return selection;
}

export async function signUp(credentials: Credentials): Promise<User> {
  return unwrap(
    await request<User | ApiEnvelope<User>>("/user/signup/", {
      method: "POST",
      body: JSON.stringify({ ...credentials, username: credentials.email }),
    }),
  );
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
if (!tokens || typeof tokens.access !== "string" || typeof tokens.refresh !== "string") {
    throw new ApiError("Сервер не вернул токены авторизации", 0);
  }
  return tokens;
}