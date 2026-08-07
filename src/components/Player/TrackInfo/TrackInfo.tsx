"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import type { Track } from "@/data";
import { toggleFavorite } from "@/lib/api";
import { getAuthUserId, subscribeToAuthSession } from "@/lib/auth";
import { isTrackFavorite } from "@/lib/favorites";
import { updateFavorite } from "@/components/store/features/playerSlice";
import { useAppDispatch } from "@/components/store/store";
import styles from "./TrackInfo.module.css";

export default function TrackInfo({ track }: { track: Track }) {
  const dispatch = useAppDispatch();
  const userId = useSyncExternalStore(subscribeToAuthSession, getAuthUserId, () => null);
  const [favoriteOverride, setFavoriteOverride] = useState<boolean | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const favorite = favoriteOverride ?? isTrackFavorite(track, userId);
  const likesCount =
    track.stared_user.length +
    (favoriteOverride === null
      ? 0
      : favoriteOverride === isTrackFavorite(track, userId)
        ? 0
        : favoriteOverride
          ? 1
          : -1);

  const changeFavorite = async () => {
    if (!userId) {
      setFavoriteError("Войдите в аккаунт, чтобы добавить трек в избранное");
      return;
    }

    const next = !favorite;
    setFavoriteOverride(next);
    setFavoriteError(null);

    try {
      await toggleFavorite(track._id, next);
      dispatch(updateFavorite(track._id, userId, next));
      setFavoriteOverride(null);
    } catch (error: unknown) {
      setFavoriteOverride(!next);
      setFavoriteError(
        error instanceof Error
          ? error.message
          : "Не удалось изменить избранное",
      );
    }
  };

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
          onClick={changeFavorite}
          aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}
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