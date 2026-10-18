import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

import { META } from "@/lib/content";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { ToastHandler } from "@/components/ui/ToastHandler";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const font = Inter_Tight({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: META.title,
  description: META.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} antialiased overflow-x-hidden`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster position="bottom-right" />
          <Suspense fallback={null}>
            <ToastHandler />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
