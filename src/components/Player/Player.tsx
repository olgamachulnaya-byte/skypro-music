"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Track } from "@/data";
import PlayerControls from "./PlayerControls/PlayerControls";
import TrackInfo from "./TrackInfo/TrackInfo";
import VolumeControl from "./VolumeControl/VolumeControl";
import styles from "./Player.module.css";
import {
  setCurrentTrack,
  setIsPlaying,
} from "@/components/store/features/playerSlice";
import { useAppDispatch, useAppSelector } from "@/components/store/store";

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useAppDispatch();
  const { currentTrack, currentPlaylist, isPlaying } = useAppSelector(
    (state) => state.player,
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<Track[]>([]);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const activePlaylist = isShuffling ? shuffledPlaylist : currentPlaylist;
  const currentIndex = useMemo(
    () =>
      activePlaylist.findIndex(
        (track) => String(track._id) === String(currentTrack?._id),
      ),
    [activePlaylist, currentTrack?._id],
  );
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < activePlaylist.length - 1;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      void audio.play().catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          dispatch(setIsPlaying(false));
          setPlaybackError("Не удалось воспроизвести трек");
        }
      });
    } else {
      audio.pause();
    }
  }, [currentTrack, dispatch, isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [currentTrack, volume]);

  const togglePlaying = useCallback(() => {
    if (currentTrack) dispatch(setIsPlaying(!isPlaying));
  }, [currentTrack, dispatch, isPlaying]);

 const selectAdjacentTrack = useCallback((direction: -1 | 1) => {
    const nextTrack = activePlaylist[currentIndex + direction];
    if (!nextTrack) return false;

    dispatch(setCurrentTrack(nextTrack));
    dispatch(setIsPlaying(true));
    setPlaybackError(null);
    return true;
  }, [activePlaylist, currentIndex, dispatch]);

  const toggleShuffle = useCallback(() => {
    if (isShuffling) {
      setIsShuffling(false);
      setShuffledPlaylist([]);
      return;
    }

    const remainingTracks = currentPlaylist.filter(
      (track) => track._id !== currentTrack?._id,
    );

    for (let index = remainingTracks.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [remainingTracks[index], remainingTracks[randomIndex]] = [
        remainingTracks[randomIndex],
        remainingTracks[index],
      ];
    }

     setShuffledPlaylist(
      currentTrack ? [currentTrack, ...remainingTracks] : remainingTracks,
    );
    setIsShuffling(true);
  }, [currentPlaylist, currentTrack, isShuffling]);

  const seek = useCallback((value: number) => {
    if (audioRef.current) audioRef.current.currentTime = value;
    setCurrentTime(value);
  }, []);

  const changeVolume = useCallback((value: number) => {
    if (audioRef.current) audioRef.current.volume = value;
    setVolume(value);
  }, []);

  const syncPlayingState = useCallback((playing: boolean) => {
    if (playing !== isPlaying) dispatch(setIsPlaying(playing));
  }, [dispatch, isPlaying]);

  const handleEnded = useCallback(() => {
    if (!selectAdjacentTrack(1)) dispatch(setIsPlaying(false));
  }, [dispatch, selectAdjacentTrack]);

  const selectPreviousTrack = useCallback(() => {
    selectAdjacentTrack(-1);
  }, [selectAdjacentTrack]);
  const selectNextTrack = useCallback(() => {
    selectAdjacentTrack(1);
  }, [selectAdjacentTrack]);
  const toggleLoop = useCallback(() => {
    setIsLooping((value) => !value);
  }, []);

  if (!currentTrack) return null;

  return (
    <div className={styles.bar}>
      <audio
        ref={audioRef}
        key={currentTrack._id}
        src={currentTrack.track_file}
        loop={isLooping}
        onLoadStart={() => {
          setCurrentTime(0);
          setDuration(currentTrack.duration_in_seconds);
          setPlaybackError(null);
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          const audioDuration = event.currentTarget.duration;
          setDuration(
            Number.isFinite(audioDuration)
              ? audioDuration
              : currentTrack.duration_in_seconds,
          );
        }}
        onPlay={() => syncPlayingState(true)}
        onPause={() => syncPlayingState(false)}
        onError={() => {
          syncPlayingState(false);
          setPlaybackError("Не удалось загрузить аудиофайл");
        }}
        onEnded={handleEnded}
      />
      <div className={styles.bar__content}>
        <div className={styles.bar__time} aria-live="off">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
         {playbackError && (
          <p className={styles.bar__error} role="alert">
            {playbackError}
          </p>
        )}
        <input
          className={styles.bar__playerProgress}
          type="range"
          min="0"
          max={duration || currentTrack.duration_in_seconds}
          step="0.1"
          value={Math.min(currentTime, duration || currentTrack.duration_in_seconds)}
          aria-label="Позиция воспроизведения"
          style={{ "--progress": `${progress}%` } as CSSProperties}
          onChange={(event) => seek(Number(event.target.value))}
        />
        <div className={styles.bar__playerBlock}>
          <div className={styles.bar__player}>
            <PlayerControls
              isPlaying={isPlaying}
              isLooping={isLooping}
              isShuffling={isShuffling}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              onTogglePlaying={togglePlaying}
              onPrevious={selectPreviousTrack}
              onNext={selectNextTrack}
              onToggleLoop={toggleLoop}
              onToggleShuffle={toggleShuffle}
            />
            <TrackInfo track={currentTrack} />
          </div>
          <div className={styles.bar__volumeBlock}>
            <VolumeControl volume={volume} onVolumeChange={changeVolume} />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(timeInSeconds: number): string {
  if (!Number.isFinite(timeInSeconds) || timeInSeconds < 0) return "0:00";

  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}