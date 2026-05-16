import type { Settings } from '@/types';

const STORAGE_KEY = 'ytpex-settings';

export const DEFAULT_SETTINGS: Settings = {
  tabTitle: 'YtPex',
  favicon: 'default',
  autoCloak: false,
  panicKey: true,
  hqAudio: true,
  embedMeta: true,
  autoplay: false,
  reducedMotion: false,
};

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

const FAVICON_SVG: Record<string, string> = {
  docs: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="%234285f4"/><rect x="8" y="9" width="16" height="2" rx="1" fill="white"/><rect x="8" y="14" width="16" height="2" rx="1" fill="white"/><rect x="8" y="19" width="10" height="2" rx="1" fill="white"/></svg>`,
  sheets: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="%230f9d58"/><rect x="5" y="7" width="22" height="18" rx="1" fill="white" opacity="0.9"/><line x1="5" y1="13" x2="27" y2="13" stroke="%230f9d58" stroke-width="1"/><line x1="5" y1="19" x2="27" y2="19" stroke="%230f9d58" stroke-width="1"/><line x1="13" y1="7" x2="13" y2="25" stroke="%230f9d58" stroke-width="1"/></svg>`,
  mail: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="%23ea4335"/><rect x="4" y="8" width="24" height="16" rx="2" fill="white"/><polyline points="4,8 16,18 28,8" fill="none" stroke="%23ea4335" stroke-width="2"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="%231a73e8"/><rect x="4" y="6" width="24" height="20" rx="2" fill="white"/><rect x="4" y="6" width="24" height="9" fill="%231a73e8"/><rect x="9" y="3" width="3" height="6" rx="1.5" fill="%23ea4335"/><rect x="20" y="3" width="3" height="6" rx="1.5" fill="%23ea4335"/><text x="16" y="24" text-anchor="middle" font-family="Arial" font-size="9" font-weight="bold" fill="%231a73e8">16</text></svg>`,
  default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="%23ff0000"/><polygon points="13,10 13,22 22,16" fill="white"/></svg>`,
};

export function applyFavicon(type: string): void {
  if (typeof document === 'undefined') return;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  const svg = FAVICON_SVG[type] || FAVICON_SVG.default;
  link.href = `data:image/svg+xml,${svg}`;
}
