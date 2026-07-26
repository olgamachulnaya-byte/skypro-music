import type { CSSProperties } from "react";
import styles from "./VolumeControl.module.css";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export default function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
  return (
    <div className={styles.volume__content}>
      <div className={styles.volume__image}>
        <svg className={styles.volume__svg}>
          <use href="/img/icon/sprite.svg#icon-volume" />
        </svg>
      </div>
      <div className={`${styles.volume__progress} ${styles.btn}`}>
        <input
          className={`${styles.volume__progressLine} ${styles.btn}`}
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          aria-label="Громкость"
          style={{ "--volume": `${volume * 100}%` } as CSSProperties}
          onChange={(event) => onVolumeChange(Number(event.target.value))}
        />
      </div>
    </div>
  );
}