import Link from "next/link";
import styles from "./TrackItem.module.css";

interface TrackItemProps {
  title: string;
  author: string;
  album: string;
  duration: string;
  titleSpan?: string;
}

export default function TrackItem({
  title,
  author,
  album,
  duration,
  titleSpan,
}: TrackItemProps) {
  return (
    <div className={styles.playlist__item}>
      <div className={styles.playlist__track}>
        <div className={styles.track__title}>
          <div className={styles.track__titleImage}>
            <svg className={styles.track__titleSvg}>
              <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
            </svg>
          </div>
          <div className={styles.track__titleText}>
            <Link href="#" className={styles.track__titleLink}>
              {title}{" "}
              {titleSpan && (
                <span className={styles.track__titleSpan}>{titleSpan}</span>
              )}
            </Link>
          </div>
        </div>
        <div className={styles.track__author}>
          <Link href="#" className={styles.track__authorLink}>
            {author}
          </Link>
        </div>
        <div className={styles.track__album}>
          <Link href="#" className={styles.track__albumLink}>
            {album}
          </Link>
        </div>
        <div className={styles.track__time}>
          <svg className={styles.track__timeSvg}>
            <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>
          </svg>
          <span className={styles.track__timeText}>{duration}</span>
        </div>
      </div>
    </div>
  );
}