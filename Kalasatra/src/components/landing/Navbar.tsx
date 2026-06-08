import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../../assets/kalastra-logo.png';
import SidebarMenu from './SidebarMenu';

const decodeJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const idToken = localStorage.getItem('idToken');
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const tokenPayload = isLoggedIn && idToken ? decodeJwt(idToken) : null;
  const userName = tokenPayload?.name || tokenPayload?.email || 'User';
  const userEmail = tokenPayload?.email || '';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleOpenSidebar = () => setIsSidebarOpen(true);
    window.addEventListener('open-sidebar', handleOpenSidebar);
    return () => window.removeEventListener('open-sidebar', handleOpenSidebar);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('idToken');
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <>
      <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={`sticky top-0 z-40 transition-all duration-500 border-b ${
          scrolled 
            ? 'bg-black/80 backdrop-blur-md border-[#D4AF37]/30 shadow-[0_4px_30px_rgba(212,175,55,0.1)]' 
            : 'bg-black border-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
            
            {/* Left: Hamburger */}
            <div className="flex items-center">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-[#D4AF37] hover:text-white transition-colors focus:outline-none"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Center: Logo */}
            <Link to="/" className="hidden lg:flex flex-1 justify-center items-center group relative">
               <div className="flex items-center gap-3 justify-center">
                  <img 
                    src={logoImg} 
                    alt="Kalastra Logo" 
                    className="h-12 lg:h-16 w-auto object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.3)] transition-all duration-700 group-hover:scale-110 group-hover:rotate-6" 
                  />
                  <span 
                    className="text-3xl lg:text-4xl tracking-[0.4em] uppercase font-black text-[#D4AF37] drop-shadow-[0_2px_15px_rgba(212,175,55,0.3)] transition-all duration-700 group-hover:tracking-[0.5em] group-hover:drop-shadow-[0_0_25px_rgba(212,175,55,0.8)] group-hover:text-white"
                  >
                    KALASTRA
                  </span>
               </div>
            </Link>

            {/* Right: Search + Icons */}
            <div className="flex flex-1 lg:flex-none items-center justify-end gap-4 lg:gap-8 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 lg:w-72 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#D4AF37]/50 group-focus-within:text-[#D4AF37] transition-colors">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="SEARCH &quot;BAGGY JEANS&quot;"
                  className="w-full pl-10 pr-4 py-2 border-b border-[#D4AF37]/20 bg-transparent text-xs font-bold tracking-widest text-[#D4AF37] focus:outline-none focus:border-[#D4AF37] transition-all placeholder-[#D4AF37]/30"
                />
              </div>

              {/* Desktop Icons */}
              <div className="hidden lg:flex items-center gap-6">
                {/* Profile */}
                <div className="relative" ref={dropdownRef}>
                  {isLoggedIn ? (
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 text-[#D4AF37] hover:text-white transition-colors"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span className="text-xs font-bold tracking-widest uppercase max-w-[100px] truncate">{userName}</span>
                    </button>
                  ) : (
                    <button onClick={() => navigate('/auth')} className="text-[#D4AF37] hover:text-white transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </button>
                  )}

                  <AnimatePresence>
                    {profileOpen && isLoggedIn && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-4 w-56 bg-zinc-900 border border-[#D4AF37]/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-2 z-50 rounded-sm"
                      >
                        <div className="px-5 py-3 border-b border-[#D4AF37]/10 mb-2">
                          <p className="text-sm font-bold tracking-wider text-[#D4AF37] truncate">{userName}</p>
                          <p className="text-[10px] tracking-widest text-white/50 truncate uppercase mt-1">{userEmail}</p>
                        </div>
                        <Link
                          to="/dashboard"
                          className="block w-full text-left px-5 py-3 text-xs font-bold tracking-widest uppercase text-white hover:text-[#D4AF37] hover:bg-black transition-colors"
                        >
                          My Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-5 py-3 text-xs font-bold tracking-widest uppercase text-red-400 hover:text-red-300 hover:bg-black transition-colors cursor-pointer"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Cart */}
                <button onClick={() => navigate('/cart')} className="text-[#D4AF37] hover:text-white transition-colors relative group">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                    <path d="M3 6h18"></path>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#D4AF37] text-black text-[9px] font-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    0
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>
      </motion.nav>
    </>
  );
}
