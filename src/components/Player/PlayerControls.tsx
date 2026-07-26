import styles from "./PlayerControls.module.css";

interface PlayerControlsProps {
  isPlaying: boolean;
  isLooping: boolean;
  isShuffling: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onTogglePlaying: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleLoop: () => void;
  onToggleShuffle: () => void;
}

export default function PlayerControls({
  isPlaying,
  isLooping,
  isShuffling,
  canGoPrevious,
  canGoNext,
  onTogglePlaying,
  onPrevious,
  onNext,
  onToggleLoop,
  oonToggleShuffle,
}: PlayerControlsProps) {
  return (
    <div className={styles.player__controls}>
      <button
        className={styles.player__btnPrev}
        type="button"
        aria-label="Предыдущий трек"
        disabled={!canGoPrevious}
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
        disabled={!canGoNext}
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
        className={`${styles.player__btnShuffle} ${styles.btnIcon} ${isShuffling ? styles.btnIconActive : ""}`}
        type="button"
        aria-label={isShuffling ? "Отключить перемешивание" : "Перемешать треки"}
        aria-pressed={isShuffling}
        onClick={onToggleShuffle}
      >
        <svg className={styles.player__btnShuffleSvg}>
          <use href="/img/icon/sprite.svg#icon-shuffle" />
        </svg>
      </button>
    </div>
  );
}