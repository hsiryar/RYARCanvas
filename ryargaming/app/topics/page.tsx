import Link from "next/link";
import { allTags } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Gaming topics — RYAR Gaming",
  description: "Browse recurring games, franchises and subjects covered by RYAR Gaming.",
  path: "/topics",
});

export default function TopicsPage() {
  const tags = allTags().filter((tag) => tag.count >= 2);
  const groups = [
    { label: "Most covered", items: tags.slice(0, 24) },
    { label: "Everything else", items: tags.slice(24) },
  ];

  return (
    <div className="wrap">
      <nav className="crumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Topics</span>
      </nav>

      <header className="page-head">
        <div className="eyebrow">Index</div>
        <h1>Gaming topics</h1>
        <p>{tags.length.toLocaleString()} topics with multiple stories across the archive — platforms, games, studios and events.</p>
      </header>

      {groups.map((g) => (
        <section className="section" key={g.label}>
          <div className="section-head">
            <h2>{g.label}</h2>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{g.items.length} topics</span>
          </div>
          <div className="tagrow" style={{ borderTop: 0, margin: 0, paddingTop: 0 }}>
            {g.items.map((t) => (
              <Link key={t.slug} className="tag" href={`/t/${t.slug}`}>
                {t.tag} <span style={{ color: "var(--muted)" }}>{t.count}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
