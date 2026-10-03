import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

import { META } from "@/lib/content";

const font = Inter_Tight({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: META.title,
  description: META.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} antialiased overflow-x-hidden`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
