import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { StarfieldBackground } from "@/components/layout/StarfieldBackground";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SpaceX Explorer",
    template: "%s · SpaceX Explorer",
  },
  description:
    "Browse SpaceX launches with server-side filtering, favorites, stats, and comparisons.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <StarfieldBackground />
        <AppProviders>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-sky-500 focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to main content
          </a>
          <Header />
          <main
            id="main-content"
            className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6"
          >
            {children}
          </main>
          <footer className="border-t border-slate-800/60 bg-slate-950/50 py-8 text-center backdrop-blur-sm">
            <p className="text-sm text-slate-500">
              Data from{" "}
              <a
                href="https://github.com/r-spacex/SpaceX-API"
                className="text-sky-400 transition-colors hover:text-sky-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                SpaceX API v4
              </a>
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Built for exploring humanity&apos;s journey to the stars
            </p>
          </footer>
        </AppProviders>
      </body>
    </html>
  );
}
