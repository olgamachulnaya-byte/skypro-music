import SearchBar from "./SearchBar";
import Filter from "./Filter/Filter";
import Playlist from "./Playlist/Playlist";
import styles from "./CenterBlock.module.css";

export default function CenterBlock() {
  return (
    <div className={styles.centerblock}>
      <SearchBar />
      <h2 className={styles.centerblock__h2}>Треки</h2>
      <Filter />
      <Playlist />
    </div>
  );
}