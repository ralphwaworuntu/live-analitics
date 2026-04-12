import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWAProvider from "@/components/pwa/PWAProvider";
import HydrationGuard from "@/components/shared/HydrationGuard";

export const metadata: Metadata = {
  title: "SENTINEL - Command Center Pvt Ltd NTT",
  description:
    "Sistem Live Tracking dan AI-Powered Command Center untuk Biro Operasi Pvt Ltd NTT",
  keywords: ["Pvt Ltd NTT", "Command Center", "Live Tracking", "SENTINEL"],
  applicationName: "SENTINEL",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
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
    <html lang="id" className="h-full bg-[#07111F]">
      <body className="min-h-full h-full max-h-[100dvh] overflow-hidden">
        <HydrationGuard>
          <PWAProvider>
            {children}
          </PWAProvider>
        </HydrationGuard>
      </body>
    </html>
  );
}
