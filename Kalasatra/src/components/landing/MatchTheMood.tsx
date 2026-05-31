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
    <section className="w-full bg-white py-10 lg:py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        
        {/* Section Title */}
        <div className="flex justify-center mb-8 lg:mb-12">
          <h2 className="text-xl lg:text-2xl font-bold tracking-widest uppercase text-black">
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
              {/* Background Image */}
              <img 
                src={item.imgUrl} 
                alt={`${item.title1} ${item.title2}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20 opacity-80" />

              {/* Text Overlay */}
              <div className="absolute top-8 left-0 right-0 flex flex-col items-center text-center">
                <span className="text-white text-2xl lg:text-3xl font-light tracking-wide">
                  {item.title1}
                </span>
                <span className="text-[#F2D022] text-sm lg:text-base tracking-[0.2em] font-medium -mt-1">
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
