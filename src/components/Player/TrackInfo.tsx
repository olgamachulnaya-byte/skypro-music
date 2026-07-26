import Link from "next/link";
import styles from "./TrackInfo.module.css";
import type { Track } from "@/data";

export default function TrackInfo({ track }: { track: Track }) {
  return (
    <div className={styles.player__trackPlay}>
      <div className={styles.trackPlay__contain}>
        <div className={styles.trackPlay__image}>
          <svg className={styles.trackPlay__svg}>
          <use href="/img/icon/sprite.svg#icon-note" />
          </svg>
        </div>
        <div className={styles.trackPlay__author}>
          <Link href="#" className={styles.trackPlay__authorLink} onClick={(event) => event.preventDefault()}>
            {track.name}
          </Link>
        </div>
        <div className={styles.trackPlay__album}>
          <Link href="#" className={styles.trackPlay__albumLink} onClick={(event) => event.preventDefault()}>                        
            {track.author}
          </Link>
        </div>
      </div>
      <div className={styles.trackPlay__actions}>
        <div className={`${styles.trackPlay__like} ${styles.btnIcon}`}>
          <svg className={styles.trackPlay__likeSvg}>
            <use href="/img/icon/sprite.svg#icon-like" />
          </svg>
        </div>
        <div className={`${styles.trackPlay__dislike} ${styles.btnIcon}`}>
          <svg className={styles.trackPlay__dislikeSvg}>
            <use href="/img/icon/sprite.svg#icon-dislike" />
          </svg>
        </div>
      </div>
    </div>
  );
}