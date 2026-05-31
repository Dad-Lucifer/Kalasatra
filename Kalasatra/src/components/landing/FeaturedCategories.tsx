import { Link } from 'react-router-dom';

const categories = [
  {
    id: 'shirts',
    name: 'SHIRTS',
    imgUrl: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=400&h=400&fit=crop',
  },
  {
    id: 'trousers',
    name: 'TROUSERS',
    imgUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop',
  },
  {
    id: 'polos',
    name: 'POLOS',
    imgUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop',
  },
  {
    id: 'jeans',
    name: 'JEANS',
    imgUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
  },
  {
    id: 'cargos',
    name: 'CARGOS',
    imgUrl: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=400&h=400&fit=crop', // Placeholder for cargos
  },
  {
    id: 't-shirts',
    name: 'T-SHIRTS',
    imgUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
  },
  {
    id: 'shorts',
    name: 'SHORTS',
    imgUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop',
  },
  {
    id: 'plus-size',
    name: 'PLUS SIZE',
    badge: '3XL TO 6XL',
    imgUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop',
  },
  {
    id: 'shoes',
    name: 'SHOES',
    badge: 'JUST LAUNCHED',
    imgUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
  },
];

export default function FeaturedCategories() {
  return (
    <section className="w-full bg-white py-10 lg:py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        
        {/* Section Title */}
        <div className="flex justify-center mb-8 lg:mb-12">
          <h2 className="text-xl lg:text-2xl font-bold tracking-widest uppercase">
            FEATURED CATEGORIES
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 lg:gap-4">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/category/${category.id}`}
              className="group flex flex-col relative bg-[#f8f8f8] aspect-[3/4] overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors"
            >
              {/* Category Name & Badge */}
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
                <span className="text-sm font-semibold tracking-wider text-black">
                  {category.name}
                </span>
                {category.badge && (
                  <span className="text-[9px] font-bold tracking-wider text-[#d35a38] border border-[#d35a38]/30 bg-white/80 backdrop-blur px-1.5 py-0.5 rounded-full whitespace-nowrap ml-2">
                    {category.badge}
                  </span>
                )}
              </div>

              {/* Product Image */}
              {/* Using a wrapper to simulate the 'cutout' look from the UI. The images are placeholders. */}
              <div className="absolute inset-0 flex items-center justify-center p-6 mt-6">
                <img 
                  src={category.imgUrl} 
                  alt={category.name}
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Bottom Gradient Overlay (to mimic the UI's bottom shadow fade) */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-300/80 to-transparent mix-blend-multiply opacity-60"></div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
