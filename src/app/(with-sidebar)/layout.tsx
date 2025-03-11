"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Sidebar from "../components/sidebar";
import PageWrapper from "../components/page-wrapper";
import MarginWidthWrapper from "../components/margin-width-wrapper";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function WithSidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className={`flex ${geistSans.variable} ${geistMono.variable}`}>
        <Sidebar />
        <main className="flex-1">
          <MarginWidthWrapper>
            <PageWrapper>
              {children}
            </PageWrapper>
          </MarginWidthWrapper>
        </main>
      </div>
    </SessionProvider>
  );
}