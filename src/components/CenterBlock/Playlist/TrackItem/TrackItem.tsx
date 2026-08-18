"use client";

import Link from "next/link";
import type { Track } from "@/data";
import {
  setCurrentTrack,
  setCurrentPlaylist,
  setIsPlaying,
} from "@/components/store/features/playerSlice";
import { useAppDispatch, useAppSelector } from "@/components/store/store";
import { useCallback } from "react";
import { useFavoriteTrack } from "@/hooks/useFavoriteTrack";
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
  const { currentTrack, currentPlaylist, catalogTracks, isPlaying } =
    useAppSelector((state) => state.player);
  const displayTrack =
    currentPlaylist.find((item) => String(item._id) === String(track._id)) ??
    catalogTracks.find((item) => String(item._id) === String(track._id)) ??
    track;
  const {
    favorite,
    likesCount,
    error: favoriteError,
    isUpdating: isUpdatingFavorite,
    changeFavorite,
  } = useFavoriteTrack(displayTrack, { onRemoved: onFavoriteRemoved });
  const isCurrent = currentTrack?._id === track._id;

  const selectTrack = useCallback(() => {
    if (isCurrent) {
      dispatch(setIsPlaying(!isPlaying));
      return;
    }

    dispatch(setCurrentTrack(displayTrack));
    dispatch(setCurrentPlaylist(playlist));
    dispatch(setIsPlaying(true));
  }, [dispatch, displayTrack, isCurrent, isPlaying, playlist]);

  const handleFavoriteClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
     void changeFavorite();
  }, [changeFavorite]);
  
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
            onClick={handleFavoriteClick}
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