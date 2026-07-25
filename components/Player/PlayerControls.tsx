import styles from "./PlayerControls.module.css";

interface PlayerControlsProps {
  isPlaying: boolean;
  isLooping: boolean;
  onTogglePlaying: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleLoop: () => void;
  onShuffle: () => void;
}

export default function PlayerControls({
  isPlaying,
  isLooping,
  onTogglePlaying,
  onPrevious,
  onNext,
  onToggleLoop,
  onShuffle,
}: PlayerControlsProps) {
  return (
    <div className={styles.player__controls}>
      <button
        className={styles.player__btnPrev}
        type="button"
        aria-label="Предыдущий трек"
        onClick={onPrevious}
      >
        <svg className={styles.player__btnPrevSvg}>
          <use href="/img/icon/sprite.svg#icon-prev" />
        </svg>
      </button>
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
      <button
        className={styles.player__btnNext}
        type="button"
        aria-label="Следующий трек"
        onClick={onNext}
      >
        <svg className={styles.player__btnNextSvg}>
          <use href="/img/icon/sprite.svg#icon-next" />
        </svg>
      </button>
      <button
        className={`${styles.player__btnRepeat} ${styles.btnIcon} ${isLooping ? styles.btnIconActive : ""}`}
        type="button"
        aria-label={isLooping ? "Отключить повтор" : "Повторять трек"}
        aria-pressed={isLooping}
        onClick={onToggleLoop}
      >
        <svg className={styles.player__btnRepeatSvg}>
          <use href="/img/icon/sprite.svg#icon-repeat" />
        </svg>
      </button>
      <button
        className={`${styles.player__btnShuffle} ${styles.btnIcon}`}
        type="button"
        aria-label="Случайный трек"
        onClick={onShuffle}
      >
        <svg className={styles.player__btnShuffleSvg}>
          <use href="/img/icon/sprite.svg#icon-shuffle" />
        </svg>
      </button>
    </div>
  );
}