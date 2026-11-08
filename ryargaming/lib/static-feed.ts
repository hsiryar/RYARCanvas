import type { FeedArticle, FeedCard } from "@/lib/types";
import { sitePath } from "@/lib/site";

export type FeedIndex = {
  generated: string;
  total: number;
  articles: FeedArticle[];
};

export type FeedManifest = {
  total: number;
  chunkSize: number;
  chunkCount: number;
};

export type FeedChunk = {
  start: number;
  articles: FeedCard[];
};

let feedRequest: Promise<FeedIndex> | null = null;
let manifestRequest: Promise<FeedManifest> | null = null;
const chunkRequests = new Map<number, Promise<FeedChunk>>();

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, { cache: "force-cache", signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return (await response.json()) as T;
  } catch (error) {
    if (controller.signal.aborted) throw new Error("Request timed out after 20 seconds.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function loadStaticFeed(): Promise<FeedIndex> {
  if (!feedRequest) {
    feedRequest = fetchJson<FeedIndex>(sitePath("/data/feed.json")).catch((error: unknown) => {
      feedRequest = null;
      throw error;
    });
  }
  return feedRequest;
}

export function loadFeedManifest(): Promise<FeedManifest> {
  if (!manifestRequest) {
    manifestRequest = fetchJson<FeedManifest>(sitePath("/data/feed-manifest.json")).catch((error: unknown) => {
      manifestRequest = null;
      throw error;
    });
  }
  return manifestRequest;
}

export function loadStaticFeedChunk(index: number): Promise<FeedChunk> {
  const cached = chunkRequests.get(index);
  if (cached) return cached;

  const filename = String(index).padStart(3, "0");
  const request = fetchJson<FeedChunk>(sitePath(`/data/feed-chunks/${filename}.json`)).catch((error: unknown) => {
    chunkRequests.delete(index);
    throw error;
  });

  chunkRequests.set(index, request);
  return request;
}
