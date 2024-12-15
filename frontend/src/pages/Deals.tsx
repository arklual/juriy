import React, { useState } from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import DealCard from '../components/DealCard';

export default function Deals() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const deals = [
    {
      title: "Women's Winter Coat Premium Collection",
      image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80",
      originalPrice: 12999,
      discountedPrice: 6499,
      discount: 50,
      brand: "Northern Style"
    },
    {
      title: "Premium Leather Sneakers",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80",
      originalPrice: 8999,
      discountedPrice: 5399,
      discount: 40,
      brand: "SportMax"
    },
    {
      title: "Designer Handbag Collection 2024",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80",
      originalPrice: 15999,
      discountedPrice: 9599,
      discount: 40,
      brand: "LuxStyle"
    },
    {
      title: "Premium Denim Jeans",
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80",
      originalPrice: 6999,
      discountedPrice: 3499,
      discount: 50,
      brand: "DenimCo"
    },
    {
      title: "Casual Summer Dress",
      image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&q=80",
      originalPrice: 4999,
      discountedPrice: 2499,
      discount: 50,
      brand: "Fashionista"
    },
    {
      title: "Sports Running Shoes",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80",
      originalPrice: 7999,
      discountedPrice: 4799,
      discount: 40,
      brand: "ActivePro"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Deals' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'shoes', name: 'Shoes' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'beauty', name: 'Beauty' },
    { id: 'electronics', name: 'Electronics' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Today's Best Deals</h1>
        <button className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
          <SlidersHorizontal className="h-5 w-5 mr-2" />
          Filters
        </button>
      </div>

      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {deals.map((deal, index) => (
          <DealCard key={index} {...deal} />
        ))}
      </div>
    </div>
  );
}