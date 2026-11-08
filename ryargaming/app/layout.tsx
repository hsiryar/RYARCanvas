import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import AnalyticsConsent from "@/components/AnalyticsConsent";
import { generatedAt } from "@/lib/data";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ryarcanvas.online"),
  title: "RYAR Gaming — gaming news, guides & reviews",
  description:
    "RYAR Gaming: a searchable archive of video-game news, guides, reviews, deals and galleries.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const refreshed = generatedAt();
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* set the theme before first paint to avoid a flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}})();`,
          }}
        />
        <Suspense fallback={<header className="topbar" style={{ height: 68 }} />}>
          <TopBar />
        </Suspense>
        <main>{children}</main>
        <footer className="site">
          <div className="wrap">
            <div className="row" style={{ marginBottom: 10 }}>
              <Link href="/" className="logo" style={{ fontSize: 17 }}>
                <span className="l1">ryar</span>
                <span className="l2">gaming</span>
              </Link>
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
            <p style={{ margin: "0 0 6px" }}>
              Archive snapshot · source data collected {refreshed.slice(0, 16).replace("T", " ")} UTC
            </p>
            <p style={{ margin: 0, maxWidth: 720 }}>
              RYAR Gaming is a reader archive. Article text and imagery remain the property of their
              original publishers and authors; visit each original source for the canonical story.
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
