"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import SearchBar from "./SearchBar/SearchBar";
import Filter, { type TrackFilters } from "./Filter/Filter";
import Playlist from "./Playlist/Playlist";
import TrackLoader from "./TrackLoader/TrackLoader";
import styles from "./CenterBlock.module.css";
import type { Track } from "@/data";
import {
  getFavoriteTracks,
  getSelection,
  getTracks,
  loadFavoriteState,
} from "@/lib/api";
import { getAuthUserId, subscribeToAuthSession } from "@/lib/auth";
import { useTracks, type TracksResult } from "@/hooks/useTracks";
import { setCatalogTracks } from "@/components/store/features/playerSlice";
import { useAppDispatch, useAppSelector } from "@/components/store/store";

export default function CenterBlock({
  selectionId,
  favorites = false,
  title = "Треки",
}: {
  selectionId?: string;
  favorites?: boolean;
  title?: string;
}) {
  const dispatch = useAppDispatch();
  const catalogTracks = useAppSelector((state) => state.player.catalogTracks);
  const userId = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthUserId,
    () => null,
  );
  const catalogTracksRef = useRef(catalogTracks);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<TrackFilters>({
    author: null,
    year: null,
    genre: null,
  });
  useEffect(() => {
    catalogTracksRef.current = catalogTracks;
  }, [catalogTracks]);

  const loader = useCallback(async (): Promise<TracksResult> => {
    if (favorites) return getFavoriteTracks().then((tracks) => ({ tracks }));

    if (!selectionId) {
      const catalog = await getTracks();
      const tracks = userId
        ? await loadFavoriteState(catalog, userId)
        : catalog;
      dispatch(setCatalogTracks(tracks));
      return { tracks };
    }

    const storeTracks = catalogTracksRef.current;
     const selection = await getSelection(selectionId);
    const selectionHasTrackIds = selection.items.every(
      (item) => typeof item === "number" || typeof item === "string",
    );

    if (!selectionHasTrackIds) {
      const selectionTracks = selection.items as Track[];
      return {
        tracks: userId
          ? await loadFavoriteState(selectionTracks, userId)
          : selectionTracks,
        title: selection.name,
      };
    }

    const availableTracks =
      storeTracks.length > 0 ? storeTracks : await getTracks();
    const tracksById = new Map(
      availableTracks.map((track) => [String(track._id), track]),
    );
    const selectionTracks = selection.items
      .map((trackId) => tracksById.get(String(trackId)))
      .filter((track): track is Track => Boolean(track));

    if (storeTracks.length === 0) dispatch(setCatalogTracks(availableTracks));
    if (selectionTracks.length === 0 && selection.items.length > 0) {
      throw new Error("Не удалось найти треки подборки");
    }

    return {
      tracks: userId
        ? await loadFavoriteState(selectionTracks, userId)
        : selectionTracks,
      title: selection.name,
    };
  }, [dispatch, favorites, selectionId, userId]);
  const { tracks, title: apiTitle, isLoading, error, reload, removeTrack } =
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
      {!isLoading && !error && (
        <Playlist
          tracks={visibleTracks}
          onFavoriteRemoved={favorites ? removeTrack : undefined}
        />
      )}
    </div>
  );
}