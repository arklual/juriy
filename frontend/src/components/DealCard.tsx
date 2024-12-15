import React from 'react';
import { Heart, TrendingUp } from 'lucide-react';

interface DealCardProps {
  title: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  brand: string;
}

export default function DealCard({
  title,
  image,
  originalPrice,
  discountedPrice,
  discount,
  brand,
}: DealCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-2 right-2">
          <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
            <Heart className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="absolute top-2 left-2">
          <span className="bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
            -{discount}%
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm text-gray-500 mb-1">{brand}</h3>
        <h2 className="font-semibold text-gray-800 mb-2 line-clamp-2">{title}</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-purple-700">₽{discountedPrice}</p>
            <p className="text-sm text-gray-500 line-through">₽{originalPrice}</p>
          </div>
          <div className="flex items-center text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Trending</span>
          </div>
        </div>
      </div>
    </div>
  );
}