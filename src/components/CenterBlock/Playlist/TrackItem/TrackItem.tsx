"use client";

import Link from "next/link";
import type { Track } from "@/data";
import {
  setCurrentTrack,
  setCurrentPlaylist,
  setIsPlaying,
  updateFavorite,
} from "@/components/store/features/playerSlice";
import { useAppDispatch, useAppSelector } from "@/components/store/store";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/lib/api";
import { getAuthUserId, subscribeToAuthSession } from "@/lib/auth";
import { isTrackFavorite } from "@/lib/favorites";
import styles from "./TrackItem.module.css";

interface TrackItemProps {
  track: Track;
  playlist: Track[];
  onFavoriteRemoved?: (trackId: Track["_id"]) => void;
}

function formatDuration(durationInSeconds: number): string {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function TrackItem({
  track,
  playlist,
  onFavoriteRemoved,
}: TrackItemProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
 const userId = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthUserId,
    () => null,
  );
  const [favoriteOverride, setFavoriteOverride] = useState<boolean | null>(null);
   const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  const { currentTrack, currentPlaylist, catalogTracks, isPlaying } =
    useAppSelector((state) => state.player);
  const displayTrack =
    currentPlaylist.find((item) => String(item._id) === String(track._id)) ??
    catalogTracks.find((item) => String(item._id) === String(track._id)) ??
    track;
  const serverFavorite = isTrackFavorite(displayTrack, userId);
  const favorite = favoriteOverride ?? serverFavorite;
  const likesCount =
    displayTrack.stared_user.length +
    (favoriteOverride === null
      ? 0
      : favoriteOverride === serverFavorite
        ? 0
        : favoriteOverride
          ? 1
          : -1);
  const isCurrent = currentTrack?._id === track._id;

  const selectTrack = () => {
    if (isCurrent) {
      dispatch(setIsPlaying(!isPlaying));
      return;
    }

    dispatch(setCurrentTrack(displayTrack));
    dispatch(setCurrentPlaylist(playlist));
    dispatch(setIsPlaying(true));
  };

  const changeFavorite = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!userId) return router.push("/auth/signin");
    if (isUpdatingFavorite) return;
    const next = !favorite;
    setFavoriteOverride(next);
    setFavoriteError(null);
    setIsUpdatingFavorite(true);

    try {
      await toggleFavorite(displayTrack._id, next);
      dispatch(updateFavorite(displayTrack._id, userId, next));
      setFavoriteOverride(null);
      if (!next) onFavoriteRemoved?.(displayTrack._id);
    } catch (error: unknown) {
      setFavoriteOverride(null);
      setFavoriteError(
        error instanceof Error
          ? error.message
          : "Не удалось изменить избранное",
      );
      } finally {
      setIsUpdatingFavorite(false);
    }
  };
  
  return (
    <div className={styles.playlist__item} onClick={selectTrack}>
      <div className={styles.playlist__track}>
        <div className={styles.track__title}>
          <div className={styles.track__titleImage}>
            {isCurrent ? (
              <span
                className={`${styles.track__playingDot} ${isPlaying ? styles.track__playingDotActive : ""}`}
                aria-label={isPlaying ? "Трек воспроизводится" : "Трек на паузе"}
              />
            ) : (
              <svg className={styles.track__titleSvg}>
                <use href="/img/icon/sprite.svg#icon-note" />
              </svg>
            )}
          </div>
          <div className={styles.track__titleText}>
           <Link href="#" className={styles.track__titleLink} onClick={(event) => event.preventDefault()}>
              {displayTrack.name}
            </Link>
          </div>
        </div>
        <div className={styles.track__author}>
         <Link href="#" className={styles.track__authorLink} onClick={(event) => event.preventDefault()}>
            {displayTrack.author}
          </Link>
        </div>
        <div className={styles.track__album}>
          <Link href="#" className={styles.track__albumLink} onClick={(event) => event.preventDefault()}>
            {displayTrack.album}
          </Link>
        </div>
        <div className={styles.track__time}>
            <button
            type="button"
            className={`${styles.favoriteButton} ${favorite ? styles.favoriteButtonActive : ""}`}
            onClick={changeFavorite}
            disabled={isUpdatingFavorite}
            aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}
            aria-busy={isUpdatingFavorite}
            title={favoriteError ?? undefined}
          >
            <svg className={`${styles.track__timeSvg} ${favorite ? styles.favoriteActive : ""}`}>
              <use href="/img/icon/sprite.svg#icon-like" />
            </svg>
             <span className={styles.favoriteCount}>{likesCount}</span>
          </button>
            {favoriteError && (
            <span className={styles.favoriteError} role="alert">
              {favoriteError}
            </span>
          )}
          <span className={styles.track__timeText}>
            {formatDuration(displayTrack.duration_in_seconds)}
          </span>
        </div>
      </div>
    </div>
  );
}