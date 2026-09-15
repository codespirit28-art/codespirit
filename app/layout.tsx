import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  metadataBase: new URL("https://codespirit-blue.vercel.app"),

  title: {
    default: "CodeSpirit – Learn Coding Freely in a Game World",
    template: "%s | CodeSpirit",
  },

  description:
    "CodeSpirit is a free coding learning platform where you can learn programming through tutorials, quizzes, coding challenges, and a game-like learning experience.",

  keywords: [
    "CodeSpirit",
    "learn coding online",
    "learn programming for free",
    "free coding courses",
    "coding practice",
    "programming tutorials",
    "coding quizzes",
    "coding challenges",
    "learn Java",
    "Java programming tutorial",
    "Java for beginners",
  ],

  authors: [
    {
      name: "CodeSpirit",
    },
  ],

  creator: "CodeSpirit",
  publisher: "CodeSpirit",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://codespirit-blue.vercel.app/",
    siteName: "CodeSpirit",
    title: "CodeSpirit – Learn Coding Freely in a Game World",
    description:
      "Learn programming freely with tutorials, quizzes, coding challenges, and a game-like learning experience.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CodeSpirit – Learn Coding Freely in a Game World",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "CodeSpirit – Learn Coding Freely in a Game World",
    description:
      "Learn programming freely with tutorials, quizzes, and coding challenges.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Google AdSense */}
        <meta
          name="google-adsense-account"
          content="ca-pub-3046355403693736"
        />

        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />

        {/* Material Symbols */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />

        {/* Inter + JetBrains Mono */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;450;600&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>{children}</body>
    </html>
  );
}
