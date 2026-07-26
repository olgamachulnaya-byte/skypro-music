import Image from "next/image";
import Link from "next/link";
import styles from "./signup.module.css";

export default function SignUp() {
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
            <input
              className={styles.modal__input}
              type="password"
              name="repeatPassword"
              placeholder="Повторите пароль"
            />
            <button className={styles.modal__btnSignupEnt}>
              Зарегистрироваться
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}