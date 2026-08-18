"use client";

import Link from "next/link";
import type { Track } from "@/data";
import { useFavoriteTrack } from "@/hooks/useFavoriteTrack";
import styles from "./TrackInfo.module.css";

export default function TrackInfo({ track }: { track: Track }) {
  const {
    favorite,
    likesCount,
    error: favoriteError,
    isUpdating,
    changeFavorite,
  } = useFavoriteTrack(track);

  return (
    <div className={styles.player__trackPlay}>
      <div className={styles.trackPlay__contain}>
        <div className={styles.trackPlay__image}>
          <svg className={styles.trackPlay__svg}>
          <use href="/img/icon/sprite.svg#icon-note" />
          </svg>
        </div>
        <div className={styles.trackPlay__author}>
          <Link href="#" className={styles.trackPlay__authorLink} onClick={(event) => event.preventDefault()}>
            {track.name}
          </Link>
        </div>
        <div className={styles.trackPlay__album}>
          <Link href="#" className={styles.trackPlay__albumLink} onClick={(event) => event.preventDefault()}>                        
            {track.author}
          </Link>
        </div>
      </div>
      <div className={styles.trackPlay__actions}>
        <button
          type="button"
          className={`${styles.trackPlay__like} ${styles.btnIcon} ${favorite ? styles.favoriteButtonActive : ""}`}
          onClick={() => void changeFavorite()}
          disabled={isUpdating}
          aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}
          aria-busy={isUpdating}
          title={favoriteError ?? undefined}
        >
          <svg className={`${styles.trackPlay__likeSvg} ${favorite ? styles.favoriteActive : ""}`}>
            <use href="/img/icon/sprite.svg#icon-like" />
          </svg>
         <span className={styles.favoriteCount}>{likesCount}</span>
        </button>
        <div className={`${styles.trackPlay__dislike} ${styles.btnIcon}`}>
          <svg className={styles.trackPlay__dislikeSvg}>
            <use href="/img/icon/sprite.svg#icon-dislike" />
          </svg>
        </div>
      </div>
       {favoriteError && (
        <p className={styles.favoriteError} role="alert">
          {favoriteError}
        </p>
      )}
    </div>
  );
}