import styles from "./TrackLoader.module.css";

const SKELETON_ROWS = 6;

export default function TrackLoader() {
  return (
    <div className={styles.loader} role="status" aria-label="Загрузка треков">
      <span className="visually-hidden">Загрузка треков…</span>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div className={styles.row} key={index} aria-hidden="true">
          <span className={`${styles.shimmer} ${styles.cover}`} />
          <span className={`${styles.shimmer} ${styles.title}`} />
          <span className={`${styles.shimmer} ${styles.author}`} />
          <span className={`${styles.shimmer} ${styles.album}`} />
          <span className={`${styles.shimmer} ${styles.duration}`} />
        </div>
      ))}
    </div>
  );
}