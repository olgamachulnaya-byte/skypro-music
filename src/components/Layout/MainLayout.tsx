import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import Player from "../Player/Player";
import styles from "./MainLayout.module.css";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Header />
          {children}
          <Sidebar />
        </main>
        <Player />
        <footer className={styles.footer}></footer>
      </div>
    </div>
  );
}