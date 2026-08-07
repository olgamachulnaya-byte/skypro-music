"use client";

import Link from "next/link";
import type { Track } from "@/data";
import {
  setCurrentTrack,
  setCurrentPlaylist,
  setIsPlaying,
} from "@/components/store/features/playerSlice";
import { useAppDispatch, useAppSelector } from "@/components/store/store";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/lib/api";
import { getAuthUserId, subscribeToAuthSession } from "@/lib/auth";
import styles from "./TrackItem.module.css";

interface TrackItemProps {
  track: Track;
  playlist: Track[];
}

function formatDuration(durationInSeconds: number): string {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getFavoriteUserId(user: Track["stared_user"][number]): string | null {
  if (typeof user === "string" || typeof user === "number") {
    return String(user);
  }

  const id = user._id ?? user.id;
  return typeof id === "string" || typeof id === "number" ? String(id) : null;
}

export default function TrackItem({ track, playlist }: TrackItemProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const userId = useSyncExternalStore(subscribeToAuthSession, getAuthUserId, () => null);
  const [favoriteOverride, setFavoriteOverride] = useState<boolean | null>(null);
  const favorite =
    favoriteOverride ??
    (userId
      ? track.stared_user.some((user) => getFavoriteUserId(user) === userId)
      : false);
  const [favoriteError, setFavoriteError] = useState(false);
  const { currentTrack, isPlaying } = useAppSelector((state) => state.player);
  const isCurrent = currentTrack?._id === track._id;

  const selectTrack = () => {
    if (isCurrent) {
      dispatch(setIsPlaying(!isPlaying));
      return;
    }

    dispatch(setCurrentTrack(track));
    dispatch(setCurrentPlaylist(playlist));
    dispatch(setIsPlaying(true));
  };

  const changeFavorite = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!userId) return router.push("/auth/signin");
    const next = !favorite;
    setFavoriteOverride(next);
    setFavoriteError(false);
    try { await toggleFavorite(track._id, next); }
    catch { setFavoriteOverride(!next); setFavoriteError(true); }
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
              {track.name}
            </Link>
          </div>
        </div>
        <div className={styles.track__author}>
         <Link href="#" className={styles.track__authorLink} onClick={(event) => event.preventDefault()}>
            {track.author}
          </Link>
        </div>
        <div className={styles.track__album}>
          <Link href="#" className={styles.track__albumLink} onClick={(event) => event.preventDefault()}>
            {track.album}
          </Link>
        </div>
        <div className={styles.track__time}>
          <button type="button" className={styles.favoriteButton} onClick={changeFavorite} aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"} title={favoriteError ? "Не удалось изменить избранное" : undefined}>
            <svg className={`${styles.track__timeSvg} ${favorite ? styles.favoriteActive : ""}`}>
              <use href="/img/icon/sprite.svg#icon-like" />
            </svg>
          </button>
          <span className={styles.track__timeText}>
            {formatDuration(track.duration_in_seconds)}
          </span>
        </div>
      </div>
    </div>
  );
}