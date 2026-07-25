import styles from "./PlayerControls.module.css";

interface PlayerControlsProps {
  isPlaying: boolean;
  onTogglePlaying: () => void;
}

export default function PlayerControls({ isPlaying, onTogglePlaying }: PlayerControlsProps) {
  return (
    <div className={styles.player__controls}>
      <div className={styles.player__btnPrev}>
        <svg className={styles.player__btnPrevSvg}>
          <use xlinkHref="/img/icon/sprite.svg#icon-prev"></use>
        </svg>
      </div>
      <button
        className={`${styles.player__btnPlay} ${styles.btn}`}
        type="button"
        aria-label={isPlaying ? "Поставить на паузу" : "Воспроизвести"}
        onClick={onTogglePlaying}
      >
        <svg className={styles.player__btnPlaySvg}>
          <use href={`/img/icon/sprite.svg#icon-${isPlaying ? "pause" : "play"}`} />
        </svg>
      </button>
      <div className={styles.player__btnNext}>
        <svg className={styles.player__btnNextSvg}>
          <use xlinkHref="/img/icon/sprite.svg#icon-next"></use>
        </svg>
      </div>
      <div className={`${styles.player__btnRepeat} ${styles.btnIcon}`}>
        <svg className={styles.player__btnRepeatSvg}>
          <use xlinkHref="/img/icon/sprite.svg#icon-repeat"></use>
        </svg>
      </div>
      <div className={`${styles.player__btnShuffle} ${styles.btnIcon}`}>
        <svg className={styles.player__btnShuffleSvg}>
          <use xlinkHref="/img/icon/sprite.svg#icon-shuffle"></use>
        </svg>
      </div>
    </div>
  );
}