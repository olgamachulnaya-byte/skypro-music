import Image from "next/image";
import Link from "next/link";
import styles from "./signin.module.css";

export default function SignIn() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.containerEnter}>
        <div className={styles.modal__block}>
          <form className={styles.modal__form} action="#">
            <Link href="/" className={styles.modal__logo}>
              <Image src="/img/logo.png" alt="logo" width={140} height={21} />
            </Link>
            <input
              className={styles.modal__input}
              type="text"
              name="login"
              placeholder="Почта"
            />
            <input
              className={styles.modal__input}
              type="password"
              name="password"
              placeholder="Пароль"
            />
            <button className={styles.modal__btnEnter}>Войти</button>
            <Link href="/auth/signup" className={styles.modal__btnSignup}>
              Зарегистрироваться
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}