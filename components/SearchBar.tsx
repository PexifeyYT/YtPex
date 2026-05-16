'use client';
import { useState, useRef } from 'react';

const RECENT_SEARCHES = [
  'mountain bike trails 4K',
  'lofi beats to study to',
  'ambient synth long mix',
  'liquid glass interfaces',
];

interface SearchBarProps {
  query: string;
  onSearch: (q: string) => void;
  placeholder?: string;
}

export default function SearchBar({ query, onSearch, placeholder }: SearchBarProps) {
  const [val, setVal] = useState(query);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (q: string) => {
    if (!q.trim()) return;
    onSearch(q);
    setFocused(false);
    inputRef.current?.blur();
  };

  return (
    <div className="search-wrap">
      <div className="search">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
        </svg>
        <input
          ref={inputRef}
          value={val}
          onChange={e => setVal(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          onKeyDown={e => { if (e.key === 'Enter') submit(val); if (e.key === 'Escape') { setFocused(false); inputRef.current?.blur(); } }}
          placeholder={placeholder || 'Search videos, paste a link, or describe a vibe…'}
          autoComplete="off"
          spellCheck={false}
        />
        <button className="search-go" onClick={() => submit(val)}>
          Search
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M13 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <div className={`suggestions ${focused && !val ? 'open' : ''}`}>
        {RECENT_SEARCHES.map(s => (
          <div
            key={s}
            className="sug-item"
            onMouseDown={() => { setVal(s); submit(s); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>
            </svg>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
