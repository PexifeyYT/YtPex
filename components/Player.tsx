'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement | string, config: YTConfig) => YTPlayerInstance;
      PlayerState: { PLAYING: 1; PAUSED: 2; ENDED: 0; BUFFERING: 3; CUED: 5; UNSTARTED: -1 };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTConfig {
  videoId: string;
  width?: string | number;
  height?: string | number;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (e: { target: YTPlayerInstance }) => void;
    onStateChange?: (e: { data: number }) => void;
  };
}

interface YTPlayerInstance {
  loadVideoById(id: string): void;
  destroy(): void;
  pauseVideo(): void;
  playVideo(): void;
  getPlayerState(): number; // 1=playing 2=paused
}

let apiLoaded = false;
let apiReady = false;
const readyCbs: Array<() => void> = [];

function ensureYTApi(cb: () => void) {
  if (apiReady) { cb(); return; }
  readyCbs.push(cb);
  if (!apiLoaded) {
    apiLoaded = true;
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
    window.onYouTubeIframeAPIReady = () => {
      apiReady = true;
      readyCbs.forEach(fn => fn());
      readyCbs.length = 0;
    };
  }
}

// ── Download pill ────────────────────────────────────────────
interface DownloadPillProps {
  format: 'MP3' | 'MP4';
  onDownload: () => void;
}

function DownloadPill({ format, onDownload }: DownloadPillProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleClick = () => {
    if (progress > 0 && !done) return;
    if (done) { setDone(false); setProgress(0); return; }
    onDownload();
    let p = 0;
    const tick = () => {
      p = Math.min(p + 6 + Math.random() * 10, 95);
      setProgress(p);
      if (p < 95) setTimeout(tick, 180);
    };
    tick();
    setTimeout(() => { setProgress(100); setDone(true); }, 3200);
  };

  return (
    <button className="dl-pill" onClick={handleClick} disabled={progress > 0 && !done && progress < 100}>
      <span className="dl-progress" style={{ width: `${progress}%` }}/>
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {done
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
        }
        {done ? 'Saved' : (progress > 0 ? `${Math.round(progress)}%` : 'Download')}
        <span className="fmt">{format}</span>
      </span>
    </button>
  );
}

// ── Player ───────────────────────────────────────────────────
interface PlayerProps {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt?: string;
  onClose: () => void;
  onDownload: (fmt: 'mp4' | 'mp3') => void;
}

type IconState = 'play' | 'pause' | null;

export default function Player({ videoId, title, channelTitle, publishedAt, onClose, onDownload }: PlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const mountedId = useRef('');
  const [playerState, setPlayerState] = useState<number>(-1); // -1 unstarted
  const [icon, setIcon] = useState<IconState>(null);
  const iconTimer = useRef<ReturnType<typeof setTimeout>>();

  // ── YT init ─────────────────────────────────────────────
  useEffect(() => {
    ensureYTApi(() => {
      if (!containerRef.current) return;

      if (playerRef.current && mountedId.current !== videoId) {
        playerRef.current.loadVideoById(videoId);
        mountedId.current = videoId;
        return;
      }
      if (playerRef.current) return;

      const div = document.createElement('div');
      containerRef.current.appendChild(div);
      mountedId.current = videoId;

      playerRef.current = new window.YT.Player(div, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { autoplay: 1, modestbranding: 1, rel: 0, origin: window.location.origin },
        events: {
          onReady: e => e.target.loadVideoById(videoId),
          onStateChange: e => setPlayerState(e.data),
        },
      });
    });

    return () => {
      clearTimeout(iconTimer.current);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { /* ignore */ }
        playerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // ── Click to play/pause ──────────────────────────────────
  const handleScreenClick = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    clearTimeout(iconTimer.current);

    const state = p.getPlayerState();
    if (state === 1) {
      // currently playing → pause
      p.pauseVideo();
      setIcon('pause'); // stays until unpaused
    } else {
      // paused / unstarted → play
      p.playVideo();
      setIcon('play'); // fades after 900ms
      iconTimer.current = setTimeout(() => setIcon(null), 900);
    }
  }, []);

  // When YT state changes to playing externally, clear pause icon
  useEffect(() => {
    if (playerState === 1) {
      // playing — if pause icon was showing, remove after brief moment
      iconTimer.current = setTimeout(() => setIcon(null), 900);
    }
  }, [playerState]);

  const isPaused = playerState === 2;

  return (
    <div className="player-stage">
      <div className="player-glass glass">
        <div className="iridescent" aria-hidden/>

        <div className="player-screen">
          {/* YT iframe mount */}
          <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}/>

          {/* Click zone — covers video center, leaves bottom for YT controls */}
          <div className="player-click-zone" onClick={handleScreenClick} title="Click to play/pause"/>

          {/* Fading play/pause indicator */}
          {icon && (
            <div className={`play-pause-indicator ${icon === 'pause' && isPaused ? 'indicator-stay' : 'indicator-fade'}`}>
              {icon === 'pause'
                ? <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                : <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
              }
            </div>
          )}
        </div>

        <div className="player-meta">
          <div className="player-info">
            <h2>{title || `YouTube · ${videoId}`}</h2>
            <div className="sub">
              {channelTitle && <span>{channelTitle}</span>}
              {channelTitle && publishedAt && <span className="dot"/>}
              {publishedAt && <span>{new Date(publishedAt).toLocaleDateString()}</span>}
            </div>
          </div>
          <button className="player-close" onClick={onClose} aria-label="Close player">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
          <div className="dl-row">
            <DownloadPill format="MP3" onDownload={() => onDownload('mp3')}/>
            <DownloadPill format="MP4" onDownload={() => onDownload('mp4')}/>
          </div>
        </div>
      </div>
    </div>
  );
}
