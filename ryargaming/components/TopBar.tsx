"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { BASE_PATH, sitePath } from "@/lib/site";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/c/news", label: "News" },
  { href: "/gta6", label: "GTA VI" },
  { href: "/c/guide", label: "Guides" },
  { href: "/c/review", label: "Reviews" },
  { href: "/c/gallery", label: "Galleries" },
  { href: "/c/deals", label: "Deals" },
  { href: "/games", label: "Games" },
  { href: "/topics", label: "Topics" },
];

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const activePath = pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) || "/" : pathname;
  const [q, setQ] = useState(params.get("q") ?? "");

  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <Link href="/" className="logo" aria-label="RYAR Gaming home">
          <span className="l1">ryar</span>
          <span className="l2">gaming</span>
          <span className="logo-dots" aria-hidden="true">
            <i /> <i /> <i /> <i />
          </span>
        </Link>

        <nav className="nav" aria-label="Gaming archive navigation">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={activePath === item.href ? "active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          className="topbar-search"
          action={sitePath("/search")}
          onSubmit={(event) => {
            event.preventDefault();
            router.push(`/search?q=${encodeURIComponent(q)}`);
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="#5f6368" strokeWidth="1.8" />
            <path d="M16 16l5 5" stroke="#5f6368" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search RYAR Gaming"
            aria-label="Search RYAR Gaming"
          />
          <button className="icon-btn" type="submit" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 4l-1.4 1.4L16.2 11H4v2h12.2l-5.6 5.6L12 20l8-8z" />
            </svg>
          </button>
        </form>
        <a className="canvas-link" href="/">RYAR Canvas</a>
        <ThemeToggle />
      </div>
    </header>
  );
}
