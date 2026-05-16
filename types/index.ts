export interface VideoResult {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string;
  description: string;
  isShort?: boolean;
}

export interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      maxres?: { url: string };
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
    publishedAt: string;
    description: string;
  };
}

export interface SearchResponse {
  items?: YouTubeSearchItem[];
  nextPageToken?: string;
  pageInfo?: { totalResults: number };
  error?: { message: string };
}

export interface Settings {
  tabTitle: string;
  favicon: string;
  autoCloak: boolean;
  panicKey: boolean;
  hqAudio: boolean;
  embedMeta: boolean;
  autoplay: boolean;
  reducedMotion: boolean;
}

export type AppMode = 'videos' | 'shorts';
