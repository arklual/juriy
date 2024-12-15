import React from 'react';
import { ArrowRight } from 'lucide-react';
import DealCard from '../components/DealCard';

interface Category {
  id: string;
  name: string;
  image: string;
  dealCount: number;
  featured: {
    title: string;
    image: string;
    originalPrice: number;
    discountedPrice: number;
    discount: number;
    brand: string;
  };
}

export default function Categories() {
  const categories: Category[] = [
    {
      id: 'clothing',
      name: 'Clothing',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80',
      dealCount: 156,
      featured: {
        title: "Women's Winter Collection 2024",
        image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80",
        originalPrice: 12999,
        discountedPrice: 6499,
        discount: 50,
        brand: "Northern Style"
      }
    },
    {
      id: 'shoes',
      name: 'Shoes',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80',
      dealCount: 89,
      featured: {
        title: "Premium Leather Sneakers",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80",
        originalPrice: 8999,
        discountedPrice: 5399,
        discount: 40,
        brand: "SportMax"
      }
    },
    {
      id: 'accessories',
      name: 'Accessories',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80',
      dealCount: 124,
      featured: {
        title: "Designer Handbag Collection",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80",
        originalPrice: 15999,
        discountedPrice: 9599,
        discount: 40,
        brand: "LuxStyle"
      }
    },
    {
      id: 'beauty',
      name: 'Beauty',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80',
      dealCount: 92,
      featured: {
        title: "Luxury Skincare Set",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80",
        originalPrice: 5999,
        discountedPrice: 3599,
        discount: 40,
        brand: "BeautyLux"
      }
    },
    {
      id: 'electronics',
      name: 'Electronics',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80',
      dealCount: 78,
      featured: {
        title: "Smart Gadgets Collection",
        image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80",
        originalPrice: 29999,
        discountedPrice: 19999,
        discount: 33,
        brand: "TechPro"
      }
    },
    {
      id: 'home',
      name: 'Home & Living',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80',
      dealCount: 143,
      featured: {
        title: "Modern Home Decor Set",
        image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80",
        originalPrice: 9999,
        discountedPrice: 5999,
        discount: 40,
        brand: "HomeLux"
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shop by Category</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="relative h-48">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-4 w-full">
                  <h2 className="text-xl font-bold text-white">{category.name}</h2>
                  <p className="text-purple-200">{category.dealCount} active deals</p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-700 mb-4">Featured Deal</h3>
              <DealCard {...category.featured} />
              
              <button className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
                View All Deals
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}