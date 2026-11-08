import Link from "next/link";
import { notFound } from "next/navigation";
import InfiniteFeed from "@/components/InfiniteFeed";
import { allTags, feedSlice, relatedTags, tagBySlug } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return allTags().map((entry) => ({ tag: entry.slug }));
}

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props) {
  const { tag } = await params;
  const entry = tagBySlug(tag);
  if (!entry) {
    return pageMetadata({
      title: "Topic not found — RYAR Gaming",
      description: "This topic is not available in the RYAR Gaming archive.",
      path: `/t/${tag}`,
      robots: { index: false, follow: false },
    });
  }
  return pageMetadata({
    title: `${entry.tag} — RYAR Gaming`,
    description: `${entry.count} stories tagged ${entry.tag}.`,
    path: `/t/${tag}`,
    robots: entry.count < 2 ? { index: false, follow: true } : undefined,
  });
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const entry = tagBySlug(tag);
  if (!entry) notFound();

  const { items, total, cursor } = feedSlice({ tag: entry.slug }, 0, 12);
  const related = relatedTags(entry.tag, 12);

  return (
    <div className="wrap">
      <nav className="crumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/topics">Topics</Link>
        <span>/</span>
        <span>{entry.tag}</span>
      </nav>

      <header className="page-head">
        <div className="eyebrow">Topic</div>
        <h1>{entry.tag}</h1>
        <p>
          {entry.count.toLocaleString()} {entry.count === 1 ? "story" : "stories"} tagged “{entry.tag}”.
        </p>
        {related.length > 0 && (
          <div className="tagrow" style={{ borderTop: 0, margin: "18px 0 0", paddingTop: 0 }}>
            {related.map((r) => (
              <Link key={r.slug} className="tag" href={`/t/${r.slug}`}>
                {r.tag}
                {r.count ? <span style={{ color: "var(--muted)" }}> {r.count}</span> : null}
              </Link>
            ))}
          </div>
        )}
      </header>

      <section className="section" style={{ marginTop: 22 }}>
        <InfiniteFeed key={entry.slug} initial={items} total={total} cursor={cursor} tag={entry.slug} perPage={12} />
      </section>
    </div>
  );
}
