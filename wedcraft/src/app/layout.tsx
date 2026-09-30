import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./components/AppShell";

export const metadata: Metadata = {
  title: "WedCraft — AI-Powered Wedding Planning & Wedding Websites",
  description:
    "WedCraft is an AI-powered wedding planning platform with checklist timeline, budget manager, seating chart, and customizable wedding websites with RSVP tracking.",
  keywords: [
    "wedding planning",
    "wedding planner",
    "AI wedding assistant",
    "wedding checklist",
    "wedding budget",
    "wedding seating chart",
    "guest list",
    "WedCraft",
  ],
  openGraph: {
    title: "WedCraft — AI-Powered Wedding Planning",
    description: "Checklist timeline, budget tracking, seating chart, and custom wedding websites with instant RSVP.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
