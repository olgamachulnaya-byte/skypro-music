import Image from "next/image";
import styles from "./SidebarRight.module.css";

export default function SidebarRight() {
  return (
    <div className={styles.main__sidebar}>
      <div className={styles.sidebar__personal}>
        {/* Возвращаем имя пользователя */}
        <p className={styles.sidebar__personalName}>Sergey.Ivanov</p>

        <div className={styles.sidebar__icon}>
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 40 40" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            role="button"
            aria-label="Выход"
          >
            <path d="M25.6711 16.046V14.7419C25.6711 13.2276 24.4435 12 22.9292 12H16.7419C15.2276 12 14 13.2276 14 14.7419V26.0645C14 27.5788 15.2276 28.8065 16.7419 28.8065H22.9292C24.4435 28.8065 25.6711 27.5788 25.6711 26.0645V24.6048M18.3572 20.3254H33.2963M30.1062 17.1353L33.2963 20.3254L30.1062 23.5155" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="20" cy="20" r="19.5" stroke="white"/>
          </svg>
        </div>
      </div>

      {/* Блок с плейлистами */}
      <div className={styles.sidebar__block}>
        <div className={styles.sidebar__list}>
          <div className={styles.sidebar__item}>
            <Image src="/img/playlist01.png" alt="Плейлист дня" width={250} height={150} className={styles.sidebar__img} priority />
          </div>
          <div className={styles.sidebar__item}>
            <Image src="/img/playlist02.png" alt="100 танцевальных хитов" width={250} height={150} className={styles.sidebar__img} priority />
          </div>
          <div className={styles.sidebar__item}>
            <Image src="/img/playlist03.png" alt="Инди-заряд" width={250} height={150} className={styles.sidebar__img} priority />
          </div>
        </div>
      </div>
    </div>
  );
}