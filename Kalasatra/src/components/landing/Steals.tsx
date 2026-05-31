export default function Steals() {
  return (
    <section className="w-full bg-pure-white py-10 lg:py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        
        {/* Section Title */}
        <div className="flex justify-center mb-8 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl font-heading font-bold tracking-widest uppercase text-deep-black">
            STEALS
          </h2>
        </div>

        {/* Grid Layout: 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
          
          {/* Card 1: Shirts Under 999 */}
          <div className="relative aspect-square bg-cold-white overflow-hidden group cursor-pointer border border-cold-grey-light hover:border-deep-black transition-colors">
            <img 
              src="https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=600&fit=crop" 
              alt="Shirts Under 999"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Soft white fade for text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-pure-white/90 via-pure-white/30 to-transparent opacity-90 transition-opacity group-hover:opacity-70" />
            
            <div className="absolute top-4 left-4 lg:top-6 lg:left-6 flex flex-col items-start z-10">
              <span className="text-deep-black text-sm lg:text-base font-bold tracking-widest uppercase mb-1">Shirts</span>
              <span className="text-cold-grey text-[10px] lg:text-xs font-medium uppercase tracking-widest">Under</span>
              <span className="text-deep-black text-3xl lg:text-4xl font-heading font-bold tracking-tighter leading-none mt-1">₹999</span>
            </div>
          </div>

          {/* Card 2: SALE graphic */}
          <div className="relative aspect-square bg-cold-white overflow-hidden group cursor-pointer flex items-center justify-center border border-cold-grey-light hover:border-deep-black transition-colors">
            {/* Pattern Background */}
            <div 
              className="absolute inset-0 opacity-20" 
              style={{ backgroundImage: 'radial-gradient(circle, var(--color-deep-black) 1px, transparent 1px)', backgroundSize: '8px 8px' }}
            />
            
            <h3 className="text-5xl lg:text-7xl font-heading font-bold tracking-widest z-10 bg-gradient-to-r from-accent-yellow via-[#E8C84A] to-accent-yellow bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500">
              SALE
            </h3>
          </div>

          {/* Card 3: T-shirts Starting at 499 */}
          <div className="relative aspect-square bg-cold-white overflow-hidden group cursor-pointer border border-cold-grey-light hover:border-deep-black transition-colors">
            <img 
              src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop" 
              alt="T-shirts Starting at 499"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-pure-white/90 via-pure-white/30 to-transparent opacity-90 transition-opacity group-hover:opacity-70" />
            
            <div className="absolute top-4 left-4 lg:top-6 lg:left-6 flex flex-col items-start z-10">
              <span className="text-deep-black text-sm lg:text-base font-bold tracking-widest uppercase mb-1">T-shirts</span>
              <span className="text-cold-grey text-[10px] lg:text-xs font-medium uppercase tracking-widest">Starting at</span>
              <span className="text-deep-black text-3xl lg:text-4xl font-heading font-bold tracking-tighter leading-none mt-1">₹499</span>
            </div>
          </div>

          {/* Card 4: Sticky Note graphic */}
          <div className="relative aspect-square bg-cold-white overflow-hidden group cursor-pointer flex items-center justify-center border border-cold-grey-light hover:border-deep-black transition-colors">
             {/* Diagonal stripes background effect */}
             <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,var(--color-cold-grey-light)_10px,var(--color-cold-grey-light)_11px)]" />
             
             {/* Minimalist Note */}
             <div className="relative w-[80%] h-[80%] bg-pure-white border border-deep-black shadow-none transition-transform duration-500 flex flex-col items-center justify-center p-6 text-center">
                
                <span className="text-cold-grey text-[10px] lg:text-xs font-medium uppercase tracking-widest mb-1">900+</span>
                <span className="text-accent-yellow text-2xl lg:text-3xl font-heading font-bold tracking-widest uppercase mb-2 drop-shadow-sm">
                  XL <span className="opacity-50">&</span> XXL
                </span>
                <span className="text-cold-grey text-[10px] lg:text-xs font-medium uppercase tracking-widest mb-1">Styles At</span>
                <span className="text-deep-black text-3xl lg:text-4xl font-heading font-bold tracking-tighter leading-none">₹499</span>
             </div>
          </div>

        </div>

      </div>
    </section>
  );
}
