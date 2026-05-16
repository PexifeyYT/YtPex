import type { VideoResult, YouTubeSearchItem, SearchResponse } from '@/types';

function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(parseInt(code, 10)));
}

function mapItem(item: YouTubeSearchItem): VideoResult {
  const t = item.snippet.thumbnails;
  return {
    id: item.id.videoId,
    title: decodeHtml(item.snippet.title),
    channelTitle: item.snippet.channelTitle,
    thumbnail: t.maxres?.url || t.high?.url || t.medium?.url || t.default?.url || '',
    publishedAt: item.snippet.publishedAt,
    description: item.snippet.description,
  };
}

export async function searchVideos(
  q: string,
  pageToken?: string
): Promise<{ items: VideoResult[]; nextPageToken?: string }> {
  const params = new URLSearchParams({ q });
  if (pageToken) params.set('pageToken', pageToken);
  const res = await fetch(`/api/search?${params}`);
  const data: SearchResponse = await res.json();
  return {
    items: (data.items || []).map(mapItem),
    nextPageToken: data.nextPageToken,
  };
}

export async function searchShorts(
  q: string,
  pageToken?: string
): Promise<{ items: VideoResult[]; nextPageToken?: string }> {
  const params = new URLSearchParams({ q, mode: 'shorts' });
  if (pageToken) params.set('pageToken', pageToken);
  const res = await fetch(`/api/search?${params}`);
  const data: SearchResponse = await res.json();
  return {
    items: (data.items || []).map(i => ({ ...mapItem(i), isShort: true })),
    nextPageToken: data.nextPageToken,
  };
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /[?&]v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
    /youtube\.com\/shorts\/([^?&#]+)/,
    /youtube\.com\/v\/([^?&#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.trim().match(p);
    if (m) return m[1];
  }
  return null;
}
