import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import ConditionalFooter from "@/components/layout/ConditionalFooter";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BookMind AI — Intelligent Book Recommendations",
  description:
    "Discover your next favorite book with AI-powered semantic recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-[#07070f] text-slate-100`}>
        <Navbar />
        {children}
        <ConditionalFooter />
      </body>
    </html>
  );
}
