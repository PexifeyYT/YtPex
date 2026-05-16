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
  getPlayerState(): number;
  getIframe(): HTMLIFrameElement;
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
  const [playerState, setPlayerState] = useState<number>(-1);
  const [icon, setIcon] = useState<IconState>(null);
  const [isHovered, setIsHovered] = useState(false);
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
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 0,
          origin: window.location.origin,
        },
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
      p.pauseVideo();
      setIcon('pause');
    } else {
      p.playVideo();
      setIcon('play');
      iconTimer.current = setTimeout(() => setIcon(null), 900);
    }
  }, []);

  // Clear pause icon when YT resumes externally
  useEffect(() => {
    if (playerState === 1) {
      iconTimer.current = setTimeout(() => setIcon(null), 900);
    }
  }, [playerState]);

  // ── Fullscreen ───────────────────────────────────────────
  const handleFullscreen = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      const iframe = p.getIframe();
      if (iframe.requestFullscreen) iframe.requestFullscreen();
      else if ((iframe as HTMLIFrameElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
        (iframe as HTMLIFrameElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen!();
      }
    } catch { /* ignore */ }
  }, []);

  const isPaused = playerState === 2 || playerState === -1 || playerState === 5;
  const showControls = isHovered || isPaused;

  return (
    <div className="player-stage">
      <div className="player-glass glass">
        <div className="iridescent" aria-hidden/>

        <div className="player-screen">
          {/* YT iframe mount */}
          <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}/>

          {/* Full-area click zone + hover controls */}
          <div
            className="player-click-zone"
            onClick={handleScreenClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Hover/pause controls overlay */}
            <div className={`player-controls-overlay${showControls ? ' visible' : ''}`}>
              {/* Back to results */}
              <button
                className="player-ctrl-btn"
                onClick={e => { e.stopPropagation(); onClose(); }}
                title="Back to results"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Back
              </button>

              {/* Play / Pause */}
              <button
                className="player-ctrl-btn play-ctrl"
                onClick={e => { e.stopPropagation(); handleScreenClick(); }}
                title={isPaused ? 'Play' : 'Pause'}
              >
                {isPaused
                  ? <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                  : <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                }
              </button>

              {/* Fullscreen */}
              <button
                className="player-ctrl-btn"
                onClick={e => { e.stopPropagation(); handleFullscreen(); }}
                title="Fullscreen"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
                Fullscreen
              </button>
            </div>

            {/* Click-feedback indicator (fades on play, stays on pause) */}
            {icon && (
              <div className={`play-pause-indicator ${icon === 'pause' && isPaused ? 'indicator-stay' : 'indicator-fade'}`}>
                {icon === 'pause'
                  ? <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                  : <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                }
              </div>
            )}
          </div>
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
