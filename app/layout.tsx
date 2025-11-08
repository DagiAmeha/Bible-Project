import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/_lib/language-provider";
import { ThemeProvider } from "@/_lib/theme-provider";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "Bible Reading Tracker",
  description: "Track your bible reading, chat, and progress.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProviderWrapper>
          <ThemeProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
