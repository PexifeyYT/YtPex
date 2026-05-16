'use client';
import { useEffect, useRef } from 'react';

interface BubbleFieldProps {
  count?: number;
  accentHue?: number;
  reduced?: boolean;
}

export default function BubbleField({ count = 14, accentHue = 270, reduced = false }: BubbleFieldProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = ref.current;
    if (!field || reduced) return;
    field.innerHTML = '';

    for (let i = 0; i < count; i++) {
      const b = document.createElement('div');
      b.className = 'bubble';
      const size = 60 + Math.random() * 280;
      const x = Math.random() * 110 - 5;
      const y = Math.random() * 110 - 5;
      const hue = accentHue + (Math.random() * 80 - 40);
      const dur = 24 + Math.random() * 32;
      const op = 0.18 + Math.random() * 0.5;
      const delay = -Math.random() * dur;

      b.style.cssText = `
        width:${size}px; height:${size}px;
        left:${x}%; top:${y}%;
        z-index:${Math.random() > 0.6 ? 1 : 0};
        animation-duration:${dur}s;
        animation-delay:${delay}s;
      `;
      b.style.setProperty('--b-hue', String(hue));
      b.style.setProperty('--b-dur', `${dur}s`);
      b.style.setProperty('--b-opacity', String(op));

      field.appendChild(b);
    }

    const onMove = (e: MouseEvent) => {
      const cx = e.clientX / window.innerWidth - 0.5;
      const cy = e.clientY / window.innerHeight - 0.5;
      if (field) field.style.transform = `translate(${cx * -20}px,${cy * -20}px)`;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [count, accentHue, reduced]);

  return <div ref={ref} className="bubble-field" aria-hidden />;
}
