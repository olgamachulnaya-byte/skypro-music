import type { Track, TrackUser } from "@/data";

export function getFavoriteUserId(user: Track["stared_user"][number]): string | null {
  if (typeof user === "string" || typeof user === "number") {
    return String(user);
  }

  const id = user._id ?? user.id;
  return typeof id === "string" || typeof id === "number" ? String(id) : null;
}

export function isTrackFavorite(track: Track, userId: string | null): boolean {
  return Boolean(
    userId && track.stared_user.some((user) => getFavoriteUserId(user) === userId),
  );
}

export function updateTrackFavoriteState(
  track: Track,
  userId: string,
  favorite: boolean,
): Track {
  const alreadyFavorite = isTrackFavorite(track, userId);

  if (favorite === alreadyFavorite) return track;

  const userReference: TrackUser = { _id: userId };
  return {
    ...track,
    stared_user: favorite
      ? [...track.stared_user, userReference]
      : track.stared_user.filter((user) => getFavoriteUserId(user) !== userId),
  };
}