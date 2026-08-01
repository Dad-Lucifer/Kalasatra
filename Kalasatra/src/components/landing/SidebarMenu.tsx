import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../utils/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  slug: string;
  thumbnail_url: string;
  images: Array<{ url: string; alt: string; order: number }>;
}

interface ThumbItem {
  imgUrl: string;
  slug: string | null;
  alt: string;
}

// ─── Fallback images (same set as MatchTheMood) ───────────────────────────────

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1620012253295-c15cb3e71247?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507114845806-0347f6150324?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=400&auto=format&fit=crop',
];

/** Fisher-Yates shuffle — returns a new array */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Cache helpers (mirrors MatchTheMood) ────────────────────────────────────

function getSessionKey(): string {
  const token = localStorage.getItem('accessToken');
  const fp = token ? token.slice(0, 16) : 'guest';
  return `Kalastra_sidebar_products_${fp}`;
}

function loadCached(): Product[] | null {
  try {
    const raw = sessionStorage.getItem(getSessionKey());
    return raw ? (JSON.parse(raw) as Product[]) : null;
  } catch {
    return null;
  }
}

function saveCache(products: Product[]): void {
  try {
    sessionStorage.setItem(getSessionKey(), JSON.stringify(products));
  } catch {
    // sessionStorage full — skip silently
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const [thumbs, setThumbs] = useState<ThumbItem[]>([]);
  const [visible, setVisible] = useState(false);
  const allProductsRef = useRef<Product[]>([]);

  // ── Fetch product pool once (session-cached) ──────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cached = loadCached();
      if (cached && cached.length > 0) {
        if (!cancelled) allProductsRef.current = cached;
        return;
      }

      const res = await apiRequest<Product[]>('/products?limit=20&is_active=true');
      if (cancelled) return;

      if (res.success && res.data && res.data.length > 0) {
        saveCache(res.data);
        allProductsRef.current = res.data;
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Re-shuffle thumbnails every time sidebar opens ────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      return;
    }

    const pool = allProductsRef.current;

    if (pool.length > 0) {
      const picked = shuffle(pool).slice(0, 4);
      setThumbs(
        picked.map((p, i) => ({
          imgUrl: p.thumbnail_url || p.images?.[0]?.url || FALLBACK_IMGS[i % FALLBACK_IMGS.length],
          slug: p.slug ?? null,
          alt: p.name || `Collection ${i + 1}`,
        }))
      );
    } else {
      // API hasn't returned yet — use shuffled fallbacks
      const shuffledFallbacks = shuffle(FALLBACK_IMGS).slice(0, 4);
      setThumbs(
        shuffledFallbacks.map((imgUrl, i) => ({
          imgUrl,
          slug: null,
          alt: `Collection ${i + 1}`,
        }))
      );
    }

    // Small delay so the animation triggers after sidebar slides in
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-full sm:w-[400px] bg-white transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header - Desktop style (Close button + Title) */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <span className="font-bold text-sm tracking-widest uppercase">CATEGORIES</span>
          <div className="w-8"></div> {/* Spacer to center the title */}
        </div>

        {/* Mobile Search Bar */}
        <div className="p-4 sm:hidden border-b border-gray-100">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search &quot;LINEN SHIRTS&quot;"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder-gray-400"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-20">

          {/* Thumbnails Section — randomly shuffled on every open */}
          <div className="grid grid-cols-4 gap-2 p-4">
            {thumbs.map((thumb, idx) => {
              const content = (
                <img
                  src={thumb.imgUrl}
                  alt={thumb.alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(8px)',
                    transition: `opacity 0.4s ease ${idx * 60}ms, transform 0.4s ease ${idx * 60}ms`,
                  }}
                />
              );

              const wrapperClass =
                'block relative aspect-square bg-gray-100 overflow-hidden group';

              return thumb.slug ? (
                <Link
                  key={idx}
                  to={`/product/${thumb.slug}`}
                  className={wrapperClass}
                  onClick={onClose}
                >
                  {content}
                </Link>
              ) : (
                <div key={idx} className={wrapperClass}>
                  {content}
                </div>
              );
            })}
          </div>

          {/* Categories List */}
          <ul className="flex flex-col text-sm uppercase tracking-wider font-medium text-black">
            <li>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/#new-popular';
                }}
                className="w-full text-left block px-4 py-3 hover:bg-gray-50 cursor-pointer"
              >
                NEW ARRIVALS
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/#new-popular';
                }}
                className="w-full text-left block px-4 py-3 hover:bg-gray-50 cursor-pointer"
              >
                VIEW ALL
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/#new-popular';
                }}
                className="w-full text-left block px-4 py-3 hover:bg-gray-50 cursor-pointer"
              >
                BESTSELLERS
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/products/mens-collection';
                }}
                className="w-full text-left block px-4 py-3 hover:bg-gray-50 cursor-pointer"
              >
                Mens
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/products/womens-collection';
                }}
                className="w-full text-left block px-4 py-3 hover:bg-gray-50 cursor-pointer"
              >
                Women
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/products/kids-collection';
                }}
                className="w-full text-left block px-4 py-3 hover:bg-gray-50 cursor-pointer"
              >
                Kids
              </button>
            </li>
          </ul>

        </div>
      </div>
    </>
  );
}
