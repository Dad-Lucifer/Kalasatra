import { useState } from 'react';

const tabs = ['ALL', 'SHIRTS', 'T-SHIRTS', 'JEANS', 'TROUSERS', 'SHOES', 'SHORTS', 'JACKETS'];

const products = [
  {
    id: 1,
    title: '100% Cotton Regular Fit Shirt',
    price: '₹1099',
    imgUrl: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=500&h=650&fit=crop',
    colors: ['#000000', '#D8B4E2', '#4169E1'],
    moreColors: '+3',
  },
  {
    id: 2,
    title: 'Straight Loose Fit Washed Jeans',
    price: '₹1899',
    imgUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=650&fit=crop',
  },
  {
    id: 3,
    title: 'Regular Fit Checks Shirt',
    price: '₹1399',
    imgUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&h=650&fit=crop',
  },
  {
    id: 4,
    title: 'Flared Fit Washed Jeans',
    price: '₹1899',
    imgUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=650&fit=crop',
  },
  {
    id: 5,
    title: 'Flared Fit Washed Jeans',
    price: '₹1899',
    imgUrl: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=500&h=650&fit=crop', // generic placeholder
  },
  {
    id: 6,
    title: 'Textured Casual Shirt',
    price: '₹1299',
    imgUrl: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500&h=650&fit=crop',
  },
  {
    id: 7,
    title: 'Classic White Shirt',
    price: '₹1199',
    imgUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=650&fit=crop',
  },
  {
    id: 8,
    title: 'Summer Linen Shirt',
    price: '₹1499',
    imgUrl: 'https://images.unsplash.com/photo-1507114845806-0347f6150324?w=500&h=650&fit=crop',
  },
  {
    id: 9,
    title: 'Minimalist White Shirt',
    price: '₹1099',
    imgUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=650&fit=crop',
  },
  {
    id: 10,
    title: 'Dark Melange Polo',
    price: '₹899',
    imgUrl: 'https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=500&h=650&fit=crop',
  }
];

export default function NewAndPopular() {
  const [activeTab, setActiveTab] = useState('ALL');

  return (
    <section className="w-full bg-pure-white py-10 lg:py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        
        {/* Section Title */}
        <div className="flex justify-center mb-6">
          <h2 className="text-2xl lg:text-3xl font-heading font-bold tracking-widest uppercase text-deep-black">
            NEW AND POPULAR
          </h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 sm:gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-none px-4 sm:px-5 py-1.5 text-[10px] sm:text-xs font-bold tracking-widest uppercase border border-deep-black transition-colors ${
                  activeTab === tab
                    ? 'bg-deep-black text-pure-white'
                    : 'bg-pure-white text-deep-black hover:bg-cold-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-5">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer flex flex-col">
              
              {/* Product Image Box */}
              <div className="relative aspect-[3/4] bg-cold-white overflow-hidden mb-3 border border-transparent group-hover:border-cold-grey-light transition-colors">
                <img 
                  src={product.imgUrl} 
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Wishlist Heart Icon */}
                <button className="absolute top-3 right-3 p-1 text-gray-500 hover:text-red-500 transition-colors z-10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-1 px-1">
                <h3 className="text-xs sm:text-sm text-cold-grey font-medium truncate mb-1 uppercase tracking-wider" title={product.title}>
                  {product.title}
                </h3>
                <span className="text-sm sm:text-base text-deep-black font-bold mb-2">
                  {product.price}
                </span>

                {/* Color Swatches (if any) */}
                {product.colors && (
                  <div className="flex items-center gap-1 mt-auto">
                    {product.colors.map((color, idx) => (
                      <div 
                        key={idx} 
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 border border-cold-grey-light"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    {product.moreColors && (
                      <span className="text-[10px] text-gray-500 ml-1 font-medium">
                        {product.moreColors}
                      </span>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
