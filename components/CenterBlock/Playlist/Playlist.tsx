import TrackItem from "./TrackItem";
import PlaylistHeader from "./PlaylistHeader";
import { tracksData } from "@/data";
import styles from "./Playlist.module.css";

export default function Playlist() {

  return (
    <div className={styles.centerblock__content}>
      <PlaylistHeader />
      <div className={styles.content__playlist}>
        {tracksData.map((track) => (
          <TrackItem key={track._id} track={track} />
        ))}
      </div>
    </div>
  );
 }