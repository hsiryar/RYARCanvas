import Link from "next/link";
import { allTags } from "@/lib/data";

export const metadata = { title: "All topics — RYAR Gaming" };

export default function TopicsPage() {
  const tags = allTags();
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
        <h1>All topics</h1>
        <p>{tags.length.toLocaleString()} topics across the archive — platforms, games, studios, events.</p>
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
