import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const rugis = localFont({
  src: "../public/fonts/rugis.otf",
  variable: "--font-rugis",
  weight: "400",
  display: "swap",
});

export const sahabah = localFont({
  src: "../public/fonts/DG-Sahabah-Reg.ttf",
  variable: "--font-sahabah",
  weight: "400",
  display: "swap",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
