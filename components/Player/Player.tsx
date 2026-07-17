import PlayerControls from "./PlayerControls";
import TrackInfo from "./TrackInfo";
import VolumeControl from "./VolumeControl";
import styles from "./Player.module.css";

export default function Player() {
  return (
    <div className={styles.bar}>
      <div className={styles.bar__content}>
        <div className={styles.bar__playerProgress}></div>
        <div className={styles.bar__playerBlock}>
          <div className={styles.bar__player}>
            <PlayerControls />
            <TrackInfo />
          </div>
          <div className={styles.bar__volumeBlock}>
            <VolumeControl />
          </div>
        </div>
      </div>
    </div>
  );
}