import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "LifeOS AI — The Intelligent Operating System For Your Life",
    template: "%s | LifeOS AI",
  },
  description:
    "LifeOS AI is an AI-powered personal operating system that helps you organize every aspect of your life from one intelligent dashboard. AI Planner, Smart Calendar, Notes, Goals, Habits, Finance, Health & more.",
  keywords: [
    "lifeOS",
    "AI",
    "personal assistant",
    "productivity",
    "planner",
    "calendar",
    "goals",
    "habits",
    "notes",
    "finance tracker",
    "health tracker",
  ],
  authors: [{ name: "LifeOS AI" }],
  creator: "LifeOS AI",
  metadataBase: new URL(process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "LifeOS AI",
    title: "LifeOS AI — The Intelligent Operating System For Your Life",
    description:
      "Organize every aspect of your life from one intelligent dashboard powered by AI.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeOS AI",
    description:
      "The Intelligent Operating System For Your Life",
    creator: "@lifeosai",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${GeistSans.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
