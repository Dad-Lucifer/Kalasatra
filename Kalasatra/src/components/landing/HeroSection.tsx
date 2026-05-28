import { useState, useEffect } from 'react';
import heroImg from '../../assets/hero.png';

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-rich-black pt-20 md:pt-20">
      {/* Background Elements */} 
      <div className="absolute inset-0">
        {/* Gradient mesh backgrounds */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.08),transparent_70%)]" />
        
        {/* Animated blurred orbs */}
        <div className="absolute top-1/4 -right-20 w-125 h-125 bg-luxury-gold/8 rounded-full blur-[100px] animate-float" />
        <div className="absolute -bottom-20 -left-20 w-125 h-125 bg-luxury-gold/6 rounded-full blur-[100px]" style={{ transform: `translateY(${scrollY * 0.5}px)` }} />
        
        {/* Geometric accent lines */}
        <div className="absolute top-20 right-10 w-32 h-32 border border-luxury-gold/5 rotate-45" />
        <div className="absolute bottom-32 left-10 w-24 h-24 border border-luxury-gold/5 rotate-12" />
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-0 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8 lg:space-y-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-3 border border-luxury-gold/30 bg-luxury-gold/[0.08] backdrop-blur-sm animate-fade-in-up hover:border-luxury-gold/50 transition-all duration-300">
              <span className="w-2 h-2 rounded-full bg-luxury-gold animate-gold-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-luxury-gold">
                ✦ Premium Streetwear Est. 2024
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-5">
              <h1 className="font-heading text-6xl sm:text-7xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] tracking-tighter animate-fade-in-up-delay-1">
                <span className="text-soft-white block">Define Your</span>
                <span className="inline-block bg-gradient-to-r from-luxury-gold via-gold-light to-luxury-gold bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
                  Legacy
                </span>
              </h1>
            </div>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-soft-white/70 max-w-xl leading-relaxed animate-fade-in-up-delay-2 font-light">
              Kalasatra merges cultural heritage with contemporary edge. Premium streetwear crafted for those who refuse to blend in. Every piece is a statement.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up-delay-3 pt-2">
              <button className="group relative px-10 py-4 bg-luxury-gold text-rich-black font-bold uppercase tracking-[0.2em] text-sm overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]">
                <span className="relative z-10">Shop Collection</span>
                <span className="absolute inset-0 bg-gold-light scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </button>
              <button className="group relative px-10 py-4 border-2 border-soft-white/30 text-soft-white font-bold uppercase tracking-[0.2em] text-sm transition-all duration-300 hover:border-luxury-gold hover:text-luxury-gold">
                <span className="relative z-10">Our Story</span>
                <span className="absolute -inset-0.5 bg-luxury-gold/5 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-8 animate-fade-in-up-delay-3 border-t border-luxury-gold/10">
              <div>
                <span className="font-heading text-3xl font-bold text-luxury-gold">50+</span>
                <p className="text-xs tracking-[0.1em] uppercase text-soft-white/40 mt-1">
                  Premium Pieces
                </p>
              </div>
              <div className="w-px h-10 bg-luxury-gold/20" />
              <div>
                <span className="font-heading text-3xl font-bold text-luxury-gold">3K+</span>
                <p className="text-xs tracking-[0.1em] uppercase text-soft-white/40 mt-1">
                  Happy Clients
                </p>
              </div>
              <div className="w-px h-10 bg-luxury-gold/20" />
              <div>
                <span className="font-heading text-3xl font-bold text-luxury-gold">5★</span>
                <p className="text-xs tracking-[0.1em] uppercase text-soft-white/40 mt-1">
                  Rated Quality
                </p>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in-up-delay-2">
            <div className="relative aspect-[3/4] overflow-hidden">
              <div className="absolute -inset-4 bg-gradient-to-br from-luxury-gold/20 to-transparent blur-2xl" />
              <img
                src={heroImg}
                alt="Kalasatra Premium Streetwear"
                className="relative w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rich-black via-transparent to-transparent" />
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                <span className="px-3 py-1 bg-luxury-gold/20 backdrop-blur-md border border-luxury-gold/30 text-xs tracking-wider uppercase text-luxury-gold">
                  New Arrival
                </span>
                <span className="px-3 py-1 bg-rich-black/60 backdrop-blur-md border border-soft-white/10 text-xs tracking-wider uppercase text-soft-white">
                  Limited
                </span>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 lg:-bottom-6 lg:-right-6 bg-dark-charcoal border border-luxury-gold/20 p-5 lg:p-6 max-w-[200px] animate-float">
              <p className="text-xs uppercase tracking-[0.15em] text-luxury-gold font-medium mb-1">
                Premium Quality
              </p>
              <p className="text-sm text-soft-white/70 leading-relaxed">
                Handcrafted fabrics, precision fit — designed for those who demand more.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent" />
    </section>
  );
}
