"use client";

import { useEffect, useState } from "react";
import type { Track } from "@/data";

interface TracksState {
  tracks: Track[];
  title: string | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

export interface TracksResult {
  tracks: Track[];
  title?: string;
}


type TracksRequestState = Omit<TracksState, "reload">;

export function useTracks(loader: () => Promise<TracksResult>): TracksState {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState<TracksRequestState>({
    tracks: [],
    title: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    Promise.resolve()
      .then(loader)
      .then((result) => {
        if (active) {
          setState({
            tracks: result.tracks,
            title: result.title ?? null,
            isLoading: false,
            error: null,
          });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            tracks: [],
            title: null,
            isLoading: false,
            error: error instanceof Error ? error.message : "Неизвестная ошибка",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [loader, requestVersion]);

  return {
    ...state,
    reload: () => {
      setState({ tracks: [], title: null, isLoading: true, error: null });
      setRequestVersion((version) => version + 1);
    },
  };
}