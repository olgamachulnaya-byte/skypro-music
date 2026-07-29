import SidebarItem from "./SidebarItem/SidebarItem";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const playlists = [
    { id: 1, src: "/img/playlist01.png", alt: "Плейлист дня" },
    { id: 2, src: "/img/playlist02.png", alt: "100 танцевальных хитов" },
    { id: 3, src: "/img/playlist03.png", alt: "Инди-заряд" },
  ];

  return (
    <div className={styles.main__sidebar}>
      <div className={styles.sidebar__block}>
        <div className={styles.sidebar__list}>
          {playlists.map((playlist) => (
            <SidebarItem key={playlist.id} {...playlist} href={`/playlist/${playlist.id}`} />
          ))}
        </div>
      </div>
    </div>
  );
}