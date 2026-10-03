import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { MotionProvider } from "@/components/animations";
import { RevealObserver } from "@/components/animations/reveal-observer";
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
    authors: [{ name: general.siteName, url: SITE_URL }],
    creator: general.siteName,
    publisher: general.siteName,
    formatDetection: { telephone: false },
    // No site-wide canonical or og:url: each page sets its own (see buildMetadata),
    // so a page that forgets one can't be canonicalised to the homepage.
    openGraph: {
      type: "website",
      siteName: general.siteName,
      locale: "en_US",
      title: seo.defaultTitle,
      description: seo.defaultDescription,
    },
    twitter: { card: "summary_large_image", title: seo.defaultTitle, description: seo.defaultDescription },
    verification: {
      ...(seo.googleVerification ? { google: seo.googleVerification } : {}),
      ...(seo.bingVerification ? { other: { "msvalidate.01": seo.bingVerification } } : {}),
    },
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
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WSFGCFJPEC"
          strategy="afterInteractive"
        />
        <Script id="google-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WSFGCFJPEC');
          `}
        </Script>

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PVM7Q3F7');
          `}
        </Script>

        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1495151632642019');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className="min-h-dvh bg-background antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PVM7Q3F7"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Meta Pixel (noscript) */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1495151632642019&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <MotionProvider>
          <ToastProvider>{children}</ToastProvider>
        </MotionProvider>
        <RevealObserver />
      </body>
    </html>
  );
}

