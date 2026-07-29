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
    if (mode === "signup" && password !== repeatPassword) {
      return setError("Пароли не совпадают");
    }

    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp({ email, password });
        router.push("/auth/signin");
      } else {
        const tokens = await signIn({ email, password });
        localStorage.setItem("accessToken", tokens.access);
        localStorage.setItem("refreshToken", tokens.refresh);
        localStorage.setItem("userEmail", email);
        router.push("/");
      }
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Неизвестная ошибка");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Link href="/" className={styles.logo}>
          <Image src="/img/logo.png" alt="Skypro Music" width={140} height={21} priority />
        </Link>
        <input className={styles.input} type="email" name="email" placeholder="Почта" autoComplete="email" />
        <input className={styles.input} type="password" name="password" placeholder="Пароль" autoComplete={mode === "signin" ? "current-password" : "new-password"} />
        {mode === "signup" && (
          <input className={styles.input} type="password" name="repeatPassword" placeholder="Повторите пароль" autoComplete="new-password" />
        )}
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
          {isSubmitting ? "Подождите…" : mode === "signin" ? "Войти" : "Зарегистрироваться"}
        </button>
        {mode === "signin" && (
          <Link href="/auth/signup" className={styles.secondaryButton}>Зарегистрироваться</Link>
        )}
      </form>
    </div>
  );
}