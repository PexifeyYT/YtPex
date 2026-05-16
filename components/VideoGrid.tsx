'use client';
import type { VideoResult } from '@/types';
import VideoCard from './VideoCard';

interface VideoGridProps {
  results: VideoResult[];
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  selectedId?: string;
  query: string;
  onSelect: (v: VideoResult) => void;
  onLoadMore?: () => void;
  isDemo?: boolean;
}

export default function VideoGrid({
  results, loading, loadingMore, hasMore,
  selectedId, query, onSelect, onLoadMore, isDemo,
}: VideoGridProps) {
  if (loading) {
    return (
      <>
        <div className="section-head">
          <h3>Searching…</h3>
        </div>
        <div className="grid loader-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card">
              <div className="thumb skeleton" style={{ aspectRatio: '16/9', position: 'relative' }}/>
              <div className="card-body">
                <div className="skeleton" style={{ height: 14, width: '85%', marginBottom: 8 }}/>
                <div className="skeleton" style={{ height: 12, width: '55%' }}/>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!results.length) {
    return (
      <div className="empty">
        <div className="e-orb"/>
        <h2>{query ? 'No results' : 'Start searching'}</h2>
        <p>
          {query
            ? 'Try a different query or paste a video URL above.'
            : 'Type a search query above or paste a YouTube link to get started.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="section-head">
        <h3>{selectedId ? 'More like this' : (query ? `Results for "${query}"` : 'Demo results')}</h3>
        <span className="count">{results.length} ITEMS{isDemo ? ' · DEMO' : ''}</span>
      </div>

      <div className="grid">
        {results.map(v => (
          <VideoCard
            key={v.id}
            video={v}
            active={selectedId === v.id}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="load-more-wrap">
          <button
            className="load-more-btn"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <span className="load-more-spinner"/>
                Loading…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
                Load more
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
