import { useEffect, useRef, useState } from 'react';
import { useToast } from '../context/toastContext';
import { ADS } from '../data/ads';
import './AdBanner.css';

// Slots the user has closed. Lives in memory, so it resets on a full page reload.
const dismissedSlots = new Set();

function randomIndex() {
  return Math.floor(Math.random() * ADS.length);
}

/**
 * Simulated ad.
 *  slot       unique name for this placement (needed so a closed ad stays closed)
 *  variant    'banner' | 'card' | 'strip'
 *  rotateMs   swap to the next ad every N ms (0 = never)
 *  offset     shift the starting ad so two slots on one page differ
 *  dismissible show the close button
 */
export default function AdBanner({ slot, variant = 'banner', rotateMs = 0, offset = 0, dismissible = true }) {
  const toast = useToast();
  const [index, setIndex] = useState(() => (randomIndex() + offset) % ADS.length);
  const [hidden, setHidden] = useState(() => dismissedSlots.has(slot));
  const paused = useRef(false);

  useEffect(() => {
    if (!rotateMs || hidden) return undefined;
    const timer = setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % ADS.length);
    }, rotateMs);
    return () => clearInterval(timer);
  }, [rotateMs, hidden]);

  if (hidden) return null;

  const ad = ADS[index];
  const pause = () => {
    paused.current = true;
  };
  const resume = () => {
    paused.current = false;
  };

  const close = () => {
    dismissedSlots.add(slot);
    setHidden(true);
  };

  return (
    <aside
      className={`ad ad--${variant}`}
      style={{ '--ad-bg': ad.color }}
      aria-label="Advertisement"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <span className="ad-mark" aria-hidden="true">
        {ad.sponsor[0]}
      </span>
      <div className="ad-body" key={ad.id}>
        <p className="ad-meta">
          <span className="ad-tag">Ad</span>
          <span>{ad.sponsor}</span>
        </p>
        <p className="ad-headline">{ad.headline}</p>
        {variant === 'strip' ? null : <p className="ad-text">{ad.text}</p>}
      </div>
      {ad.url ? (
        <a
          className="ad-cta"
          href={ad.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label={`${ad.cta} (opens ${ad.sponsor} in a new tab)`}
        >
          {ad.cta}
        </a>
      ) : (
        <button type="button" className="ad-cta" onClick={() => toast.info('This is a simulated ad. No link was opened.')}>
          {ad.cta}
        </button>
      )}
      {dismissible ? (
        <button type="button" className="ad-x" aria-label="Close ad" onClick={close}>
          ×
        </button>
      ) : null}
    </aside>
  );
}
