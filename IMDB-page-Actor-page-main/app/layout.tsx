
import type React from "react";
// @ts-expect-error Next.js processes CSS side-effect imports.
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import QueryProvider from "@/context/QueryProvider";

export const metadata = {
  title: {
    default: "PrimeView | Movies & Actors",
    template: "%s | PrimeView",
  },
  description:
    "Discover movies, explore actors, view movie details, and manage your personal watchlist with PrimeView.",
  applicationName: "PrimeView",
  keywords: [
    "PrimeView",
    "movies",
    "actors",
    "movie discovery",
    "watchlist",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <QueryProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
