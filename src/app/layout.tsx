import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Outfit } from "next/font/google";
import "./globals.css";

const brusher = localFont({
  src: "../../public/fonts/Brusher Regular.ttf",
  variable: "--font-brusher",
  display: "swap",
});

const patrickHand = localFont({
  src: "../../public/fonts/PatrickHand-Regular.ttf",
  variable: "--font-patrick-hand",
  display: "swap",
});

const aslyBrush = localFont({
  src: "../../public/fonts/Asly Brush Regular.ttf",
  variable: "--font-asly-brush",
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Clap & Wish!",
  description: "Light a candle, send a wish — and let them blow it out with a clap.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e8d8b5",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${brusher.variable} ${patrickHand.variable} ${aslyBrush.variable} ${outfit.variable} antialiased`}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {children}
      </body>
    </html>
  );
}