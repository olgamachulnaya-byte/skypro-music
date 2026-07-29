"use client";

import Link from "next/link";
import type { Track } from "@/data";
import {
  setCurrentTrack,
  setCurrentPlaylist,
  setIsPlaying,
} from "@/components/store/features/playerSlice";
import { useAppDispatch, useAppSelector } from "@/components/store/store";
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

export default function TrackItem({ track, playlist }: TrackItemProps) {
  const dispatch = useAppDispatch();
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
          <svg className={styles.track__timeSvg}>
            <use href="/img/icon/sprite.svg#icon-like" />
          </svg>
          <span className={styles.track__timeText}>
            {formatDuration(track.duration_in_seconds)}
          </span>
        </div>
      </div>
    </div>
  );
}