import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import BrandLogo from "@/components/BrandLogo";
import AnalyticsConsent from "@/components/AnalyticsConsent";
import StructuredData from "@/components/StructuredData";
import { assetUrl, canonicalUrl, LOGO_PATH, SITE_DESCRIPTION, SITE_NAME, SITE_ORIGIN } from "@/lib/seo";
import "./globals.css";

const DEFAULT_TITLE = "RYAR Gaming — gaming news, guides & reviews";
const DEFAULT_URL = canonicalUrl("/");
const LOGO_URL = assetUrl(LOGO_PATH);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  applicationName: SITE_NAME,
  title: DEFAULT_TITLE,
  description: SITE_DESCRIPTION,
  icons: {
    icon: [{ url: LOGO_URL, type: "image/webp" }],
    shortcut: [{ url: LOGO_URL, type: "image/webp" }],
    apple: [{ url: LOGO_URL, type: "image/webp" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    url: DEFAULT_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    images: [{ url: LOGO_URL, alt: "RYAR Canvas logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    images: [LOGO_URL],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* set the theme before first paint to avoid a flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}})();`,
          }}
        />
        <StructuredData />
        <Suspense fallback={<header className="topbar" style={{ height: 68 }} />}>
          <TopBar />
        </Suspense>
        <main>{children}</main>
        <footer className="site">
          <div className="wrap">
            <div className="row" style={{ marginBottom: 10 }}>
              <BrandLogo />
              <Link href="/c/news">News</Link>
              <Link href="/c/guide">Guides</Link>
              <Link href="/c/review">Reviews</Link>
              <Link href="/c/gallery">Galleries</Link>
              <Link href="/c/deals">Deals</Link>
              <Link href="/gta6">GTA VI</Link>
              <Link href="/games">Games</Link>
              <Link href="/topics">Topics</Link>
              <Link href="/search">Search</Link>
              <button className="analytics-preferences" type="button" data-open-consent>
                Analytics preferences
              </button>
            </div>
            <p style={{ margin: 0, maxWidth: 720 }}>
              RYAR Gaming is the official gaming archive of RYAR Canvas. Archive ownership and
              publication permissions are managed by RYAR Gaming.
            </p>
            <p style={{ margin: "8px 0 0" }}><a href="/">Visit RYAR Canvas</a></p>
          </div>
        </footer>
        <Suspense fallback={null}>
          <AnalyticsConsent />
        </Suspense>
      </body>
    </html>
  );
}
