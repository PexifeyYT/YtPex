'use client';
import Image from 'next/image';
import type { VideoResult } from '@/types';

interface VideoCardProps {
  video: VideoResult;
  active: boolean;
  onSelect: (v: VideoResult) => void;
}

function timeAgo(iso: string): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / 86400000);
  if (d < 1) return 'Today';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

export default function VideoCard({ video, active, onSelect }: VideoCardProps) {
  return (
    <div
      className={`card ${active ? 'active' : ''}`}
      onClick={() => onSelect(video)}
    >
      <div className="thumb">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, 280px"
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)' }} />
        )}
        <div className="play-hint">
          <div className="play-hint-circle">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="card-title">{video.title}</div>
        <div className="card-meta">
          <span>{video.channelTitle}</span>
          {video.publishedAt && (
            <>
              <span className="dot"/>
              <span>{timeAgo(video.publishedAt)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
