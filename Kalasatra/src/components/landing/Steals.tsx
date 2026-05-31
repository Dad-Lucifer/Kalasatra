export default function Steals() {
  return (
    <section className="w-full bg-white py-10 lg:py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        
        {/* Section Title */}
        <div className="flex justify-center mb-8 lg:mb-12">
          <h2 className="text-xl lg:text-2xl font-bold tracking-widest uppercase text-black">
            STEALS
          </h2>
        </div>

        {/* Grid Layout: 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
          
          {/* Card 1: Shirts Under 999 */}
          <div className="relative aspect-square bg-[#f0f0f0] overflow-hidden group cursor-pointer border border-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=600&fit=crop" 
              alt="Shirts Under 999"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Soft white fade for text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-transparent opacity-80" />
            
            <div className="absolute top-4 left-4 lg:top-6 lg:left-6 flex flex-col items-start z-10">
              <span className="text-[#d35a38] text-sm lg:text-base font-semibold tracking-wide mb-1">Shirts</span>
              <span className="text-gray-600 text-[10px] lg:text-xs font-medium uppercase tracking-widest">Under</span>
              <span className="text-black text-3xl lg:text-4xl font-bold tracking-tighter leading-none mt-1">₹999</span>
            </div>
          </div>

          {/* Card 2: SALE graphic */}
          <div className="relative aspect-square bg-gray-100 overflow-hidden group cursor-pointer flex items-center justify-center border border-gray-200">
            {/* Pattern Background (using CSS grid pattern or image) */}
            <div 
              className="absolute inset-0 opacity-10" 
              style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '8px 8px' }}
            />
            
            <h3 className="text-5xl lg:text-7xl font-light tracking-widest z-10 bg-gradient-to-r from-[#d35a38] via-[#e69832] to-[#d35a38] bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500">
              SALE
            </h3>
          </div>

          {/* Card 3: T-shirts Starting at 499 */}
          <div className="relative aspect-square bg-[#f0f0f0] overflow-hidden group cursor-pointer border border-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop" 
              alt="T-shirts Starting at 499"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-transparent opacity-80" />
            
            <div className="absolute top-4 left-4 lg:top-6 lg:left-6 flex flex-col items-start z-10">
              <span className="text-[#d35a38] text-sm lg:text-base font-semibold tracking-wide mb-1">T-shirts</span>
              <span className="text-gray-600 text-[10px] lg:text-xs font-medium uppercase tracking-widest">Starting at</span>
              <span className="text-black text-3xl lg:text-4xl font-bold tracking-tighter leading-none mt-1">₹499</span>
            </div>
          </div>

          {/* Card 4: Sticky Note graphic */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group cursor-pointer flex items-center justify-center border border-gray-200">
             {/* Diagonal stripes background effect */}
             <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_11px)]" />
             
             {/* Sticky Note */}
             <div className="relative w-[75%] h-[75%] bg-white shadow-xl rotate-1 group-hover:rotate-0 transition-transform duration-500 flex flex-col items-center justify-center p-6 text-center">
                {/* Paperclip */}
                <div className="absolute -top-4 right-6 w-5 h-12 border-2 border-gray-400 rounded-full bg-transparent transform rotate-12 z-20 shadow-sm" />
                
                <span className="text-gray-500 text-[10px] lg:text-xs font-medium uppercase tracking-widest mb-1">900+</span>
                <span className="text-[#d35a38] text-2xl lg:text-3xl font-bold tracking-tight mb-2">
                  XL & <span className="opacity-90">XXL</span>
                </span>
                <span className="text-gray-600 text-[10px] lg:text-xs font-medium uppercase tracking-widest mb-1">Styles At</span>
                <span className="text-black text-3xl lg:text-4xl font-bold tracking-tighter leading-none">₹499</span>
             </div>
          </div>

        </div>

      </div>
    </section>
  );
}
