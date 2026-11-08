import Link from "next/link";
import { notFound } from "next/navigation";
import InfiniteFeed from "@/components/InfiniteFeed";
import { KINDS, feedSlice } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ kind: string }> };

const VALID = KINDS.map((k) => k.id) as string[];

export const dynamicParams = false;

export function generateStaticParams() {
  return VALID.map((kind) => ({ kind }));
}

const COPY: Record<string, { h1: string; sub: string }> = {
  all: { h1: "Everything", sub: "Every story in the RYAR Gaming archive" },
  news: { h1: "News", sub: "What's happening in games right now" },
  guide: { h1: "Guides", sub: "How-tos, walkthroughs and tips" },
  review: { h1: "Reviews", sub: "Scored verdicts, pros and cons" },
  gallery: { h1: "Galleries", sub: "Screenshot dumps and image collections" },
  deals: { h1: "Deals", sub: "Discounts worth your money" },
  trending: { h1: "Trending", sub: "The stories everyone is reading today" },
};

export async function generateMetadata({ params }: Props) {
  const { kind } = await params;
  const c = COPY[kind];
  if (!c) {
    return pageMetadata({
      title: "Category not found — RYAR Gaming",
      description: "This category is not available in the RYAR Gaming archive.",
      path: `/c/${kind}`,
      robots: { index: false, follow: false },
    });
  }
  return pageMetadata({
    title: `${c.h1} — RYAR Gaming`,
    description: c.sub,
    path: `/c/${kind}`,
    robots: kind === "all" ? { index: false, follow: true } : undefined,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { kind } = await params;
  if (!VALID.includes(kind)) notFound();

  const { items, total, cursor } = feedSlice({ kind: kind as (typeof KINDS)[number]["id"] }, 0, 24);
  const copy = COPY[kind] ?? COPY.all;

  return (
    <div className="wrap">
      <div className="chips" style={{ paddingTop: 22 }}>
        {KINDS.map((k) => (
          <Link key={k.id} href={`/c/${k.id}`} className={`chip${k.id === kind ? " on" : ""}`}>
            {k.label}
          </Link>
        ))}
      </div>

      <section className="section" style={{ marginTop: 14 }}>
        <div className="section-head">
          <h2 style={{ fontSize: 26, letterSpacing: "-0.5px" }}>{copy.h1}</h2>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{total.toLocaleString()} stories</span>
        </div>
        <p style={{ margin: "-8px 0 22px", color: "var(--muted)", fontSize: 14 }}>{copy.sub}</p>

        {items.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>Nothing here yet.</p>
        ) : (
          <InfiniteFeed key={kind} initial={items} total={total} cursor={cursor} kind={kind} perPage={24} />
        )}
      </section>
    </div>
  );
}
