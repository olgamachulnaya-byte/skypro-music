import TrackItem from "./TrackItem/TrackItem";
import PlaylistHeader from "./PlaylistHeader/PlaylistHeader";
import type { Track } from "@/data";
import styles from "./Playlist.module.css";

export default function Playlist({ tracks }: { tracks: Track[] }) {
  return (
    <div className={styles.centerblock__content}>
      <PlaylistHeader />
      <div className={styles.content__playlist}>
        {tracks.length === 0 && <p>Треки не найдены</p>}
        {tracks.map((track) => (
          <TrackItem key={track._id} track={track} playlist={tracks} />
        ))}
      </div>
    </div>
  );
}