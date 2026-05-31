import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
      <nav
        className={`sticky top-0 z-40 bg-pure-white border-b border-cold-grey-light transition-all duration-300 ${
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

          {/* Center: Logo */}
          <Link to="/" className="hidden lg:flex flex-1 justify-center items-center">
             <div className="flex items-center gap-3 justify-center h-14">
                <img src={logoImg} alt="Kalastra Logo" className="h-full w-auto object-contain" />
                <span 
                  className="text-2xl font-black tracking-[0.2em] uppercase text-deep-black font-heading"
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
                className="w-full pl-10 pr-4 py-2 border-b border-cold-grey-light bg-cold-white text-sm focus:outline-none focus:border-deep-black transition-colors placeholder-cold-grey text-deep-black"
              />
            </div>

            {/* Desktop Icons */}
            <div className="hidden lg:flex items-center gap-5">
              {/* Profile */}
              <div className="relative" ref={dropdownRef}>
                {isLoggedIn ? (
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 text-black hover:text-gray-600"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span className="text-sm font-medium max-w-[100px] truncate">{userName}</span>
                  </button>
                ) : (
                  <button onClick={() => navigate('/auth')} className="text-black hover:text-gray-600">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </button>
                )}

                {profileOpen && isLoggedIn && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-pure-white border border-cold-grey-light shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-cold-grey-light">
                      <p className="text-sm font-medium text-deep-black truncate">{userName}</p>
                      <p className="text-xs text-cold-grey truncate">{userEmail}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="block w-full text-left px-4 py-2.5 text-sm font-bold tracking-widest uppercase text-deep-black hover:bg-cold-white transition-colors"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold tracking-widest uppercase text-red-500 hover:bg-cold-white transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button onClick={() => navigate('/cart')} className="text-black hover:text-gray-600">
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
