"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { tracksData } from "@/data";
import PlayerControls from "./PlayerControls";
import TrackInfo from "./TrackInfo";
import VolumeControl from "./VolumeControl";
import styles from "./Player.module.css";
import {
  setCurrentTrack,
  setIsPlaying,
} from "@/components/store/features/playerSlice";
import { useAppDispatch, useAppSelector } from "@/components/store/store";

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useAppDispatch();
  const { currentTrack, isPlaying } = useAppSelector((state) => state.player);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLooping, setIsLooping] = useState(false);

 const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      void audio.play().catch(() => dispatch(setIsPlaying(false)));
    } else {
      audio.pause();
    }
  }, [currentTrack, dispatch, isPlaying]);

  const togglePlaying = () => {
    if (currentTrack) dispatch(setIsPlaying(!isPlaying));
  };

  const selectAdjacentTrack = (direction: -1 | 1) => {
    const currentIndex = tracksData.findIndex(
      (track) => track._id === currentTrack?._id,
    );
    const nextIndex =
      (currentIndex + direction + tracksData.length) % tracksData.length;

    dispatch(setCurrentTrack(tracksData[nextIndex]));
    dispatch(setIsPlaying(true));
  };

  const selectRandomTrack = () => {
    if (tracksData.length < 2) return;

    const availableTracks = tracksData.filter(
      (track) => track._id !== currentTrack?._id,
    );
    const randomTrack =
      availableTracks[Math.floor(Math.random() * availableTracks.length)];

    dispatch(setCurrentTrack(randomTrack));
    dispatch(setIsPlaying(true));
  };

  const seek = (value: number) => {
    if (audioRef.current) audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const changeVolume = (value: number) => {
    if (audioRef.current) audioRef.current.volume = value;
    setVolume(value);
  };

  const syncPlayingState = (playing: boolean) => {
    if (playing !== isPlaying) dispatch(setIsPlaying(playing));
  };

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
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onPlay={() => syncPlayingState(true)}
        onPause={() => syncPlayingState(false)}
        onError={() => syncPlayingState(false)}
        onEnded={() => selectAdjacentTrack(1)}
      />
      <div className={styles.bar__content}>
        <div className={styles.bar__time} aria-live="off">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <input
          className={styles.bar__playerProgress}
          type="range"
          min="0"
          max={duration || currentTrack.duration_in_seconds}
          step="0.1"
          value={currentTime}
          aria-label="Позиция воспроизведения"
          style={{ "--progress": `${progress}%` } as CSSProperties}
          onChange={(event) => seek(Number(event.target.value))}
        />
        <div className={styles.bar__playerBlock}>
          <div className={styles.bar__player}>
            <PlayerControls
              isPlaying={isPlaying}
              isLooping={isLooping}
              onTogglePlaying={togglePlaying}
              onPrevious={() => selectAdjacentTrack(-1)}
              onNext={() => selectAdjacentTrack(1)}
              onToggleLoop={() => setIsLooping((value) => !value)}
              onShuffle={selectRandomTrack}
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