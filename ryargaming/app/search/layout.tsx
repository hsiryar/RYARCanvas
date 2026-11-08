import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Search — RYAR Gaming",
  description: "Search gaming news, guides, reviews and archive coverage from RYAR Gaming.",
  path: "/search",
  robots: { index: false, follow: true },
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
