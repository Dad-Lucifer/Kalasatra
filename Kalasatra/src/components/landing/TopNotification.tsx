import { useState } from 'react';
import logoImg from '../../assets/kalastra-logo.png';

export default function TopNotification() {
  const [showAppBanner, setShowAppBanner] = useState(true);

  return (
    <div className="w-full flex flex-col bg-white">
      {/* App Banner (Mobile only in UI, but we can show it generally or hide on large screens) */}
      {showAppBanner && (
        <div className="flex items-center justify-between px-4 py-3 bg-[#f5ebe6] border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* Fake App Icon */}
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-[#f0e7db]">
              <img src={logoImg} alt="Kalastra App Logo" className="w-full h-full object-cover p-1" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-black leading-tight">Kalastra is better on the app</span>
              <span className="text-xs text-gray-700 mt-0.5">Extra 10% off | Code : Kala10</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-black text-white text-xs font-bold px-4 py-2 uppercase">
              Open
            </button>
            <button onClick={() => setShowAppBanner(false)} className="text-gray-500 hover:text-black">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Pincode Strip */}
      <div className="w-full px-4 py-2.5 bg-white border-b border-gray-100 flex items-center">
        <span className="text-sm text-black">
          <strong>Enter Pincode</strong> - <span className="underline decoration-1 underline-offset-2">to check delivery</span>
        </span>
      </div>
    </div>
  );
}
