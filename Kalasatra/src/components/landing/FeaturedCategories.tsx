import { Link } from 'react-router-dom';

const categories = [
  {
    id: 'mens',
    name: 'MENS',
    imgUrl: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=400&h=400&fit=crop',
  },
  {
    id: 'womens',
    name: 'WOMENS',
    imgUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop',
  },
  {
    id: 'kids',
    name: 'KIDS',
    imgUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop',
  },
];

export default function FeaturedCategories() {
  return (
    <section className="w-full bg-pure-white py-10 lg:py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        
        {/* Section Title */}
        <div className="flex justify-center mb-8 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl font-heading font-bold tracking-widest uppercase text-deep-black">
            FEATURED CATEGORIES
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 lg:gap-4">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/category/${category.id}`}
              className="group flex flex-col relative bg-cold-white aspect-[3/4] overflow-hidden border border-cold-grey-light hover:border-deep-black transition-colors"
            >
              {/* Category Name - Visible on hover (desktop) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bg-cold-white/80 pointer-events-none">
                <span className="text-lg font-heading font-bold tracking-widest uppercase text-deep-black">
                  {category.name}
                </span>
              </div>

              {/* Product Image */}
              <div className="absolute inset-0 flex items-center justify-center p-6 mt-8">
                <img 
                  src={category.imgUrl} 
                  alt={category.name}
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Category Name - Visible on mobile at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-cold-white/90 md:hidden text-center">
                <span className="text-sm font-heading font-bold tracking-widest uppercase text-deep-black">
                  {category.name}
                </span>
              </div>

              {/* Bottom Gradient Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-cold-grey-light/50 to-transparent mix-blend-multiply opacity-60 transition-opacity group-hover:opacity-0 pointer-events-none md:bg-none"></div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
