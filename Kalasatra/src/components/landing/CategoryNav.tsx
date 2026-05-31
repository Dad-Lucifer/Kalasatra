import { useState } from 'react';

const categories = [
  'Mens', 'Womens', 'Kids'
];

export default function CategoryNav() {
  const [activeCategory, setActiveCategory] = useState('Discover');

  return (
    <div className="w-full bg-white border-b border-gray-100 overflow-x-auto hide-scrollbar">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <ul className="flex items-center gap-6 lg:gap-8 min-w-max h-12">
          {categories.map((category) => (
            <li key={category} className="h-full flex items-center relative">
              <button
                onClick={() => setActiveCategory(category)}
                className={`text-sm lg:text-[15px] font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category 
                    ? 'text-black' 
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {category}
              </button>
              {activeCategory === category && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#d35a38]"></div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
