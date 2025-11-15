import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import GlobalErrorHandler from "@/components/GlobalErrorHandler";
import { QueryProviders } from "@/components/providers/QueryProviders";
import { PostHogProvider } from "@/components/tracking/PostHogProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Global from "@/components/Global";
import ModalWrapper from "@/components/modals/ModalWrapper";
import "./globals.css";
import { genPageMetadata } from "@/lib/seo/genPageMetadata";
import { siteMetadata } from "@/data/siteMetadata";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// Selecta is a commercial font. To use it:
// 1. Purchase and download Selecta font files
// 2. Place the font files (e.g., Selecta-Regular.woff2, Selecta-Bold.woff2) in /public/fonts/
// 3. Replace the Inter font below with localFont configuration pointing to your Selecta files
// For now, using Inter as a placeholder - update when Selecta font files are available
const selecta = Inter({
  variable: "--font-selecta",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = genPageMetadata({
  title: siteMetadata.title,
  description: siteMetadata.description,
  url: "/",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${selecta.variable} antialiased`}
      >
        <QueryProviders>
          <PostHogProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster position="bottom-center" />
            <GlobalErrorHandler />
            <Global />
            <ModalWrapper />
          </PostHogProvider>
        </QueryProviders>
      </body>
    </html>
  );
}
