import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const decodeJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

export default function BottomMobileNav() {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const idToken = localStorage.getItem('idToken');
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const tokenPayload = isLoggedIn && idToken ? decodeJwt(idToken) : null;
  const userName = tokenPayload?.name || tokenPayload?.email || 'User';
  const userEmail = tokenPayload?.email || '';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('idToken');
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex items-center justify-between px-6 py-2">
        
        {/* Home */}
        <Link to="/" className="flex flex-col items-center gap-1 min-w-[60px] p-2 bg-gray-100 rounded-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-black">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-[10px] font-medium text-black">Home</span>
        </Link>

        {/* Explore */}
        <Link to="/explore" className="flex flex-col items-center gap-1 min-w-[60px] p-2 text-gray-500 hover:text-black">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="11"></line>
            <line x1="11" y1="14" x2="11" y2="14"></line>
          </svg>
          <span className="text-[10px] font-medium">Explore</span>
        </Link>

        {/* NEW */}
        <Link to="/new" className="flex flex-col items-center justify-center min-w-[60px] p-2">
          <span className="text-base font-bold text-black tracking-widest">NEW</span>
        </Link>

        {/* Cart */}
        <Link to="/cart" className="flex flex-col items-center gap-1 min-w-[60px] p-2 text-gray-500 hover:text-black relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            <path d="M3 6h18"></path>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          {totalItems > 0 && (
            <span className="absolute top-1 right-3 w-4 h-4 bg-[#d35a38] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
              {totalItems}
            </span>
          )}
          <span className="text-[10px] font-medium">Cart</span>
        </Link>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          {isLoggedIn ? (
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex flex-col items-center gap-1 min-w-[60px] p-2 text-gray-500 hover:text-black"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span className="text-[10px] font-medium max-w-[60px] truncate">{userName}</span>
            </button>
          ) : (
            <Link to="/auth" className="flex flex-col items-center gap-1 min-w-[60px] p-2 text-gray-500 hover:text-black">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span className="text-[10px] font-medium">Profile</span>
            </Link>
          )}

          {profileOpen && isLoggedIn && (
            <div className="absolute bottom-full  -translate-x-1/2 mb-2 w-fit  bg-white border border-gray-200 shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-medium text-black truncate">{userName}</p>
                <p className="text-[10px] text-gray-500 truncate">{userEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
