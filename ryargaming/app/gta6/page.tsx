import Link from "next/link";
import Card from "@/components/Card";
import InfiniteFeed from "@/components/InfiniteFeed";
import { feedSlice, fmtDate, gta6Stats } from "@/lib/data";

export const metadata = {
  title: "GTA VI — every story, guide and screenshot — RYAR Gaming",
  description:
    "All of RYAR Gaming's Grand Theft Auto VI coverage: news, guides, leaks confirmed and denied, and every screenshot drop.",
};

export default function Gta6Page() {
  const s = gta6Stats();
  const feed = feedSlice({ collection: "gta6" }, 0, 12);
  const [lead, ...rest] = feed.items;
  const guides = s.items.filter((a) => a.subtype === "guide").slice(0, 4);
  const galleries = s.items.filter((a) => a.kind === "gallery" || a.image_count >= 4).slice(0, 4);

  return (
    <div className="wrap">
      <nav className="crumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>GTA VI</span>
      </nav>

      <header className="page-head">
        <div className="eyebrow">Spotlight</div>
        <h1>GTA VI</h1>
        <p>
          {s.total.toLocaleString()} stories tracking Grand Theft Auto VI — from the first trailer to
          launch-day guides.
        </p>
        <div className="headline-stats">
          <div>
            <b>{s.total}</b>stories
          </div>
          <div>
            <b>{s.guides}</b>guides
          </div>
          <div>
            <b>{s.galleries}</b>image dumps
          </div>
          <div>
            <b>{s.latest ? fmtDate(s.latest) : "—"}</b>latest story
          </div>
        </div>
      </header>

      {lead && (
        <section className="section" style={{ marginTop: 26 }}>
          <div className="section-head">
            <h2>Latest</h2>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              {s.oldest ? `coverage since ${fmtDate(s.oldest)}` : ""}
            </span>
          </div>
          <div className="grid">
            <Card a={lead} />
            {rest.slice(0, 5).map((a) => (
              <Card key={a.slug} a={a} />
            ))}
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>GTA VI guides</h2>
            <Link className="more" href="/c/guide">
              All guides
            </Link>
          </div>
          <div className="grid tight">
            {guides.map((a) => (
              <Card key={a.slug} a={a} tight />
            ))}
          </div>
        </section>
      )}

      {galleries.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Screenshots &amp; galleries</h2>
            <Link className="more" href="/c/gallery">
              All galleries
            </Link>
          </div>
          <div className="grid tight">
            {galleries.map((a) => (
              <Card key={a.slug} a={a} tight />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Every GTA VI story</h2>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{feed.total} in total</span>
        </div>
        <InfiniteFeed initial={feed.items} total={feed.total} collection="gta6" perPage={12} />
      </section>
    </div>
  );
}
