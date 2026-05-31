import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/kalastra-logo.png';
import SidebarMenu from './SidebarMenu';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <nav
        className={`sticky top-0 z-40 bg-white transition-all duration-300 ${
          scrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16 gap-4">
            
            {/* Left: Hamburger */}
            <div className="flex items-center">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-black hover:text-gray-600 focus:outline-none"
              >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Center: Logo (Hidden on very small screens if search takes over, but let's keep it for now) */}
          <Link to="/" className="hidden lg:flex flex-1 justify-center items-center">
             <div className="flex items-center gap-3 justify-center h-14">
                <img src={logoImg} alt="Kalastra Logo" className="h-full w-auto object-contain" />
                <span 
                  className="text-2xl font-black tracking-[0.2em] uppercase text-black"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Kalasatra
                </span>
             </div>
          </Link>

          {/* Right: Search + Icons */}
          <div className="flex flex-1 lg:flex-none items-center justify-end gap-4 lg:gap-6 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 lg:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search &quot;BAGGY JEANS&quot;"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder-gray-400"
              />
            </div>

            {/* Desktop Icons (Hidden on Mobile since they are in bottom nav) */}
            <div className="hidden lg:flex items-center gap-5">
              <button className="text-black hover:text-gray-600">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
              <button className="text-black hover:text-gray-600">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                  <path d="M3 6h18"></path>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </nav>
    </>
  );
}
