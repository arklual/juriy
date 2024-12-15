import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, ShoppingBag, Bell, Heart, User } from 'lucide-react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <nav className="bg-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <ShoppingBag className="h-8 w-8" />
                <span className="font-bold text-xl">Ideal Pick</span>
              </Link>
            </div>

            <div className="hidden md:block flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for deals..."
                  className="w-full px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link to="/deals" className="hover:text-purple-200 transition-colors">
                Deals
              </Link>
              <Link to="/categories" className="hover:text-purple-200 transition-colors">
                Categories
              </Link>
              <Bell className="h-6 w-6 cursor-pointer hover:text-purple-200 transition-colors" />
              <Heart className="h-6 w-6 cursor-pointer hover:text-purple-200 transition-colors" />
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => openAuth('signin')}
                  className="text-white hover:text-purple-200 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="bg-white text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md hover:text-purple-200 hover:bg-purple-600 focus:outline-none"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/deals"
                className="block px-3 py-2 rounded-md hover:bg-purple-600"
              >
                Deals
              </Link>
              <Link
                to="/categories"
                className="block px-3 py-2 rounded-md hover:bg-purple-600"
              >
                Categories
              </Link>
              <button
                onClick={() => openAuth('signin')}
                className="block w-full text-left px-3 py-2 rounded-md hover:bg-purple-600"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuth('signup')}
                className="block w-full text-left px-3 py-2 rounded-md hover:bg-purple-600"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />
    </>
  );
}