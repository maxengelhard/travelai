import React from 'react';
import { Link } from 'react-router-dom';

const PricingOption = ({ title, price, credits, description, isPopular, monthly }) => (
  <div className={`bg-gray-800 rounded-lg shadow-lg p-6 ${isPopular ? 'border-2 border-blue-400' : ''}`}>
    {isPopular && <span className="bg-blue-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide absolute -top-3 right-3">Most Popular</span>}
    <h3 className="text-xl font-semibold mb-4 text-white">{title}</h3>
    <p className="text-4xl font-bold mb-4 text-blue-400">${price} <span className="text-sm font-normal text-gray-300">{monthly ? '/ month': 'flat fee'}</span></p>
    <p className="mb-4 text-gray-300">{credits} credits</p>
    <p className="mb-6 text-gray-400">{description}</p>
    <Link to="/signup" className="block w-full bg-blue-500 text-white text-center py-2 rounded-lg hover:bg-blue-600 transition duration-300">Get Started</Link>
  </div>
);

const Pricing = () => {
  return (
    <div className="bg-black min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto pt-16">
        <h2 className="text-3xl font-extrabold text-white text-center mb-12">Choose Your Travel Plan</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <PricingOption
            title="Starter"
            price="20"
            credits="100 lifetime credits"
            description="Perfect for planning your next trip. Get access to your initial prompt and start planning your dream vacation."
            monthly={false}
          />
          <PricingOption
            title="Pro"
            price="20"
            credits="1,000 credits / month"
            description="Ideal for frequent travelers. Enjoy more credits each month for comprehensive trip planning."
            isPopular={true}
            monthly={true}
          />
          <PricingOption
            title="Jet Setter"
            price="100"
            credits="100,000 credits / month"
            description="For the ultimate travel enthusiasts. Unlimited planning possibilities for multiple trips."
            monthly={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Pricing;