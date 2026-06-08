import { motion } from 'framer-motion';

const moodItems = [
  {
    id: 1,
    title1: 'FORMAL',
    title2: 'WEAR',
    imgUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 2,
    title1: 'HOLIDAY',
    title2: 'ENERGY',
    imgUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 3,
    title1: 'SUMMER',
    title2: 'ESCAPE',
    imgUrl: 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 4,
    title1: 'BASICS',
    title2: 'DAILY',
    imgUrl: 'https://images.unsplash.com/photo-1620012253295-c15cb3e71247?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 5,
    title1: 'LUXURY',
    title2: 'REFINED',
    imgUrl: 'https://images.unsplash.com/photo-1507114845806-0347f6150324?q=80&w=800&auto=format&fit=crop',
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] as const } 
  },
};

export default function MatchTheMood() {
  return (
    <section className="w-full bg-black py-20 lg:py-32 overflow-hidden border-t border-white/5">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        
        {/* Section Title */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center mb-16 text-center"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-[#D4AF37]/50" />
            <span className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase">
              Vibe Check
            </span>
            <div className="w-12 h-[1px] bg-[#D4AF37]/50" />
          </div>
          <h2 className="text-3xl lg:text-5xl font-black tracking-widest uppercase text-white drop-shadow-xl">
            MATCH THE MOOD
          </h2>
        </motion.div>

        {/* Horizontal Scroll on Mobile, Grid on Desktop */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-4 lg:gap-6 pb-8 lg:pb-0 -mx-6 px-6 lg:mx-0 lg:px-0 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {moodItems.map((item) => (
            <motion.div 
              key={item.id} 
              variants={cardVariants}
              className="relative flex-none w-[75vw] sm:w-[45vw] lg:w-auto aspect-[3/4] group cursor-pointer overflow-hidden bg-zinc-900 border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all duration-700 snap-center"
            >
              {/* Image with subtle zoom on hover */}
              <img 
                src={item.imgUrl} 
                alt={`${item.title1} ${item.title2}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              
              {/* Base Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-700" />
              
              {/* Gold Tint Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/40 via-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-color" />

              {/* Gold Border Frame Effect (Inside) */}
              <div className="absolute inset-4 border border-[#D4AF37]/0 group-hover:border-[#D4AF37]/50 transition-all duration-700 scale-95 group-hover:scale-100" />

              {/* Text Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                <span className="text-[#D4AF37] text-2xl lg:text-3xl font-black tracking-widest uppercase mb-1 drop-shadow-md">
                  {item.title1}
                </span>
                <span className="text-white/80 group-hover:text-white text-xs lg:text-sm tracking-[0.3em] font-medium uppercase transition-colors duration-500">
                  {item.title2}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
