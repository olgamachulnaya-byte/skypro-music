import styles from "./TrackLoader.module.css";
import PlaylistHeader from "../Playlist/PlaylistHeader/PlaylistHeader";

const SKELETON_ROWS = 6;

export default function TrackLoader() {
  return (
    <div
      className={styles.loader}
      role="status"
      aria-label="Загрузка треков"
      aria-live="polite"
    >
      <span className="visually-hidden">Загрузка треков…</span>
       <div aria-hidden="true">
        <PlaylistHeader />
        <div className={styles.rows}>
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <div className={styles.row} key={index}>
              <span className={`${styles.shimmer} ${styles.cover}`} />
              <span className={`${styles.shimmer} ${styles.title}`} />
              <span className={`${styles.shimmer} ${styles.author}`} />
              <span className={`${styles.shimmer} ${styles.album}`} />
              <span className={`${styles.shimmer} ${styles.duration}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}