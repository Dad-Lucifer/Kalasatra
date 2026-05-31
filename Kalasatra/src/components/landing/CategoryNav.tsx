import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  { label: 'Mens', slug: 'mens-collection' },
  { label: 'Womens', slug: 'womens-collection' },
  { label: 'Kids', slug: 'kids-collection' },
];

export default function CategoryNav() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Discover');

  return (
    <div className="w-full bg-white border-b border-gray-100 overflow-x-auto hide-scrollbar">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <ul className="flex items-center gap-6 lg:gap-8 min-w-max h-12">
          {categories.map((cat) => (
            <li key={cat.label} className="h-full flex items-center relative">
              <button
                onClick={() => {
                  setActiveCategory(cat.label);
                  navigate(`/products/${cat.slug}`);
                }}
                className={`text-sm lg:text-[15px] font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.label 
                    ? 'text-black' 
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {cat.label}
              </button>
              {activeCategory === cat.label && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#d35a38]"></div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
