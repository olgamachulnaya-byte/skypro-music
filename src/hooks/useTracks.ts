"use client";

import { useEffect, useState } from "react";
import type { Track } from "@/data";

interface TracksState {
  tracks: Track[];
  isLoading: boolean;
  error: string | null;
}

export function useTracks(loader: () => Promise<Track[]>): TracksState {
  const [state, setState] = useState<TracksState>({
    tracks: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    loader()
      .then((tracks) => {
        if (active) setState({ tracks, isLoading: false, error: null });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            tracks: [],
            isLoading: false,
            error: error instanceof Error ? error.message : "Неизвестная ошибка",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [loader]);

  return state;
}