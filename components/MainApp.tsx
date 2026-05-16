'use client';
import { useState, useEffect, useCallback } from 'react';
import type { VideoResult, Settings, AppMode } from '@/types';
import { loadSettings, saveSettings, applyFavicon, DEFAULT_SETTINGS } from '@/lib/cloak';
import { searchVideos, searchShorts, extractVideoId } from '@/lib/youtube';
import BubbleField from './BubbleField';
import SearchBar from './SearchBar';
import PasteRow from './PasteRow';
import VideoGrid from './VideoGrid';
import Player from './Player';
import ShortsViewer from './ShortsViewer';
import SettingsModal from './SettingsModal';

export default function MainApp() {
  // ── URL hash ──────────────────────────────────────────────
  useEffect(() => {
    const ensureSuffix = () => {
      if (!window.location.search.includes('mountainbike')) {
        history.replaceState(null, '', '/?mountainbike');
      }
    };
    ensureSuffix();
    window.addEventListener('popstate', ensureSuffix);
    return () => window.removeEventListener('popstate', ensureSuffix);
  }, []);

  // ── Settings & cloak ──────────────────────────────────────
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettingsState(loadSettings());
  }, []);

  const setSettings = useCallback((s: Settings) => {
    setSettingsState(s);
    saveSettings(s);
    document.title = s.tabTitle || 'YtPex';
    applyFavicon(s.favicon);
  }, []);

  useEffect(() => {
    document.title = settings.tabTitle || 'YtPex';
    applyFavicon(settings.favicon);
  }, [settings.tabTitle, settings.favicon]);

  // Auto-cloak on blur
  useEffect(() => {
    if (!settings.autoCloak) return;
    const onBlur = () => { document.title = settings.tabTitle; };
    const onFocus = () => { document.title = settings.tabTitle; };
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => { window.removeEventListener('blur', onBlur); window.removeEventListener('focus', onFocus); };
  }, [settings.autoCloak, settings.tabTitle]);

  // Panic key
  useEffect(() => {
    if (!settings.panicKey) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === '`') setSettings({ ...settings, tabTitle: 'YtPex', favicon: 'default' });
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [settings, setSettings]);

  // ── App state ─────────────────────────────────────────────
  const [mode, setMode] = useState<AppMode>('videos');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VideoResult[]>([]);
  const [shorts, setShorts] = useState<VideoResult[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [shortsLoading, setShortsLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [shortsPageToken, setShortsPageToken] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  // ── Search ────────────────────────────────────────────────
  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setQuery(q);

    if (mode === 'shorts') {
      setShortsLoading(true);
      setShorts([]);
      try {
        const data = await searchShorts(q);
        setShorts(data.items);
        setShortsPageToken(data.nextPageToken);
      } catch {
        showToast('Search failed — check your API key in .env.local');
      } finally {
        setShortsLoading(false);
      }
    } else {
      setLoading(true);
      setSelectedVideo(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const raw = await res.json();
        if (raw._demo) setIsDemo(true);
        else setIsDemo(false);
        const data = await searchVideos(q);
        setResults(data.items);
        setNextPageToken(data.nextPageToken);
      } catch {
        showToast('Search failed — check your API key in .env.local');
      } finally {
        setLoading(false);
      }
    }
  }, [mode, showToast]);

  const loadMoreVideos = useCallback(async () => {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await searchVideos(query, nextPageToken);
      setResults(prev => [...prev, ...data.items]);
      setNextPageToken(data.nextPageToken);
    } catch {
      showToast('Could not load more — try again');
    } finally {
      setLoadingMore(false);
    }
  }, [query, nextPageToken, loadingMore, showToast]);

  const loadMoreShorts = useCallback(async () => {
    if (!query || !shortsPageToken || shortsLoading) return;
    setShortsLoading(true);
    try {
      const data = await searchShorts(query, shortsPageToken);
      setShorts(prev => [...prev, ...data.items]);
      setShortsPageToken(data.nextPageToken);
    } finally {
      setShortsLoading(false);
    }
  }, [query, shortsPageToken, shortsLoading]);

  // ── Paste link ────────────────────────────────────────────
  const handlePaste = useCallback((url: string) => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      showToast('Could not extract video ID from that URL');
      return;
    }
    setSelectedVideo({
      id: videoId,
      title: '',
      channelTitle: '',
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      publishedAt: '',
      description: '',
    });
    showToast('Link extracted — loading player');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }, [showToast]);

  // ── Downloads ─────────────────────────────────────────────
  const handleDownload = useCallback((videoId: string, fmt: 'mp4' | 'mp3') => {
    const a = document.createElement('a');
    a.href = `/api/download?videoId=${videoId}&format=${fmt}`;
    a.download = `${videoId}.${fmt}`;
    a.click();
    showToast(`${fmt.toUpperCase()} download started`);
  }, [showToast]);

  // ── Mode switch ───────────────────────────────────────────
  const switchMode = (m: AppMode) => {
    setMode(m);
    if (m === 'shorts' && query && !shorts.length) handleSearch(query);
  };

  return (
    <>
      <BubbleField accentHue={270} count={14} reduced={settings.reducedMotion}/>

      {/* SHORTS MODE — rendered at root so its fixed elements escape .app stacking context */}
      {mode === 'shorts' && (
        <ShortsViewer
          shorts={shorts}
          loading={shortsLoading}
          query={query}
          onLoadMore={loadMoreShorts}
          onSearch={handleSearch}
          onExitShorts={() => switchMode('videos')}
        />
      )}

      {/* VIDEO MODE */}
      {mode === 'videos' && (
      <div className="app">
        {/* TOP BAR */}
        <div className="topbar">
          <div className="brand">
            <div className="brand-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span>YtPex<span>liquid glass</span></span>
          </div>

          <div className="top-actions">
            <div className="mode-tabs">
              <button className={`mode-tab ${mode === 'videos' ? 'active' : ''}`} onClick={() => switchMode('videos')}>
                Videos
              </button>
              <button className="mode-tab" onClick={() => switchMode('shorts')}>
                Shorts
              </button>
            </div>

            <button className="pill-btn" onClick={() => setShowSettings(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Settings
            </button>
          </div>
        </div>

        {/* LED sign */}
        <div className="led-wrap">
          <div className="led-sign">
            <span className="led-dot"/>
            <span>made by p<span style={{ opacity: 0.4 }}>e</span>xif<span style={{ opacity: 0.25 }}>e</span>y</span>
          </div>
        </div>

        <SearchBar
          query={query}
          onSearch={handleSearch}
          placeholder="Search videos, paste a link, or describe a vibe…"
        />

        <PasteRow onPaste={handlePaste}/>

        {isDemo && (
          <div className="api-notice">
            ⚠ Running in demo mode — add <code>YOUTUBE_API_KEY</code> to <code>.env.local</code> for real results.
            Get a free key at <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>console.cloud.google.com</a> → YouTube Data API v3.
          </div>
        )}

        {selectedVideo && (
          <Player
            videoId={selectedVideo.id}
            title={selectedVideo.title}
            channelTitle={selectedVideo.channelTitle}
            publishedAt={selectedVideo.publishedAt}
            onClose={() => setSelectedVideo(null)}
            onDownload={fmt => handleDownload(selectedVideo.id, fmt)}
          />
        )}

        <VideoGrid
          results={results}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={!!nextPageToken}
          selectedId={selectedVideo?.id}
          query={query}
          onSelect={v => { setSelectedVideo(v); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50); }}
          onLoadMore={loadMoreVideos}
          isDemo={isDemo}
        />
      </div>
      )}

      {/* MODALS */}
      <SettingsModal
        open={showSettings}
        settings={settings}
        onSave={setSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* TOAST */}
      <div className={`toast ${toast ? 'show' : ''}`}>
        <span className="toast-dot"/>
        {toast}
      </div>
    </>
  );
}
