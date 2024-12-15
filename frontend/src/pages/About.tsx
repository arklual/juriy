import React from 'react';
import { ShoppingBag, Clock, Bell, Shield } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Ideal Pick</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your trusted companion for finding the best deals on Wildberries. We help you save money
          by tracking prices and alerting you when items go on sale.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="text-center p-6">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Smart Shopping</h3>
          <p className="text-gray-600">Find the best deals across thousands of products</p>
        </div>

        <div className="text-center p-6">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
          <p className="text-gray-600">Monitor prices 24/7 and never miss a deal</p>
        </div>

        <div className="text-center p-6">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Price Alerts</h3>
          <p className="text-gray-600">Get notified when prices drop on your favorite items</p>
        </div>

        <div className="text-center p-6">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Trusted Service</h3>
          <p className="text-gray-600">Reliable price comparison and deal verification</p>
        </div>
      </div>

      <div className="bg-purple-50 rounded-2xl p-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 mb-8">
            We believe everyone deserves to get the best value for their money. Our mission is to make
            smart shopping easier by providing real-time price tracking and alerts for Wildberries products.
            We help you make informed decisions and save money on your purchases.
          </p>
          <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Start Saving Today
          </button>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Have Questions?</h2>
        <p className="text-lg text-gray-700 mb-8">
          Our team is here to help you make the most of our service.
          Feel free to reach out with any questions or feedback.
        </p>
        <button className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
          Contact Us
        </button>
      </div>
    </div>
  );
}