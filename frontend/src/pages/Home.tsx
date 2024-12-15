import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Clock, Tag } from 'lucide-react';
import DealCard from '../components/DealCard';

export default function Home() {
  const featuredDeals = [
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
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden mb-12">
        <img
          src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80"
          alt="Hero"
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-purple-900/40 flex items-center">
          <div className="px-8 sm:px-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Discover Amazing Deals<br />on Wildberries
            </h1>
            <p className="text-lg text-purple-100 mb-8 max-w-xl">
              Never miss out on the best discounts. We monitor prices 24/7 to bring you
              the most incredible savings.
            </p>
            <Link
              to="/deals"
              className="bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors inline-flex items-center"
            >
              Browse Deals
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <Sparkles className="h-10 w-10 text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Best Deals</h3>
          <p className="text-gray-600">Curated selection of the biggest discounts available right now</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <Clock className="h-10 w-10 text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
          <p className="text-gray-600">Price drops and new deals updated every minute</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <Tag className="h-10 w-10 text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Price History</h3>
          <p className="text-gray-600">Track price changes and find the best time to buy</p>
        </div>
      </div>

      {/* Featured Deals */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Deals</h2>
          <Link to="/deals" className="text-purple-600 hover:text-purple-700 font-semibold inline-flex items-center">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDeals.map((deal, index) => (
            <DealCard key={index} {...deal} />
          ))}
        </div>
      </div>
    </div>
  );
}