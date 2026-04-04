import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SENTINEL - Command Center Polda NTT",
  description:
    "Sistem Live Tracking dan AI-Powered Command Center untuk Biro Operasi Polda NTT",
  keywords: ["Polda NTT", "Command Center", "Live Tracking", "SENTINEL"],
  applicationName: "SENTINEL",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SENTINEL",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1B32",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
