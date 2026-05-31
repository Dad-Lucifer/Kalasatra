const moodItems = [
  {
    id: 1,
    title1: 'FORMAL',
    title2: 'WEAR',
    imgUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop',
  },
  {
    id: 2,
    title1: 'HOLIDAY',
    title2: 'ENERGY',
    imgUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop',
  },
  {
    id: 3,
    title1: 'SUMMER',
    title2: 'ESCAPE',
    imgUrl: 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=600&h=800&fit=crop',
  },
  {
    id: 4,
    title1: 'BASICS',
    title2: 'DAILY',
    imgUrl: 'https://images.unsplash.com/photo-1620012253295-c15cb3e71247?w=600&h=800&fit=crop',
  },
  {
    id: 5,
    title1: 'LUXURY',
    title2: 'REFINED',
    imgUrl: 'https://images.unsplash.com/photo-1507114845806-0347f6150324?w=600&h=800&fit=crop',
  }
];

export default function MatchTheMood() {
  return (
    <section className="w-full bg-pure-white py-10 lg:py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        
        {/* Section Title */}
        <div className="flex justify-center mb-8 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl font-heading font-bold tracking-widest uppercase text-deep-black">
            MATCH THE MOOD
          </h2>
        </div>

        {/* Horizontal Scroll on Mobile, Grid on Desktop */}
        <div className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-2 lg:gap-4 hide-scrollbar pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
          {moodItems.map((item) => (
            <div 
              key={item.id} 
              className="relative flex-none w-[70vw] sm:w-[45vw] lg:w-auto aspect-[3/4] group cursor-pointer overflow-hidden"
            >
              {/* Image with grayscale filter for cold look */}
              <img 
                src={item.imgUrl} 
                alt={`${item.title1} ${item.title2}`}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              />
              
              {/* Minimal White Box for Text */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-center bg-pure-white px-6 py-3 shadow-lg border-b-4 border-accent-yellow transition-transform duration-300 group-hover:-translate-y-2 w-[85%]">
                <span className="text-deep-black text-xl lg:text-2xl font-heading font-bold tracking-widest uppercase">
                  {item.title1}
                </span>
                <span className="text-cold-grey text-xs lg:text-sm tracking-[0.2em] font-medium mt-1 uppercase">
                  {item.title2}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
