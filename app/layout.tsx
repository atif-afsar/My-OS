import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import PwaRegister from "@/components/common/PwaRegister";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyOS - Personal Operating System",
  description: "A minimal, personal operating system designed to bring clarity to daily life.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MyOS",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <PwaRegister />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
