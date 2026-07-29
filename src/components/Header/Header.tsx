"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  clearAuthSession,
  getAuthEmail,
  subscribeToAuthSession,
} from "@/lib/auth";
import styles from "./Header.module.css";

export default function Header() {
  const router = useRouter();
  const email = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthEmail,
    () => null,
  );

  const signOut = () => {
    clearAuthSession();
    router.push("/auth/signin");
  };

  return (
    <nav className={styles.main__nav}>
      <div className={styles.nav__logo}>
        <Image
          width={113}
          height={17}
          className={styles.logo__image}
          src="/img/logo.png"
          alt="logo"
        />
      </div>
      <div className={styles.nav__burger}>
        <span className={styles.burger__line}></span>
        <span className={styles.burger__line}></span>
        <span className={styles.burger__line}></span>
      </div>
      <div className={styles.nav__menu}>
        <ul className={styles.menu__list}>
          <li className={styles.menu__item}>
            <Link href="/" className={styles.menu__link}>
              Главное
            </Link>
          </li>
          <li className={styles.menu__item}>
            <Link href="/" className={styles.menu__link}>
              Мой плейлист
            </Link>
          </li>
          <li className={styles.menu__item}>
            {email ? (
              <button type="button" className={styles.menu__link} onClick={signOut}>
                Выйти ({email})
              </button>
            ) : (
              <Link href="/auth/signin" className={styles.menu__link}>
                Войти
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}