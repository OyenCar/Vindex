import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vindex — AI-Governed Escrow for Freelance Work",
  description:
    "Vindex combines escrow vaults, milestone-based payments, investor governance, and AI-powered dispute resolution into a single trustless protocol.",
  metadataBase: new URL("https://Vindex.xyz"),
  openGraph: {
    title: "Vindex — AI-Governed Escrow for Freelance Work",
    description:
      "Trustless milestone payments, decentralized investor governance, and automated AI dispute resolution.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1020",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
