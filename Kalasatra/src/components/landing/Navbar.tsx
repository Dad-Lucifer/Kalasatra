import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'Men', href: '#men' },
  { label: 'Women', href: '#women' },
  { label: 'Kids', href: '#kids' },
  { label: 'Collections', href: '#collections' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-rich-black/95 backdrop-blur-lg shadow-[0_1px_0_rgba(212,175,55,0.15)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-20 lg:h-24">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-luxury-gold flex items-center justify-center">
              <span className="text-rich-black font-black text-sm tracking-widest">K</span>
            </div>
            <span className="font-heading text-2xl lg:text-3xl font-bold tracking-wide text-soft-white group-hover:text-luxury-gold transition-colors duration-300">
              Kalasatra
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative text-sm font-medium uppercase tracking-[0.15em] text-soft-white/70 hover:text-luxury-gold transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-luxury-gold after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/auth"
              className="px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.1rem] text-luxury-gold border border-luxury-gold/40 rounded-none hover:bg-luxury-gold hover:text-rich-black transition-all duration-300"
            >
              Sign In
            </Link>
            <button className="px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.1rem] bg-luxury-gold text-rich-black rounded-none hover:bg-gold-light transition-all duration-300">
              Explore
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-[2px] bg-soft-white transition-all duration-300 ${
                mobileOpen ? 'rotate-45 translate-y-[3.5px]' : ''
              }`}
            />
            <span
              className={`block w-6 h-[2px] bg-soft-white transition-all duration-300 ${
                mobileOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-6 h-[2px] bg-soft-white transition-all duration-300 ${
                mobileOpen ? '-rotate-45 translate-y-[-3.5px]' : ''
              }`}
            />
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-dark-charcoal/98 backdrop-blur-lg border-t border-luxury-gold/10 px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium uppercase tracking-[0.15em] text-soft-white/70 hover:text-luxury-gold transition-colors py-2"
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 pt-4 border-t border-luxury-gold/10">
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="flex-1 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1rem] text-luxury-gold border border-luxury-gold/40 hover:bg-luxury-gold hover:text-rich-black transition-all text-center"
            >
              Sign In
            </Link>
            <button className="flex-1 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1rem] bg-luxury-gold text-rich-black hover:bg-gold-light transition-all">
              Explore
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
