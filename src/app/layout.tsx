import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { siteUrl } from "@/lib/env";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Mystery Boxes",
    template: "%s | Mystery Boxes",
  },
  description:
    "We compare and review mystery box operators for the UK and the US.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
