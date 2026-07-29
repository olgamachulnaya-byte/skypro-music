"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/api";
import styles from "./AuthForm.module.css";

export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const repeatPassword = String(formData.get("repeatPassword") ?? "");

    if (!email || !password) return setError("Заполните почту и пароль");
     if (!/^\S+@\S+\.\S+$/.test(email)) {
      return setError("Введите корректный адрес электронной почты");
    }
    if (mode === "signup" && password !== repeatPassword) {
      return setError("Пароли не совпадают");
    }

    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp({ email, password });
        router.replace("/auth/signin");
      } else {
        const tokens = await signIn({ email, password });
        localStorage.setItem("accessToken", tokens.access);
        localStorage.setItem("refreshToken", tokens.refresh);
        localStorage.setItem("userEmail", email);
        router.replace("/");
      }
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Неизвестная ошибка");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
        <Link href="/" className={styles.logo}>
          <Image src="/img/logo.png" alt="Skypro Music" width={140} height={21} priority />
        </Link>
        <input className={styles.input} type="email" name="email" placeholder="Почта" aria-label="Почта" autoComplete="email" disabled={isSubmitting} />
        <input className={styles.input} type="password" name="password" placeholder="Пароль" aria-label="Пароль" autoComplete={mode === "signin" ? "current-password" : "new-password"} disabled={isSubmitting} />
        {mode === "signup" && (
          <input className={styles.input} type="password" name="repeatPassword" placeholder="Повторите пароль" aria-label="Повторите пароль" autoComplete="new-password" disabled={isSubmitting} />
        )}
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
          {isSubmitting ? "Подождите…" : mode === "signin" ? "Войти" : "Зарегистрироваться"}
        </button>
        <Link
          href={mode === "signin" ? "/auth/signup" : "/auth/signin"}
          className={styles.secondaryButton}
        >
          {mode === "signin" ? "Зарегистрироваться" : "Войти"}
        </Link>
      </form>
    </div>
  );
}