import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: {
    default: "BookShare",
    template: "%s | BookShare",
  },
  description: "책 리뷰 공유 사이트",
  manifest: "/manifest.json",
  applicationName: "BookShare",
  keywords: ["책", "리뷰", "도서", "독서", "bookshare"],
  authors: [{ name: "Bookshare Team" }],
  creator: "Bookshare",
  publisher: "Bookshare",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BookShare",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BookShare" />
        <Script
          type="module"
          src="https://cdn.jsdelivr.net/npm/minidenticons@4.2.0/minidenticons.min.js"
          strategy="beforeInteractive"
          integrity="sha384-A8FsxkwjpsLEaYTk9x/3iKkID7jHsAtEWY3bt0ufPUtfsgI1xFvOqothGa6S5QKL"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <Providers>
          <header>
            <Header />
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
