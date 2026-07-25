"use client";

import { useEffect, useRef, useState } from "react";
import PlayerControls from "./PlayerControls";
import TrackInfo from "./TrackInfo";
import VolumeControl from "./VolumeControl";
import styles from "./Player.module.css";
import { setIsPlaying } from "@/components/store/features/playerSlice";
import { useAppDispatch, useAppSelector } from "@/components/store/store";

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useAppDispatch();
  const { currentTrack, isPlaying } = useAppSelector((state) => state.player);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      void audio.play().catch(() => dispatch(setIsPlaying(false)));
    } else {
      audio.pause();
    }
  }, [currentTrack, dispatch, isPlaying]);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(currentTrack?.duration_in_seconds ?? 0);
  }, [currentTrack]);

  const togglePlaying = () => {
    if (currentTrack) dispatch(setIsPlaying(!isPlaying));
  };

  const seek = (value: number) => {
    if (audioRef.current) audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const changeVolume = (value: number) => {
    if (audioRef.current) audioRef.current.volume = value;
    setVolume(value);
  };

  if (!currentTrack) return null;

  return (
    <div className={styles.bar}>
        <audio
        ref={audioRef}
        src={currentTrack.track_file}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onEnded={() => dispatch(setIsPlaying(false))}
      />
      <div className={styles.bar__content}>
        <input
          className={styles.bar__playerProgress}
          type="range"
          min="0"
          max={duration || currentTrack.duration_in_seconds}
          step="0.1"
          value={currentTime}
          aria-label="Позиция воспроизведения"
          onChange={(event) => seek(Number(event.target.value))}
        />
        <div className={styles.bar__playerBlock}>
          <div className={styles.bar__player}>
             <PlayerControls isPlaying={isPlaying} onTogglePlaying={togglePlaying} />
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