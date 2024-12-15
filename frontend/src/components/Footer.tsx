import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-purple-500" />
              <span className="font-bold text-xl text-white">Ideal Pick</span>
            </Link>
            <p className="mt-4 text-sm">
              Your trusted source for the best deals and discounts on Wildberries.
              Never miss out on savings again.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/deals" className="hover:text-purple-400">Deals</Link></li>
              <li><Link to="/categories" className="hover:text-purple-400">Categories</Link></li>
              <li><Link to="/about" className="hover:text-purple-400">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-purple-400">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link to="/categories/clothing" className="hover:text-purple-400">Clothing</Link></li>
              <li><Link to="/categories/shoes" className="hover:text-purple-400">Shoes</Link></li>
              <li><Link to="/categories/accessories" className="hover:text-purple-400">Accessories</Link></li>
              <li><Link to="/categories/beauty" className="hover:text-purple-400">Beauty</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="hover:text-purple-400">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="hover:text-purple-400">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="hover:text-purple-400">
                <Mail className="h-6 w-6" />
              </a>
            </div>
            <p className="text-sm">
              Subscribe to our newsletter for the latest deals and updates.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Ideal Pick. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}