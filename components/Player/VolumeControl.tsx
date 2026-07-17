import styles from "./VolumeControl.module.css";

export default function VolumeControl() {
  return (
    <div className={styles.volume__content}>
      <div className={styles.volume__image}>
        <svg className={styles.volume__svg}>
          <use xlinkHref="/img/icon/sprite.svg#icon-volume"></use>
        </svg>
      </div>
      <div className={`${styles.volume__progress} ${styles.btn}`}>
        <input
          className={`${styles.volume__progressLine} ${styles.btn}`}
          type="range"
          name="range"
        />
      </div>
    </div>
  );
}