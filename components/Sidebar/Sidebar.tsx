import SidebarItem from "./SidebarItem";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const playlists = [
    { id: 1, src: "/img/playlist01.png", alt: "day's playlist" },
    { id: 2, src: "/img/playlist02.png", alt: "day's playlist" },
    { id: 3, src: "/img/playlist03.png", alt: "day's playlist" },
  ];

  return (
    <div className={styles.main__sidebar}>
      <div className={styles.sidebar__block}>
        <div className={styles.sidebar__list}>
          {playlists.map((playlist) => (
            <SidebarItem key={playlist.id} {...playlist} />
          ))}
        </div>
      </div>
    </div>
  );
}