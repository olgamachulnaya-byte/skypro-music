"use client";

import { useCallback } from "react";
import SearchBar from "./SearchBar/SearchBar";
import Filter from "./Filter/Filter";
import Playlist from "./Playlist/Playlist";
import TrackLoader from "./TrackLoader/TrackLoader";
import styles from "./CenterBlock.module.css";
import type { Track } from "@/data";
import { getSelection, getTracks } from "@/lib/api";
import { useTracks } from "@/hooks/useTracks";

export default function CenterBlock({
  selectionId,
  title = "Треки",
}: {
  selectionId?: string;
  title?: string;
}) {
  const loader = useCallback(
    (): Promise<Track[]> =>
      selectionId
        ? getSelection(selectionId).then((selection) => selection.items)
        : getTracks(),
    [selectionId],
  );
 const { tracks, isLoading, error, reload } = useTracks(loader);
  
 return (
    <div className={styles.centerblock}>
      <SearchBar />
      <h2 className={styles.centerblock__h2}>{title}</h2>
      {!selectionId && <Filter tracks={tracks} />}
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