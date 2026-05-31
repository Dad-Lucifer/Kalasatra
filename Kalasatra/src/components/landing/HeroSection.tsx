import { useState } from 'react';

const carouselItems = [
  {
    id: 1,
    title: 'SUMMER SHIRTS',
    subtitle: 'STARTING AT ₹899',
    imgUrl: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=800&auto=format&fit=crop',
    desktopTitle: 'SHIRTS',
    desktopSubtitle: ''
  },
  {
    id: 2,
    title: 'TROUSERS',
    subtitle: 'THAT FINISH THE FIT',
    imgUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
    desktopTitle: 'TROSUERS',
    desktopSubtitle: 'THAT FINISH\nTHE FIT'
  },
  {
    id: 3,
    title: 'PERFUMES',
    subtitle: 'FLAT 50% OFF',
    imgUrl: 'https://images.unsplash.com/photo-1523293115678-d2906201736b?q=80&w=800&auto=format&fit=crop',
    badge: 'NEWLY LAUNCHED',
    desktopTitle: 'PERFUMES',
    desktopSubtitle: 'THAT MAKE AN IMPRESSION'
  }
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };

  return (
    <section className="relative w-full h-[calc(100vh-160px)] lg:h-[80vh] bg-cold-white overflow-hidden group">
      
      {/* Desktop Grid Layout (3 items visible) */}
      <div className="hidden lg:grid grid-cols-3 h-full w-full gap-1">
        {carouselItems.map((item) => (
          <div key={item.id} className="relative h-full w-full group/card cursor-pointer overflow-hidden">
            <img 
              src={item.imgUrl} 
              alt={item.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-deep-black/80 via-deep-black/20 to-transparent"></div>
            
            {item.badge && (
              <div className="absolute top-6 right-6 px-4 py-1.5 border border-pure-white/50 bg-deep-black/20 backdrop-blur-sm">
                <span className="text-pure-white text-xs tracking-widest uppercase">{item.badge}</span>
              </div>
            )}

            <div className="absolute bottom-12 left-8 right-8 flex justify-between items-end">
               <div>
                  <h2 className="text-pure-white text-4xl lg:text-5xl font-heading tracking-widest uppercase">{item.desktopTitle}</h2>
                  {item.desktopSubtitle && (
                     <p className="text-pure-white/80 text-sm tracking-widest mt-2 whitespace-pre-line text-right uppercase">
                       {item.desktopSubtitle}
                     </p>
                  )}
               </div>
            </div>
            
            {item.id === 3 && (
                <div className="absolute bottom-12 right-8">
                    <div className="px-6 py-2 border border-accent-yellow bg-deep-black/50 backdrop-blur-md">
                        <span className="text-accent-yellow text-sm font-bold tracking-widest uppercase">FLAT 50% OFF*</span>
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Carousel Layout */}
      <div className="lg:hidden relative w-full h-full">
        {carouselItems.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={item.imgUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-black/80 via-deep-black/20 to-transparent"></div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 px-6 text-center">
              <h2 className="text-pure-white text-4xl sm:text-5xl font-heading tracking-widest uppercase mb-4 shadow-sm">
                {item.title}
              </h2>
              {item.id === 1 ? (
                <button className="bg-accent-yellow text-deep-black px-8 py-3 font-bold text-sm tracking-widest uppercase shadow-lg hover:bg-pure-white transition-colors">
                  {item.subtitle}
                </button>
              ) : (
                <p className="text-pure-white text-sm tracking-widest uppercase">
                    {item.subtitle}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Mobile Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm transition"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm transition"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Pagination Dots (Desktop & Mobile) */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 ${
              index === currentIndex
                ? 'w-6 h-1 bg-accent-yellow rounded-full'
                : 'w-1.5 h-1.5 bg-pure-white/50 rounded-full'
            }`}
          />
        ))}
      </div>

    </section>
  );
}
