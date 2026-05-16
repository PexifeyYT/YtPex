'use client';
import { useState } from 'react';

interface PasteRowProps {
  onPaste: (url: string) => void;
}

export default function PasteRow({ onPaste }: PasteRowProps) {
  const [url, setUrl] = useState('');

  const tryClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch { /* clipboard denied */ }
  };

  return (
    <div className="paste-row">
      <input
        className="paste-input"
        type="text"
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && url && onPaste(url)}
        placeholder="Or paste a YouTube link to extract…"
      />
      <button className="paste-btn" onClick={tryClipboard} title="Paste from clipboard">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="4" rx="1"/>
          <path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/>
        </svg>
        Paste
      </button>
      <button
        className="paste-btn"
        style={{
          background: 'linear-gradient(135deg,oklch(0.72 0.18 270),oklch(0.78 0.16 310))',
          color: 'white', fontWeight: 600,
          border: '1px solid rgba(255,255,255,0.2)',
        }}
        onClick={() => url && onPaste(url)}
        disabled={!url}
      >
        Extract
      </button>
    </div>
  );
}
