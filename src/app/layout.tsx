import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/store/ReduxProvider";

export const metadata: Metadata = {
  title: "Skypro Music",
  description: "Музыкальный плеер",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <html lang="ru">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}