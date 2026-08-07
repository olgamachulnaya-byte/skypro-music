"use client";

import CenterBlock from "@/components/CenterBlock/CenterBlock";
import { getAuthEmail, subscribeToAuthSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

export default function FavoritesPage() {
  const router = useRouter();
  const email = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthEmail,
    () => null,
  );

  useEffect(() => {
    if (!email) router.replace("/auth/signin");
  }, [email, router]);

  // Do not request or render private data while an unauthenticated visitor is
  // being redirected. The API performs its own token check as a second layer.
  if (!email) return null;

  return <CenterBlock favorites title="Мой плейлист" />;
}