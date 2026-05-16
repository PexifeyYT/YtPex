/* global React, ReactDOM */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ---------- Data ----------
const SAMPLE_VIDEOS = [
  { id: 'v1', title: 'Liquid Glass: A Visual Study of Light Through Form', channel: 'Studio Refract', duration: '12:04', views: '2.1M', age: '3 weeks ago', hue: 280, hue2: 320, art: 'wave' },
  { id: 'v2', title: 'Building Calm Interfaces — A Designer\'s Field Notes', channel: 'Marta Pell', duration: '8:47', views: '184K', age: '2 days ago', hue: 220, hue2: 280, art: 'gradient' },
  { id: 'v3', title: 'How Soap Bubbles Generate Iridescence (Slow Motion 4K)', channel: 'Phenom', duration: '6:21', views: '912K', age: '1 month ago', hue: 200, hue2: 320, art: 'orb' },
  { id: 'v4', title: 'Ambient Synth Set — Late Night Drift', channel: 'Northern Tones', duration: '54:12', views: '3.4M', age: '6 months ago', hue: 260, hue2: 200, art: 'horizon' },
  { id: 'v5', title: 'A Walk Through Reykjavík in November', channel: 'Slow Travel Diaries', duration: '21:38', views: '76K', age: '5 days ago', hue: 240, hue2: 260, art: 'mountain' },
  { id: 'v6', title: 'The Physics of Translucency, Explained Plainly', channel: 'Plain Science', duration: '9:55', views: '420K', age: '2 weeks ago', hue: 300, hue2: 240, art: 'wave' },
  { id: 'v7', title: 'Glass Blowing in Murano — A Master at Work', channel: 'Atelier', duration: '14:02', views: '1.2M', age: '4 months ago', hue: 30, hue2: 320, art: 'gradient' },
  { id: 'v8', title: 'Lo-fi Beats to Render Frosted UI To', channel: 'Glassworks', duration: '1:24:08', views: '8.7M', age: '1 year ago', hue: 290, hue2: 220, art: 'orb' },
  { id: 'v9', title: 'Designing Motion That Feels Like Water', channel: 'Marta Pell', duration: '17:33', views: '301K', age: '1 week ago', hue: 210, hue2: 290, art: 'wave' },
];

const RECENT_SEARCHES = [
  'liquid glass interfaces',
  'ambient synth long mix',
  'soap bubble slow motion',
  'designing with translucency',
];

// ---------- Helpers ----------
const Icon = {
  search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  settings: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  history: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>,
  play: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  pause: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>,
  download: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>,
  paste: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/></svg>,
  close: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  volume: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
  fullscreen: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>,
  trending: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></svg>,
  check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
};

