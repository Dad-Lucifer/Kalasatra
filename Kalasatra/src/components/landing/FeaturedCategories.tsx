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
              {/* Category Name & Badge */}
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
                <span className="text-sm font-bold tracking-widest text-deep-black uppercase">
                  {category.name}
                </span>
                {category.badge && (
                  <span className="text-[10px] font-bold tracking-widest text-deep-black bg-accent-yellow px-2 py-1 uppercase whitespace-nowrap ml-2">
                    {category.badge}
                  </span>
                )}
              </div>

              {/* Product Image */}
              <div className="absolute inset-0 flex items-center justify-center p-6 mt-8">
                <img 
                  src={category.imgUrl} 
                  alt={category.name}
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Bottom Gradient Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-cold-grey-light/50 to-transparent mix-blend-multiply opacity-60 transition-opacity group-hover:opacity-0"></div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
