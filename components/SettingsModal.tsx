'use client';
import { useState } from 'react';
import type { Settings } from '@/types';

const FAVICON_CHOICES = [
  { id: 'docs',     label: '📄', name: 'Docs' },
  { id: 'sheets',   label: '📊', name: 'Sheets' },
  { id: 'mail',     label: '✉️', name: 'Mail' },
  { id: 'calendar', label: '📅', name: 'Calendar' },
  { id: 'default',  label: '▶', name: 'YouTube' },
];

interface SettingsModalProps {
  open: boolean;
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
}

export default function SettingsModal({ open, settings, onSave, onClose }: SettingsModalProps) {
  const [tab, setTab] = useState<'cloak' | 'dl' | 'play'>('cloak');
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    onSave({ ...settings, [k]: v });

  return (
    <>
      <div className={`modal-backdrop ${open ? 'open' : ''}`} onClick={onClose}/>
      <div className={`modal glass ${open ? 'open' : ''}`}>
        <button className="modal-close" onClick={onClose} aria-label="Close settings">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        <h3>Settings</h3>
        <p className="sub">Personalize your YtPex experience.</p>

        <div className="tabs">
          {(['cloak', 'dl', 'play'] as const).map(t => (
            <button
              key={t}
              className={`tab-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'cloak' ? 'Tab Cloak' : t === 'dl' ? 'Downloads' : 'Playback'}
            </button>
          ))}
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
                  onChange={e => set('tabTitle', e.target.value)}
                  placeholder="e.g. Untitled Document"
                />
              </div>
              <div className="field">
                <label>Favicon</label>
                <div className="favi-row">
                  <div className="favi-bubble">
                    {FAVICON_CHOICES.find(f => f.id === settings.favicon)?.label ?? '▶'}
                  </div>
                  <div className="favi-choices">
                    {FAVICON_CHOICES.map(c => (
                      <div
                        key={c.id}
                        className={`favi-choice ${settings.favicon === c.id ? 'sel' : ''}`}
                        onClick={() => set('favicon', c.id)}
                        title={c.name}
                      >
                        {c.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="nest">
              <h4>Behavior</h4>
              <SwitchRow
                label="Auto-cloak on focus loss"
                desc="Switch title & icon when this tab is in the background."
                checked={settings.autoCloak}
                onChange={v => set('autoCloak', v)}
              />
              <SwitchRow
                label="Panic key (` to revert)"
                desc="Press backtick to instantly restore the real title."
                checked={settings.panicKey}
                onChange={v => set('panicKey', v)}
              />
            </div>
          </>
        )}

        {tab === 'dl' && (
          <div className="nest">
            <h4>Default formats</h4>
            <SwitchRow
              label="High-quality audio (320 kbps)"
              desc="Larger files, lossless-feeling MP3."
              checked={settings.hqAudio}
              onChange={v => set('hqAudio', v)}
            />
            <SwitchRow
              label="Embed metadata & cover art"
              desc="Write title, channel, and thumbnail into the file."
              checked={settings.embedMeta}
              onChange={v => set('embedMeta', v)}
            />
          </div>
        )}

        {tab === 'play' && (
          <div className="nest">
            <h4>Player</h4>
            <SwitchRow
              label="Autoplay next result"
              desc="When the current video ends, load the next one."
              checked={settings.autoplay}
              onChange={v => set('autoplay', v)}
            />
            <SwitchRow
              label="Reduce motion"
              desc="Trim animations and bubble drift."
              checked={settings.reducedMotion}
              onChange={v => set('reducedMotion', v)}
            />
          </div>
        )}
      </div>
    </>
  );
}

function SwitchRow({ label, desc, checked, onChange }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="switch-row">
      <div className="meta">
        <div className="name">{label}</div>
        <div className="desc">{desc}</div>
      </div>
      <div className={`switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}/>
    </div>
  );
}
