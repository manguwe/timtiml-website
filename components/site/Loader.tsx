'use client';

import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';

/** Splash screen: shows the bar animation, then fades out. */
export function Loader() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 1500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div id="loader" className={hidden ? 'hidden' : undefined}>
      <div className="loader-inner">
        <div className="loader-logo">
          <Logo id="lg1" />
        </div>
        <div className="loader-bar">
          <div className="loader-fill" />
        </div>
        <div className="loader-text">TIMTIML</div>
      </div>
    </div>
  );
}
