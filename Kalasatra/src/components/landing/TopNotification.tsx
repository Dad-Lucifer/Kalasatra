import { useState } from 'react';
import logoImg from '../../assets/kalastra-logo.png';

export default function TopNotification() {
  const [showAppBanner, setShowAppBanner] = useState(true);

  return (
    <div className="w-full flex flex-col bg-pure-white border-b border-cold-grey-light">
      {/* App Banner (Mobile only in UI, but we can show it generally or hide on large screens) */}
      {showAppBanner && (
        <div className="flex items-center justify-between px-4 py-3 bg-cold-white border-b border-cold-grey-light">
          <div className="flex items-center gap-3">
            {/* Fake App Icon */}
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              <img src={logoImg} alt="Kalastra App Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold font-heading text-deep-black leading-tight uppercase tracking-wide">Kalastra App</span>
              <span className="text-xs text-cold-grey mt-0.5 tracking-widest uppercase">Extra 10% off | Code : KALA10</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-accent-yellow text-deep-black text-xs font-bold px-5 py-2 uppercase tracking-widest hover:bg-deep-black hover:text-pure-white transition-colors shadow-sm">
              Open
            </button>
            <button onClick={() => setShowAppBanner(false)} className="text-cold-grey hover:text-deep-black transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Pincode Strip */}
      <div className="w-full px-6 py-3 bg-pure-white flex items-center justify-center">
        <span className="text-xs uppercase tracking-widest text-deep-black">
          <strong className="font-bold">Enter Pincode</strong> <span className="mx-2 opacity-50">|</span> <span className="underline decoration-1 underline-offset-4 decoration-cold-grey hover:decoration-deep-black transition-colors cursor-pointer">check delivery</span>
        </span>
      </div>
    </div>
  );
}
