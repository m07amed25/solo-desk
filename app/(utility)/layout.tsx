import type { Metadata } from "next";
import { rugis, sahabah, geistSans, geistMono } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "SoloDesk",
  description: "A clearer view of your independent work.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${rugis.variable} ${sahabah.variable} ${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
