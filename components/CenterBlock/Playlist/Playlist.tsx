import TrackItem from "./TrackItem";
import PlaylistHeader from "./PlaylistHeader";
import styles from "./Playlist.module.css";

export default function Playlist() {
  const tracks = [
    { id: 1, title: "Guilt", author: "Nero", album: "Welcome Reality", duration: "4:44" },
    { id: 2, title: "Elektro", author: "Dynoro, Outwork, Mr. Gee", album: "Elektro", duration: "2:22" },
    { id: 3, title: "I'm Fire", author: "Ali Bakgor", album: "I'm Fire", duration: "2:22", titleSpan: "" },
    { id: 4, title: "Non Stop", author: "Стоункат, Psychopath", album: "Non Stop", duration: "4:12", titleSpan: "(Remix)" },
    { id: 5, title: "Run Run", author: "Jaded, Will Clarke, AR/CO", album: "Run Run", duration: "2:54", titleSpan: "(feat. AR/CO)" },
  ];

  return (
    <div className={styles.centerblock__content}>
      <PlaylistHeader />
      <div className={styles.content__playlist}>
        {tracks.map((track) => (
          <TrackItem key={track.id} {...track} />
        ))}
      </div>
    </div>
  );
}