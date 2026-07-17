import Link from "next/link";
import styles from "./TrackInfo.module.css";

export default function TrackInfo() {
  return (
    <div className={styles.player__trackPlay}>
      <div className={styles.trackPlay__contain}>
        <div className={styles.trackPlay__image}>
          <svg className={styles.trackPlay__svg}>
            <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
          </svg>
        </div>
        <div className={styles.trackPlay__author}>
          <Link href="#" className={styles.trackPlay__authorLink}>
            Ты та...
          </Link>
        </div>
        <div className={styles.trackPlay__album}>
          <Link href="#" className={styles.trackPlay__albumLink}>
            Баста
          </Link>
        </div>
      </div>
      <div className={styles.trackPlay__actions}>
        <div className={`${styles.trackPlay__like} ${styles.btnIcon}`}>
          <svg className={styles.trackPlay__likeSvg}>
            <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>
          </svg>
        </div>
        <div className={`${styles.trackPlay__dislike} ${styles.btnIcon}`}>
          <svg className={styles.trackPlay__dislikeSvg}>
            <use xlinkHref="/img/icon/sprite.svg#icon-dislike"></use>
          </svg>
        </div>
      </div>
    </div>
  );
}