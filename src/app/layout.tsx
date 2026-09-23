import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { MotionProvider } from "@/components/animations";
import { ToastProvider } from "@/components/ui/toast";
import { getSiteSettings } from "@/lib/data/public";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const { seo, general } = settings;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seo.defaultTitle, template: seo.titleTemplate },
    description: seo.defaultDescription,
    applicationName: general.siteName,
    keywords: seo.keywords,
    authors: [{ name: general.siteName, url: SITE_URL }],
    creator: general.siteName,
    publisher: general.siteName,
    formatDetection: { telephone: false },
    openGraph: {
      type: "website",
      siteName: general.siteName,
      locale: "en_US",
      url: SITE_URL,
      title: seo.defaultTitle,
      description: seo.defaultDescription,
    },
    twitter: { card: "summary_large_image", title: seo.defaultTitle, description: seo.defaultDescription },
    alternates: { canonical: SITE_URL },
    ...(seo.googleVerification ? { verification: { google: seo.googleVerification } } : {}),
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#060b13" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-background antialiased">
        <MotionProvider>
          <ToastProvider>{children}</ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
