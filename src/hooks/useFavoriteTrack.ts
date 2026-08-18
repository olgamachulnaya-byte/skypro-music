"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type { Track } from "@/data";
import { toggleFavorite } from "@/lib/api";
import { getAuthUserId, subscribeToAuthSession } from "@/lib/auth";
import { isTrackFavorite } from "@/lib/favorites";
import { updateFavorite } from "@/components/store/features/playerSlice";
import { useAppDispatch } from "@/components/store/store";

interface UseFavoriteTrackOptions {
  onRemoved?: (trackId: Track["_id"]) => void;
}

/**
 * Keeps the list and player favorite controls consistent while an update is in
 * flight. The optimistic value makes the UI react immediately; the player
 * store becomes the shared source of truth once the server confirms it.
 */
export function useFavoriteTrack(
  track: Track,
  { onRemoved }: UseFavoriteTrackOptions = {},
) {
  const dispatch = useAppDispatch();
  const userId = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthUserId,
    () => null,
  );
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const serverFavorite = isTrackFavorite(track, userId);
  const favorite = optimisticFavorite ?? serverFavorite;
  const likesCount = useMemo(() => {
    if (
      optimisticFavorite === null ||
      optimisticFavorite === serverFavorite
    ) {
      return track.stared_user.length;
    }

    return track.stared_user.length + (optimisticFavorite ? 1 : -1);
  }, [optimisticFavorite, serverFavorite, track.stared_user.length]);

  const changeFavorite = useCallback(async () => {
    if (!userId) {
      setError("Войдите в аккаунт, чтобы изменить список избранного");
      return;
    }
    if (isUpdating) return;

    const nextFavorite = !favorite;
    setOptimisticFavorite(nextFavorite);
    setError(null);
    setIsUpdating(true);

    try {
      await toggleFavorite(track._id, nextFavorite);
      dispatch(updateFavorite(track._id, userId, nextFavorite));
      setOptimisticFavorite(null);
      if (!nextFavorite) onRemoved?.(track._id);
    } catch (requestError: unknown) {
      // Returning to `null` restores the last server-confirmed value. Keeping a
      // boolean override here would hide later updates made by the other like
      // control for the same track.
      setOptimisticFavorite(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось изменить избранное",
      );
    } finally {
      setIsUpdating(false);
    }
  }, [dispatch, favorite, isUpdating, onRemoved, track._id, userId]);

  return useMemo(
    () => ({ favorite, likesCount, error, isUpdating, changeFavorite }),
    [changeFavorite, error, favorite, isUpdating, likesCount],
  );
}