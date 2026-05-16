'use client';
import { useEffect, useRef, useState } from 'react';
import type { VideoResult } from '@/types';

interface ShortsViewerProps {
  shorts: VideoResult[];
  loading: boolean;
  query: string;
  onLoadMore: () => void;
  onSearch: (q: string) => void;
  onExitShorts: () => void;
}

export default function ShortsViewer({ shorts, loading, query, onLoadMore, onSearch, onExitShorts }: ShortsViewerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const [searchVal, setSearchVal] = useState(query);

  // Lock body scroll — feed owns the viewport
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = ''; };
  }, []);

  // Arrow key navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const feed = feedRef.current;
      if (!feed) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        feed.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        feed.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Infinite scroll sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && !loading) onLoadMore(); },
      { rootMargin: '400px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onLoadMore, loading]);

  return (
    <>
      {/* Floating search bar */}
      <div className="shorts-topbar">
        <div className="shorts-search-glass">
          <button
            onClick={onExitShorts}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '0 4px 0 0', display: 'flex', alignItems: 'center', flexShrink: 0 }}
            title="Back to Videos"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <input
            className="shorts-search-input"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchVal.trim() && onSearch(searchVal)}
            placeholder="Search Shorts…"
          />
          <button
            className="shorts-search-btn"
            onClick={() => searchVal.trim() && onSearch(searchVal)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Full-screen feed */}
      <div className="shorts-feed" ref={feedRef}>
        {!shorts.length && !loading && (
          <div className="short-card">
            <div className="shorts-empty-inner">
              <div className="e-orb"/>
              <h2>Browse Shorts</h2>
              <p>Search a topic above to scroll through YouTube Shorts.</p>
            </div>
          </div>
        )}

        {shorts.map((short, idx) => (
          <ShortCard key={`${short.id}-${idx}`} short={short}/>
        ))}

        {loading && (
          <div className="short-card">
            <div className="shorts-empty-inner">
              <div className="e-orb" style={{ animation: 'orbFloat 1s ease-in-out infinite' }}/>
            </div>
          </div>
        )}

        <div ref={sentinelRef} style={{ height: 1 }}/>
      </div>
    </>
  );
}

function ShortCard({ short }: { short: VideoResult }) {
  return (
    <div className="short-card">
      <iframe
        className="short-iframe"
        src={`https://www.youtube.com/embed/${short.id}?loop=1&playlist=${short.id}&playsinline=1&rel=0&modestbranding=1`}
        allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title={short.title}
      />
      <div className="short-overlay">
        <div className="short-overlay-glass">
          <div className="short-info">
            <h3>{short.title}</h3>
            <span>{short.channelTitle}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
