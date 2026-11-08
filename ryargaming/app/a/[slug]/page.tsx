import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import Card from "@/components/Card";
import { bySlug, fmtDate, related, slugify, store, type Block } from "@/lib/data";
import { sitePath } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return store().articles.map((article) => ({ slug: article.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const a = bySlug(slug);
  if (!a) {
    return pageMetadata({
      title: "Story not found — RYAR Gaming",
      description: "This story is not available in the RYAR Gaming archive.",
      path: `/a/${slug}`,
      robots: { index: false, follow: false },
    });
  }
  return pageMetadata({
    title: `${a.title} — RYAR Gaming`,
    description: a.dek || a.excerpt,
    path: `/a/${slug}`,
    image: a.image ?? undefined,
    type: "article",
    publishedTime: a.published_at,
  });
}

function findBalancedEnd(text: string, start: number, opening: string, closing: string): number {
  if (text[start] !== opening) return -1;
  let depth = 0;
  let escaped = false;
  for (let i = start; i < text.length; i += 1) {
    const char = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === opening) depth += 1;
    else if (char === closing) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function renderInline(text: string, allowLinks = true): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  let plain = "";

  const flushText = () => {
    if (plain) nodes.push(plain);
    plain = "";
  };
  const pushElement = (element: React.ReactNode) => {
    flushText();
    nodes.push(<Fragment key={key++}>{element}</Fragment>);
  };

  while (cursor < text.length) {
    if (text.startsWith("**", cursor)) {
      const end = text.indexOf("**", cursor + 2);
      if (end > cursor + 2) {
        pushElement(<strong>{renderInline(text.slice(cursor + 2, end), allowLinks)}</strong>);
        cursor = end + 2;
        continue;
      }
    }
    if (text[cursor] === "*") {
      const end = text.indexOf("*", cursor + 1);
      if (end > cursor + 1 && !text.startsWith("**", end)) {
        pushElement(<em>{renderInline(text.slice(cursor + 1, end), allowLinks)}</em>);
        cursor = end + 1;
        continue;
      }
    }
    if (text[cursor] === "`") {
      const end = text.indexOf("`", cursor + 1);
      if (end > cursor + 1) {
        pushElement(<code>{text.slice(cursor + 1, end)}</code>);
        cursor = end + 1;
        continue;
      }
    }
    if (allowLinks && text[cursor] === "[") {
      const labelEnd = findBalancedEnd(text, cursor, "[", "]");
      if (labelEnd >= 0 && text[labelEnd + 1] === "(") {
        const hrefEnd = findBalancedEnd(text, labelEnd + 1, "(", ")");
        if (hrefEnd >= 0) {
          const label = text.slice(cursor + 1, labelEnd);
          const href = text.slice(labelEnd + 2, hrefEnd).trim().split(/\s+/, 1)[0];
          if (href.startsWith("/")) {
            pushElement(<a href={sitePath(href)}>{renderInline(label, false)}</a>);
          } else if (href.startsWith("#")) {
            pushElement(<a href={href}>{renderInline(label, false)}</a>);
          } else if (/^https?:\/\//i.test(href)) {
            pushElement(
              <a href={href} target="_blank" rel="noopener noreferrer nofollow">
                {renderInline(label, false)}
              </a>,
            );
          } else if (/^(mailto|tel):/i.test(href)) {
            pushElement(<a href={href}>{renderInline(label, false)}</a>);
          } else {
            plain += label;
          }
          cursor = hrefEnd + 1;
          continue;
        }
      }
    }
    plain += text[cursor];
    cursor += 1;
  }

  flushText();
  return nodes;
}

function InlineMarkdown({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}

function Prose({ blocks }: { blocks: Block[] }) {
  const out: React.ReactNode[] = [];
  let lis: string[] = [];

  const flush = (key: string) => {
    if (lis.length) {
      out.push(
        <ul key={key}>
          {lis.map((t, i) => (
            <li key={i}><InlineMarkdown text={t} /></li>
          ))}
        </ul>,
      );
      lis = [];
    }
  };

  blocks.forEach((b, i) => {
    if (b.t === "li") {
      lis.push(b.x);
      return;
    }
    flush(`ul-${i}`);
    if (b.t === "h2") out.push(<h2 key={i}><InlineMarkdown text={b.x} /></h2>);
    else if (b.t === "h3" || b.t === "h4") out.push(<h3 key={i}><InlineMarkdown text={b.x} /></h3>);
    else if (b.t === "blockquote") out.push(<blockquote key={i}><InlineMarkdown text={b.x} /></blockquote>);
    else if (b.t === "caption") out.push(<p className="caption" key={i}><InlineMarkdown text={b.x} /></p>);
    else out.push(<p key={i}><InlineMarkdown text={b.x} /></p>);
  });
  flush("ul-end");
  return <div className="prose">{out}</div>;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = bySlug(slug);
  if (!a) notFound();

  const more = related(a, 3);
  const kindLabel =
    a.kind === "review" ? "Reviews" : a.kind === "gallery" ? "Galleries" : a.subtype === "guide" ? "Guides" : "News";
  const kindHref = a.kind === "review" ? "/c/review" : a.kind === "gallery" ? "/c/gallery" : a.subtype === "guide" ? "/c/guide" : "/c/news";

  return (
    <div className="wrap">
      <nav className="crumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={kindHref}>{kindLabel}</Link>
        {a.section ? (
          <>
            <span>/</span>
            <span>{a.section}</span>
          </>
        ) : null}
      </nav>

      <article className="article">
        <div className="kicker">
          <span
            className={`badge ${
              a.subtype === "deals" ? "deals" : a.subtype === "guide" ? "guide" : a.kind
            }`}
          >
            {a.subtype === "deals" ? "deal" : a.subtype === "guide" ? "guide" : a.kind}
          </span>
          {a.trending && <span className="badge hot">Trending</span>}
          {a.has_video && <span className="badge news">Video inside</span>}
        </div>

        <h1>{a.title}</h1>
        {a.dek && <p className="lede">{a.dek}</p>}

        <div className="byline">
          <div className="who">RYAR Gaming archive</div>
          <div className="when">
            {fmtDate(a.published_at)} · {a.reading_minutes} min read · {a.word_count.toLocaleString()} words
          </div>
        </div>

        {a.image && (
          <figure className="hero-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sitePath(a.image)}
              alt={a.title}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </figure>
        )}

        {a.review?.rating != null && (
          <div className="verdict">
            <div>
              <div className="num">
                {a.review.rating}
                <small>/10</small>
              </div>
              <div className="which">{a.review.verdict ?? "Verdict"}</div>
              {a.review.game && (
                <div style={{ fontSize: 13, color: "#5f6368", marginTop: 6 }}>{a.review.game}</div>
              )}
            </div>
            <div className="pc">
              {a.review.pros.length > 0 && (
                <div>
                  <h4>The good</h4>
                  <ul>
                    {a.review.pros.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {a.review.cons.length > 0 && (
                <div>
                  <h4>The bad</h4>
                  <ul>
                    {a.review.cons.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <Prose blocks={a.blocks.length ? a.blocks : [{ t: "p", x: a.body_text }]} />

        {a.tags.length > 0 && (
          <div className="tagrow">
            {a.tags.slice(0, 14).map((t) => (
              <Link key={t} className="tag" href={`/t/${slugify(t)}`}>
                {t}
              </Link>
            ))}
          </div>
        )}

        {more.length > 0 && (
          <section className="section">
            <div className="section-head">
              <h2>More on {a.tags[0] ?? a.section ?? "this"}</h2>
              {a.tags[0] && (
                <Link className="more" href={`/t/${slugify(a.tags[0])}`}>
                  All {a.tags[0]}
                </Link>
              )}
            </div>
            <div className="grid tight">
              {more.map((m) => (
                <Card key={m.slug} a={m} tight />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
