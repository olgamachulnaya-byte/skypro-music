"use client";

import { useCallback, useMemo, useState } from "react";
import SearchBar from "./SearchBar/SearchBar";
import Filter, { type TrackFilters } from "./Filter/Filter";
import Playlist from "./Playlist/Playlist";
import TrackLoader from "./TrackLoader/TrackLoader";
import styles from "./CenterBlock.module.css";
import type { Track } from "@/data";
import { getFavoriteTracks, getSelection, getTracks } from "@/lib/api";
import { useTracks, type TracksResult } from "@/hooks/useTracks";

export default function CenterBlock({
  selectionId,
  favorites = false,
  title = "Треки",
}: {
  selectionId?: string;
  favorites?: boolean;
  title?: string;
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<TrackFilters>({
    author: null,
    year: null,
    genre: null,
  });
  const loader = useCallback(
    (): Promise<TracksResult> =>
       favorites
        ? getFavoriteTracks().then((tracks) => ({ tracks }))
        : selectionId
        ? getSelection(selectionId).then((selection) => ({
            tracks: selection.items,
            title: selection.name,
          }))
        : getTracks().then((tracks: Track[]) => ({ tracks })),
      [favorites, selectionId],
  );
  const { tracks, title: apiTitle, isLoading, error, reload } =
    useTracks(loader);
  const visibleTracks = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("ru");

    return tracks.filter((track) => {
      const matchesSearch =
        !normalizedSearch ||
        track.name.toLocaleLowerCase("ru").includes(normalizedSearch);
      const matchesAuthor = !filters.author || track.author === filters.author;
      const matchesYear =
        !filters.year || track.release_date.slice(0, 4) === filters.year;
      const matchesGenre =
        !filters.genre || track.genre.includes(filters.genre);

      return matchesSearch && matchesAuthor && matchesYear && matchesGenre;
    });
  }, [filters, search, tracks]);
  
  return (
    <div className={styles.centerblock}>
       <SearchBar value={search} onChange={setSearch} />
      <h2 className={styles.centerblock__h2}>{apiTitle ?? title}</h2>
      {!selectionId && !isLoading && !error && (
        <Filter tracks={tracks} value={filters} onChange={setFilters} />
      )}
      {isLoading && <TrackLoader />}
      {error && (
        <div className={`${styles.status} ${styles.error}`} role="alert">
          <p>{error}</p>
          <button className={styles.retryButton} type="button" onClick={reload}>
            Повторить
          </button>
        </div>
      )}
      {!isLoading && !error && <Playlist tracks={visibleTracks} />}
    </div>
  );
}