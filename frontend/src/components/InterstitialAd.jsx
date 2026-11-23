import { useEffect, useState } from 'react';
import { PHISHING_DEMO_AD } from '../data/ads';
import './InterstitialAd.css';

// When an interstitial last opened (ms since epoch). Lives in memory, resets on a full page reload.
const history = { lastShownAt: 0 };

function canShow(minGapMs) {
  return Date.now() - history.lastShownAt >= minGapMs;
}

/**
 * Full-screen popup ad, shown on every page for this visual-learning demo.
 *  ad         the ad to display (defaults to the phishing-demo prize banner)
 *  countdown  seconds before the close button unlocks
 *  minGapMs   skip showing if another interstitial opened less than this long ago (0 = always show)
 * Clicking anywhere on the ad opens its link in a new tab. The popup stays until it is closed.
 */
export default function InterstitialAd({ ad = PHISHING_DEMO_AD, countdown = 5, minGapMs = 0 }) {
  const [open, setOpen] = useState(() => canShow(minGapMs));
  const [left, setLeft] = useState(countdown);
  const counting = open && left > 0;

  useEffect(() => {
    if (open) history.lastShownAt = Date.now();
  }, [open]);

  useEffect(() => {
    if (!counting) return undefined;
    const timer = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [counting]);

  // Stop the page behind the popup from scrolling.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape only works once the countdown has finished.
  useEffect(() => {
    if (!open || left > 0) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, left]);

  if (!open) return null;

  const Link = ad.url ? 'a' : 'div';
  const linkProps = ad.url
    ? {
        href: ad.url,
        target: '_blank',
        rel: 'noopener noreferrer sponsored',
        'aria-label': `${ad.headline}. ${ad.cta} (opens in a new tab)`,
      }
    : {};

  return (
    <div className="interstitial" role="dialog" aria-modal="true" aria-label="Advertisement">
      <div className="interstitial-panel" style={{ '--ad-bg': ad.color }}>
        <Link className="interstitial-link" {...linkProps}>
          <p className="interstitial-meta">
            <span className="interstitial-tag">Ad</span>
            <span>{ad.sponsor}</span>
          </p>
          <span className="interstitial-mark" aria-hidden="true">
            {ad.sponsor[0]}
          </span>
          <h2 className="interstitial-headline">{ad.headline}</h2>
          <p className="interstitial-text">{ad.text}</p>
          <span className="interstitial-cta">{ad.cta}</span>
        </Link>
        <button type="button" className="interstitial-close" disabled={left > 0} onClick={() => setOpen(false)}>
          {left > 0 ? `Close in ${left}s` : 'Close ×'}
        </button>
      </div>
    </div>
  );
}