// Thumbnail art generators — gradient / SVG placeholder, no real video imagery
function ThumbArt({ v }) {
  const grad = `linear-gradient(135deg, oklch(0.55 0.22 ${v.hue}) 0%, oklch(0.4 0.2 ${v.hue2}) 100%)`;
  const common = { width: '100%', height: '100%', display: 'block' };
  if (v.art === 'wave') {
    return (
      <div className="thumb-art" style={{ background: grad }}>
        <svg viewBox="0 0 320 180" preserveAspectRatio="none" style={common}>
          <defs>
            <linearGradient id={`g-${v.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,0.5)"/>
              <stop offset="1" stopColor="rgba(255,255,255,0)"/>
            </linearGradient>
          </defs>
          <path d="M0 110 Q 80 70, 160 110 T 320 110 L 320 180 L 0 180 Z" fill={`url(#g-${v.id})`} opacity="0.6"/>
          <path d="M0 130 Q 80 100, 160 130 T 320 130 L 320 180 L 0 180 Z" fill="rgba(255,255,255,0.18)"/>
          <circle cx="240" cy="50" r="22" fill="rgba(255,255,255,0.35)" filter="blur(0.5px)"/>
        </svg>
      </div>
    );
  }
  if (v.art === 'orb') {
    return (
      <div className="thumb-art" style={{ background: grad }}>
        <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" style={common}>
          <defs>
            <radialGradient id={`o-${v.id}`} cx="0.35" cy="0.3">
              <stop offset="0" stopColor="rgba(255,255,255,0.85)"/>
              <stop offset="0.4" stopColor="rgba(255,255,255,0.15)"/>
              <stop offset="1" stopColor="rgba(255,255,255,0)"/>
            </radialGradient>
          </defs>
          <circle cx="160" cy="95" r="70" fill={`url(#o-${v.id})`}/>
          <circle cx="160" cy="95" r="70" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
          <circle cx="80" cy="40" r="14" fill="rgba(255,255,255,0.3)"/>
          <circle cx="260" cy="140" r="20" fill="rgba(255,255,255,0.25)"/>
        </svg>
      </div>
    );
  }
  if (v.art === 'horizon') {
    return (
      <div className="thumb-art" style={{ background: grad }}>
        <svg viewBox="0 0 320 180" preserveAspectRatio="none" style={common}>
          <rect x="0" y="100" width="320" height="80" fill="rgba(0,0,0,0.25)"/>
          <circle cx="160" cy="100" r="36" fill="rgba(255,240,210,0.85)" filter="blur(1px)"/>
          <line x1="0" y1="100" x2="320" y2="100" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
        </svg>
      </div>
    );
  }
  if (v.art === 'mountain') {
    return (
      <div className="thumb-art" style={{ background: grad }}>
        <svg viewBox="0 0 320 180" preserveAspectRatio="none" style={common}>
          <polygon points="0,180 80,90 140,140 200,70 260,120 320,80 320,180" fill="rgba(0,0,0,0.35)"/>
          <polygon points="0,180 90,120 160,150 230,110 320,140 320,180" fill="rgba(0,0,0,0.5)"/>
          <circle cx="60" cy="40" r="18" fill="rgba(255,255,255,0.55)"/>
        </svg>
      </div>
    );
  }
  // gradient default
  return (
    <div className="thumb-art" style={{ background: grad }}>
      <svg viewBox="0 0 320 180" preserveAspectRatio="none" style={common}>
        <circle cx="240" cy="50" r="60" fill="rgba(255,255,255,0.18)" filter="blur(1px)"/>
        <circle cx="60" cy="150" r="40" fill="rgba(255,255,255,0.12)" filter="blur(1px)"/>
      </svg>
    </div>
  );
}

// ---------- Bubble background ----------
function useBubbles(count, hueBase) {
  useEffect(() => {
    const field = document.getElementById('bubbleField');
    if (!field) return;
    field.innerHTML = '';
    const N = count;
    for (let i = 0; i < N; i++) {
      const b = document.createElement('div');
      b.className = 'bubble';
      const size = 60 + Math.random() * 280;
      const x = Math.random() * 110 - 5;
      const y = Math.random() * 110 - 5;
      const hue = hueBase + (Math.random() * 80 - 40);
      const dur = 24 + Math.random() * 32;
      const op = 0.18 + Math.random() * 0.5;
      const delay = -Math.random() * dur;
      b.style.width = b.style.height = `${size}px`;
      b.style.left = `${x}%`;
      b.style.top = `${y}%`;
      b.style.setProperty('--b-hue', hue);
      b.style.setProperty('--b-dur', `${dur}s`);
      b.style.setProperty('--b-opacity', op);
      b.style.animationDelay = `${delay}s`;
      b.style.zIndex = Math.random() > 0.6 ? 1 : 0;
      field.appendChild(b);
    }
    // Parallax
    const onMove = (e) => {
      const cx = (e.clientX / window.innerWidth - 0.5);
      const cy = (e.clientY / window.innerHeight - 0.5);
      field.style.transform = `translate(${cx * -20}px, ${cy * -20}px)`;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [count, hueBase]);
}

// ---------- Ripples ----------
function useRipples(enabled) {
  const [ripples, setRipples] = useState([]);
  const idRef = useRef(0);
  const trigger = useCallback((x, y) => {
    if (!enabled) return;
    const id = ++idRef.current;
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(it => it.id !== id)), 1400);
  }, [enabled]);
  return [ripples, trigger];
}

// ---------- Components ----------
function SearchBar({ query, setQuery, onSearch, focused, setFocused, rippleEnabled }) {
  const [ripples, addRipple] = useRipples(rippleEnabled);
  const inputRef = useRef();

  const handleKey = (e) => {
    if (e.key === 'Enter') { onSearch(query); setFocused(false); inputRef.current?.blur(); }
    if (e.key === 'Escape') { setFocused(false); inputRef.current?.blur(); }
    if (rippleEnabled && e.key.length === 1) {
      // Approximate cursor location
      const inp = inputRef.current;
      if (inp) {
        const rect = inp.getBoundingClientRect();
        const parent = inp.parentElement.getBoundingClientRect();
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.font = '19px Inter';
        const w = ctx.measureText(inp.value.slice(0, inp.selectionStart || inp.value.length)).width;
        addRipple(rect.left - parent.left + Math.min(w, rect.width - 40), rect.height / 2);
      }
    }
  };

  return (
    <div className="search-wrap">
      <div className="search">
        <Icon.search />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          onKeyDown={handleKey}
          placeholder="Search videos, paste a link, or describe a vibe…"
          autoComplete="off"
          spellCheck="false"
        />
        <div className="ripple-layer">
          {ripples.map(r => (
            <span key={r.id} className="ripple" style={{ left: r.x, top: r.y }}/>
          ))}
        </div>
        <button className="search-go" onClick={() => onSearch(query)}>
          Search
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </button>
      </div>

      <div className={`suggestions ${focused && !query ? 'open' : ''}`}>
        {RECENT_SEARCHES.map(s => (
          <div key={s} className="sug-item" onMouseDown={() => { setQuery(s); onSearch(s); }}>
            <Icon.history />
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PasteRow({ onPaste, accentHue }) {
  const [url, setUrl] = useState('');
  const tryPaste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) setUrl(t);
    } catch (e) { /* clipboard blocked */ }
  };
  return (
    <div className="paste-row">
      <input
        className="paste-input"
        type="text"
        placeholder="Or paste a video link to extract…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && url && onPaste(url)}
      />
      <button className="paste-btn" onClick={tryPaste} title="Paste from clipboard">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Icon.paste />
          Paste
        </span>
      </button>
      <button
        className="paste-btn"
        style={{
          background: `linear-gradient(135deg, oklch(0.72 0.18 ${accentHue}), oklch(0.78 0.16 ${accentHue + 40}))`,
          color: 'white',
          fontWeight: 600,
          border: '1px solid rgba(255,255,255,0.2)'
        }}
        onClick={() => url && onPaste(url)}
        disabled={!url}
      >
        Extract
      </button>
    </div>
  );
}

function DownloadPill({ format, size, onClick }) {
  const [bursting, setBursting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef();

  const handleClick = (e) => {
    if (progress > 0 && !done) return;
    if (done) { setDone(false); setProgress(0); }
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--cx', `${e.clientX - r.left}px`);
    ref.current.style.setProperty('--cy', `${e.clientY - r.top}px`);
    setBursting(true);
    setTimeout(() => setBursting(false), 900);

    // Simulate progress
    let p = 0;
    const tick = () => {
      p += 6 + Math.random() * 10;
      if (p >= 100) {
        setProgress(100);
        setDone(true);
        onClick?.(format);
        return;
      }
      setProgress(p);
      setTimeout(tick, 140);
    };
    tick();
  };

  return (
    <button
      ref={ref}
      className={`dl-pill ${bursting ? 'bursting' : ''}`}
      onClick={handleClick}
    >
      <span className="progress" style={{ width: `${progress}%` }}/>
      <span className="liquid-burst"/>
      <span className="label-text" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        {done ? <Icon.check /> : <Icon.download />}
        {done ? 'Saved' : (progress > 0 ? `${Math.round(progress)}%` : 'Download')}
        <span className="fmt">{format}</span>
        {size && progress === 0 && <span style={{ opacity: 0.5, fontSize: 11 }}>{size}</span>}
      </span>
    </button>
  );
}

function Player({ video, onClose, onDownload }) {
  const [playing, setPlaying] = useState(true);
  if (!video) return null;
  return (
    <div className="player-stage">
      <div className="player-glass glass">
        <div className="iridescent" aria-hidden/>
        <div className="player-screen">
          <ThumbArt v={video}/>
          <div className="player-controls">
            <button className="pc-btn" onClick={() => setPlaying(p => !p)}>
              {playing ? <Icon.pause /> : <Icon.play />}
            </button>
            <div className="pc-scrub"><div className="pc-scrub-fill"/></div>
            <span className="pc-time">3:48 / {video.duration}</span>
            <button className="pc-btn"><Icon.volume /></button>
            <button className="pc-btn"><Icon.fullscreen /></button>
          </div>
        </div>
        <div className="player-meta">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>{video.title}</h2>
            <div className="sub">
              <span>{video.channel}</span>
              <span className="dot"/>
              <span>{video.views} views</span>
              <span className="dot"/>
              <span>{video.age}</span>
            </div>
          </div>
          <div className="dl-row">
            <DownloadPill format="MP3" size="4.2 MB" onClick={onDownload}/>
            <DownloadPill format="MP4" size="38 MB" onClick={onDownload}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ v, active, onSelect }) {
  return (
    <div className={`card ${active ? 'active' : ''}`} onClick={() => onSelect(v)}>
      <div className="thumb">
        <ThumbArt v={v}/>
        <div className="duration">{v.duration}</div>
        <div className="play-hint">
          <div className="play-hint-circle"><Icon.play /></div>
        </div>
      </div>
      <div className="card-body">
        <div className="card-title">{v.title}</div>
        <div className="card-meta">
          <span className="channel">{v.channel}</span>
          <span className="dot"/>
          <span>{v.views} views</span>
          <span className="dot"/>
          <span>{v.age}</span>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({ open, onClose, settings, setSettings }) {
  const [tab, setTab] = useState('cloak');
  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));
  const faviconChoices = [
    { id: 'docs', label: '📄', name: 'Docs' },
    { id: 'sheets', label: '📊', name: 'Sheets' },
    { id: 'mail', label: '✉️', name: 'Mail' },
    { id: 'calendar', label: '📅', name: 'Calendar' },
    { id: 'glass', label: '○', name: 'Default' },
  ];
  return (
    <>
      <div className={`modal-backdrop ${open ? 'open' : ''}`} onClick={onClose}/>
      <div className={`modal ${open ? 'open' : ''}`}>
        <button className="modal-close" onClick={onClose}><Icon.close /></button>
        <h3>Settings</h3>
        <p className="sub">Personalize your YtPex experience.</p>

        <div className="tabs">
          <button className={`tab-btn ${tab === 'cloak' ? 'active' : ''}`} onClick={() => setTab('cloak')}>Tab Cloak</button>
          <button className={`tab-btn ${tab === 'dl' ? 'active' : ''}`} onClick={() => setTab('dl')}>Downloads</button>
          <button className={`tab-btn ${tab === 'play' ? 'active' : ''}`} onClick={() => setTab('play')}>Playback</button>
        </div>

        {tab === 'cloak' && (
          <>
            <div className="nest">
              <h4>Tab title & icon</h4>
              <div className="field">
                <label>Custom tab title</label>
                <input
                  type="text"
                  value={settings.tabTitle}
                  onChange={(e) => set('tabTitle', e.target.value)}
                  placeholder="e.g. Untitled Document"
                />
              </div>
              <div className="field">
                <label>Favicon</label>
                <div className="favi-row">
                  <div className="favi-bubble">{faviconChoices.find(f => f.id === settings.favicon)?.label}</div>
                  <div className="favi-choices">
                    {faviconChoices.map(c => (
                      <div
                        key={c.id}
                        className={`favi-choice ${settings.favicon === c.id ? 'sel' : ''}`}
                        onClick={() => set('favicon', c.id)}
                        title={c.name}
                      >{c.label}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="nest">
              <h4>Behavior</h4>
              <div className="field switch-row">
                <div className="meta">
                  <div className="name">Auto-cloak on focus loss</div>
                  <div className="desc">Switch title & icon when this tab is in the background.</div>
                </div>
                <div className={`switch ${settings.autoCloak ? 'on' : ''}`} onClick={() => set('autoCloak', !settings.autoCloak)}/>
              </div>
              <div className="field switch-row">
                <div className="meta">
                  <div className="name">Panic key (` to revert)</div>
                  <div className="desc">Press backtick to instantly restore the real title.</div>
                </div>
                <div className={`switch ${settings.panicKey ? 'on' : ''}`} onClick={() => set('panicKey', !settings.panicKey)}/>
              </div>
            </div>
          </>
        )}

        {tab === 'dl' && (
          <div className="nest">
            <h4>Default formats</h4>
            <div className="field switch-row">
              <div className="meta">
                <div className="name">High-quality audio (320kbps)</div>
                <div className="desc">Larger files, lossless-feeling MP3.</div>
              </div>
              <div className={`switch ${settings.hqAudio ? 'on' : ''}`} onClick={() => set('hqAudio', !settings.hqAudio)}/>
            </div>
            <div className="field switch-row">
              <div className="meta">
                <div className="name">Embed metadata & cover art</div>
                <div className="desc">Write title, channel, and thumbnail into the file.</div>
              </div>
              <div className={`switch ${settings.embedMeta ? 'on' : ''}`} onClick={() => set('embedMeta', !settings.embedMeta)}/>
            </div>
          </div>
        )}

        {tab === 'play' && (
          <div className="nest">
            <h4>Player</h4>
            <div className="field switch-row">
              <div className="meta">
                <div className="name">Autoplay next result</div>
                <div className="desc">When the current video ends, queue the next one.</div>
              </div>
              <div className={`switch ${settings.autoplay ? 'on' : ''}`} onClick={() => set('autoplay', !settings.autoplay)}/>
            </div>
            <div className="field switch-row">
              <div className="meta">
                <div className="name">Reduce motion</div>
                <div className="desc">Trim animations and bubble drift.</div>
              </div>
              <div className={`switch ${settings.reducedMotion ? 'on' : ''}`} onClick={() => set('reducedMotion', !settings.reducedMotion)}/>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ---------- App ----------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentHue": 270,
  "bubbleCount": 14,
  "glassBlur": 32,
  "rippleOnType": true,
  "showIridescent": true
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = (window.useTweaks || ((d) => [d, () => {}]))(TWEAK_DEFAULTS);

  const [query, setQuery] = useState('liquid glass interfaces');
  const [searchFocused, setSearchFocused] = useState(false);
  const [results, setResults] = useState(SAMPLE_VIDEOS);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState(null);

  const [settings, setSettings] = useState({
    tabTitle: 'YtPex',
    favicon: 'glass',
    autoCloak: false,
    panicKey: true,
    hqAudio: true,
    embedMeta: true,
    autoplay: false,
    reducedMotion: false,
  });

  useBubbles(tweaks.bubbleCount, tweaks.accentHue);

  // Apply css vars
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--accent-hue', tweaks.accentHue);
    r.style.setProperty('--glass-blur', `${tweaks.glassBlur}px`);
    if (!tweaks.showIridescent) {
      r.style.setProperty('--iridescent-display', 'none');
    }
  }, [tweaks.accentHue, tweaks.glassBlur, tweaks.showIridescent]);

  // Tab cloak
  useEffect(() => {
    document.title = settings.tabTitle || 'YtPex';
  }, [settings.tabTitle]);

  useEffect(() => {
    if (!settings.panicKey) return;
    const h = (e) => { if (e.key === '`') setSettings(s => ({ ...s, tabTitle: 'YtPex', favicon: 'glass' })); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [settings.panicKey]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const onSearch = (q) => {
    setLoading(true);
    setTimeout(() => {
      // Shuffle / vary results based on query string seed
      const seed = (q || '').length;
      const shuffled = [...SAMPLE_VIDEOS].sort((a, b) => ((a.id.charCodeAt(1) + seed) % 7) - ((b.id.charCodeAt(1) + seed) % 7));
      setResults(shuffled);
      setLoading(false);
    }, 700);
  };

  const onPaste = (url) => {
    showToast('Extracting from link…');
    setTimeout(() => {
      setSelected(SAMPLE_VIDEOS[0]);
      showToast('Link extracted ✓');
    }, 900);
  };

  const onSelect = (v) => {
    setSelected(v);
    // Smooth scroll
    setTimeout(() => {
      window.scrollTo({ top: 220, behavior: 'smooth' });
    }, 50);
  };

  const onDownload = (fmt) => {
    showToast(`${fmt} saved to your library`);
  };

  return (
    <>
      <div className="app">
        <div className="topbar">
          <div className="brand">
            <div className="brand-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <div className="brand-name">YtPex<span>liquid glass</span></div>
          </div>
          <div className="top-actions">
            <button className="pill-btn"><Icon.trending /> Trending</button>
            <button className="pill-btn" onClick={() => setShowSettings(true)}><Icon.settings /> Settings</button>
          </div>
        </div>

        <div className="led-wrap">
          <div className="led-sign" title="made by pexifey">
            <span className="led-dot"/>
            <span>
              made by p<span className="led-dim">e</span>xif<span className="led-dead">e</span>y
            </span>
          </div>
        </div>

        <SearchBar
          query={query}
          setQuery={setQuery}
          onSearch={onSearch}
          focused={searchFocused}
          setFocused={setSearchFocused}
          rippleEnabled={tweaks.rippleOnType && !settings.reducedMotion}
        />
        <PasteRow onPaste={onPaste} accentHue={tweaks.accentHue}/>

        {selected && <Player video={selected} onClose={() => setSelected(null)} onDownload={onDownload}/>}

        <div className="section-head">
          <h3>{selected ? 'More like this' : (query ? `Results for "${query}"` : 'Suggested')}</h3>
          <span className="count">{results.length} ITEMS</span>
        </div>

        {loading ? (
          <div className="grid loader-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card">
                <div className="thumb skeleton" style={{ aspectRatio: '16/9' }}/>
                <div className="card-body">
                  <div className="skeleton" style={{ height: 14, width: '85%', marginBottom: 8 }}/>
                  <div className="skeleton" style={{ height: 12, width: '55%' }}/>
                </div>
              </div>
            ))}
          </div>
        ) : results.length ? (
          <div className="grid">
            {results.map(v => (
              <Card key={v.id} v={v} active={selected?.id === v.id} onSelect={onSelect}/>
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="e-orb"/>
            <h2>Nothing here yet</h2>
            <p>Try a different search, or paste a video URL above to pull it through the glass.</p>
          </div>
        )}
      </div>

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        setSettings={setSettings}
      />

      <div className={`toast ${toast ? 'show' : ''}`}>
        <span className="toast-dot"/>
        {toast}
      </div>

      {window.TweaksPanel && (
        <window.TweaksPanel>
          <window.TweakSection label="Look" />
          <window.TweakSlider label="Accent hue" value={tweaks.accentHue} min={0} max={360} step={1} unit="°" onChange={(v) => setTweak('accentHue', v)}/>
          <window.TweakSlider label="Glass blur" value={tweaks.glassBlur} min={8} max={80} step={1} unit="px" onChange={(v) => setTweak('glassBlur', v)}/>
          <window.TweakToggle label="Iridescent ring" value={tweaks.showIridescent} onChange={(v) => setTweak('showIridescent', v)}/>
          <window.TweakSection label="Atmosphere" />
          <window.TweakSlider label="Bubble count" value={tweaks.bubbleCount} min={0} max={30} step={1} onChange={(v) => setTweak('bubbleCount', v)}/>
          <window.TweakToggle label="Ripple on typing" value={tweaks.rippleOnType} onChange={(v) => setTweak('rippleOnType', v)}/>
        </window.TweaksPanel>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
