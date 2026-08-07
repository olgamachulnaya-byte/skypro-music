import styles from "./PlaylistHeader.module.css";

export default function PlaylistHeader() {
  return (
    <div className={styles.content__title}>
      <div className={styles.playlistTitle__col + " " + styles.col01}>Трек</div>
      <div className={styles.playlistTitle__col + " " + styles.col02}>
        Исполнитель
      </div>
      <div className={styles.playlistTitle__col + " " + styles.col03}>
        Альбом
      </div>
      <div className={styles.playlistTitle__col + " " + styles.col04}>
        <svg className={styles.playlistTitle__svg}>
          <use href="/img/icon/sprite.svg#icon-watch" />
        </svg>
      </div>
    </div>
  );
}