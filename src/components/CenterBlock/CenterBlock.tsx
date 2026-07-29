"use client";

import { useCallback } from "react";
import SearchBar from "./SearchBar/SearchBar";
import Filter from "./Filter/Filter";
import Playlist from "./Playlist/Playlist";
import TrackLoader from "./TrackLoader/TrackLoader";
import styles from "./CenterBlock.module.css";
import type { Track } from "@/data";
import { getSelection, getTracks } from "@/lib/api";
import { useTracks, type TracksResult } from "@/hooks/useTracks";

export default function CenterBlock({
  selectionId,
  title = "Треки",
}: {
  selectionId?: string;
  title?: string;
}) {
  const loader = useCallback(
    (): Promise<TracksResult> =>
      selectionId
        ? getSelection(selectionId).then((selection) => ({
            tracks: selection.items,
            title: selection.name,
          }))
        : getTracks().then((tracks: Track[]) => ({ tracks })),
    [selectionId],
  );
 const { tracks, title: apiTitle, isLoading, error, reload } = useTracks(loader);
  
  return (
    <div className={styles.centerblock}>
      <SearchBar />
      <h2 className={styles.centerblock__h2}>{apiTitle ?? title}</h2>
      {!selectionId && !isLoading && !error && <Filter tracks={tracks} />}
      {isLoading && <TrackLoader />}
      {error && (
        <div className={`${styles.status} ${styles.error}`} role="alert">
          <p>{error}</p>
          <button className={styles.retryButton} type="button" onClick={reload}>
            Повторить
          </button>
        </div>
      )}
      {!isLoading && !error && <Playlist tracks={tracks} />}
    </div>
  );
}