import type { Metadata } from "next";
import { sitePath } from "./site";

export const SITE_ORIGIN = "https://ryarcanvas.online";
export const SITE_NAME = "RYAR Gaming";
export const SITE_DESCRIPTION =
  "Gaming news, video game updates, reviews and guides across PlayStation, Xbox, Nintendo and PC from RYAR Gaming.";
export const LOGO_PATH = "/images/ryarcanvas-logo.webp";

function trailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

export function canonicalUrl(path: string): string {
  return new URL(trailingSlash(sitePath(path)), SITE_ORIGIN).toString();
}

export function assetUrl(path: string): string {
  return new URL(sitePath(path), SITE_ORIGIN).toString();
}

function cleanDescription(description: string): string {
  const clean = description.replace(/\s+/g, " ").trim();
  return clean.length > 160 ? `${clean.slice(0, 157).trimEnd()}…` : clean;
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  robots?: Metadata["robots"];
};

export function pageMetadata({
  title,
  description,
  path,
  image = LOGO_PATH,
  keywords,
  type = "website",
  publishedTime,
  robots,
}: PageMetadataOptions): Metadata {
  const summary = cleanDescription(description || SITE_DESCRIPTION);
  const canonical = canonicalUrl(path);
  const socialImage = assetUrl(image);

  return {
    title,
    description: summary,
    alternates: { canonical },
    ...(keywords?.length ? { keywords } : {}),
    ...(robots ? { robots } : {}),
    openGraph: {
      type,
      title,
      description: summary,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_US",
      images: [{ url: socialImage, alt: title }],
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: summary,
      images: [socialImage],
    },
  };
}
