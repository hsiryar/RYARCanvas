import Link from "next/link";
import { allGames, topGames } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { sitePath } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Games index — RYAR Gaming",
  description: "Browse game hubs for news, guides, reviews and coverage in the RYAR Gaming archive.",
  path: "/games",
});

const LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

function letterFor(name: string): string {
  const first = name.replace(/^the\s+/i, "").charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
}

function sectionId(letter: string): string {
  return letter === "#" ? "games-other" : `games-${letter.toLowerCase()}`;
}

export default function GamesPage() {
  const games = allGames().filter((game) => game.count >= 2);
  const featured = topGames(18).filter((game) => game.count >= 2);
  const groups = LETTERS.map((letter) => ({
    letter,
    items: games.filter((game) => letterFor(game.name) === letter),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><span>Games</span>
      </nav>
      <header className="page-head">
        <div className="eyebrow">Index</div>
        <h1>Games</h1>
        <p>{games.length.toLocaleString()} game hubs with multiple stories from the archive.</p>
      </header>

      <nav className="letterbar" aria-label="Jump to games by first letter">
        {groups.map(({ letter }) => (
          <a key={letter} href={`#${sectionId(letter)}`}>{letter}</a>
        ))}
      </nav>

      <section className="section">
        <div className="section-head"><h2>Most covered games</h2></div>
        <div className="grid games">
          {featured.map((game) => (
            <a key={game.slug} className="gamecard" href={sitePath(`/g/${game.slug}/`)}>
              <span className="gname">{game.name}</span>
              <span className="gmeta">{game.count.toLocaleString()} stories</span>
            </a>
          ))}
        </div>
      </section>

      {groups.map(({ letter, items }) => (
        <section className="section game-index-section" id={sectionId(letter)} key={letter}>
          <div className="section-head"><h2>{letter === "#" ? "0–9 and symbols" : letter}</h2></div>
          <div className="grid games">
            {items.map((game) => (
              <a key={game.slug} className="gamecard" href={sitePath(`/g/${game.slug}/`)}>
                <span className="gname">{game.name}</span>
                <span className="gmeta">{game.count.toLocaleString()} stories{game.avg != null ? ` · ${game.avg}/10 avg. review` : ""}</span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
