import TrackLoader from "@/components/CenterBlock/TrackLoader/TrackLoader";
import styles from "./loading.module.css";

export default function Loading() {
  return (
    <section className={styles.centerblock} aria-label="Загрузка страницы с музыкой">
      <div className={`${styles.shimmer} ${styles.search}`} aria-hidden="true" />
      <div className={`${styles.shimmer} ${styles.heading}`} aria-hidden="true" />
      <div className={styles.filters} aria-hidden="true">
        <span className={`${styles.shimmer} ${styles.filter}`} />
        <span className={`${styles.shimmer} ${styles.filter}`} />
        <span className={`${styles.shimmer} ${styles.filter}`} />
      </div>
      <TrackLoader />
    </section>
  );
}