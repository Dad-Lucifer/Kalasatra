import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import hero1Img from '../../assets/men-hero-1.png';
import hero2Img from '../../assets/women-hero-1.png';
import hero3Img from '../../assets/kid-hero-1.png';

const carouselItems = [
  {
    id: 1,
    title: 'THE SUMMER EDIT',
    subtitle: 'BREATHABLE LUXURY. STARTING AT ₹899',
    imgUrl: hero1Img,
    cta: 'SHOP SHIRTS',
  },
  {
    id: 2,
    title: 'TAILORED FIT',
    subtitle: 'PRECISION CRAFTED TROUSERS.',
    imgUrl: hero2Img,
    cta: 'DISCOVER TROUSERS',
  },
  {
    id: 3,
    title: 'SIGNATURE SCENT',
    subtitle: 'LEAVE A LASTING IMPRESSION. FLAT 50% OFF.',
    imgUrl: hero3Img,
    badge: 'NEW ARRIVAL',
    cta: 'EXPLORE PERFUMES',
  },
];

// ── Slide variants: smooth easeInOut instead of heavy spring ─────────────────
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    transition: { duration: 0.65, ease: [0.32, 0.72, 0, 1] },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: { duration: 0.65, ease: [0.32, 0.72, 0, 1] },
  }),
};

// ── Text variants: simple fade-up, shorter duration ──────────────────────────
const textVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.12 + 0.2, duration: 0.5, ease: 'easeOut' },
  }),
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

export default function HeroSection() {
  const [[page, direction], setPage] = useState([0, 0]);
  const activeIndex = Math.abs(page % carouselItems.length);
  const currentItem = carouselItems[activeIndex];

  const paginate = useCallback((newDirection: number) => {
    setPage(([prev]) => [prev + newDirection, newDirection]);
  }, []);

  // ── Auto-play: single stable interval, no deps on `page` ─────────────────
  useEffect(() => {
    const timer = setInterval(() => paginate(1), 6000);
    return () => clearInterval(timer);
  }, [paginate]);

  return (
    <section className="relative w-full h-[calc(100vh-80px)] lg:h-screen bg-black overflow-hidden flex items-center justify-center">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) paginate(1);
            else if (swipe > swipeConfidenceThreshold) paginate(-1);
          }}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        >
          {/* Background Image — no mouse-move parallax (was the #1 perf killer) */}
          <img
            src={currentItem.imgUrl}
            alt={currentItem.title}
            fetchPriority={activeIndex === 0 ? 'high' : 'low'}
            loading={activeIndex === 0 ? 'eager' : 'lazy'}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlays */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 h-full flex flex-col justify-end pb-24 lg:pb-32 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div key={page} className="max-w-3xl">
            {currentItem.badge && (
              <motion.div
                custom={0} variants={textVariants} initial="hidden" animate="visible" exit="exit"
                className="mb-6 inline-block"
              >
                <span className="px-4 py-1.5 border border-[#D4AF37]/50 bg-black/30 backdrop-blur-md text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase">
                  {currentItem.badge}
                </span>
              </motion.div>
            )}

            <motion.h1
              custom={1} variants={textVariants} initial="hidden" animate="visible" exit="exit"
              className="text-white text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-6 drop-shadow-2xl"
              style={{ textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
            >
              {currentItem.title}
            </motion.h1>

            <motion.p
              custom={2} variants={textVariants} initial="hidden" animate="visible" exit="exit"
              className="text-white/80 text-sm md:text-base lg:text-lg tracking-[0.15em] md:tracking-[0.2em] uppercase max-w-xl mb-10"
            >
              {currentItem.subtitle}
            </motion.p>

            <motion.div
              custom={3} variants={textVariants} initial="hidden" animate="visible" exit="exit"
              className="pointer-events-auto"
            >
              <button className="group relative px-8 py-4 bg-white text-black font-bold tracking-[0.1em] uppercase text-sm overflow-hidden transition-all hover:text-[#D4AF37]">
                <span className="relative z-10 transition-colors duration-300">{currentItem.cta}</span>
                <div className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-12 right-6 lg:right-12 z-20 flex gap-4 pointer-events-auto">
        <button
          onClick={() => paginate(-1)}
          className="w-12 h-12 flex items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all duration-300 group"
        >
          <FiChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <button
          onClick={() => paginate(1)}
          className="w-12 h-12 flex items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 backdrop-blur-md text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300 group"
        >
          <FiChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-12 left-6 lg:left-12 z-20 flex items-center gap-4">
        <div className="text-white/50 text-xs font-bold tracking-[0.2em]">
          0{activeIndex + 1}
        </div>
        <div className="flex gap-2">
          {carouselItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setPage([i, i > activeIndex ? 1 : -1])}
              className="group py-2 pointer-events-auto"
            >
              <div className={`h-[2px] transition-all duration-500 rounded-full ${i === activeIndex ? 'w-12 bg-[#D4AF37]' : 'w-4 bg-white/30 group-hover:bg-white/60'}`} />
            </button>
          ))}
        </div>
        <div className="text-white/50 text-xs font-bold tracking-[0.2em]">
          0{carouselItems.length}
        </div>
      </div>
    </section>
  );
}
