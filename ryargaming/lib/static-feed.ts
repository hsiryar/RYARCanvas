import type { FeedArticle } from "@/lib/types";
import { sitePath } from "@/lib/site";

export type FeedIndex = {
  generated: string;
  total: number;
  articles: FeedArticle[];
};

let feedRequest: Promise<FeedIndex> | null = null;

export function loadStaticFeed(): Promise<FeedIndex> {
  if (!feedRequest) {
    feedRequest = fetch(sitePath("/data/feed.json"), { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<FeedIndex>;
      })
      .catch((error: unknown) => {
        feedRequest = null;
        throw error;
      });
  }
  return feedRequest;
}
