import React, { useState } from 'react';

const PricingOption = ({ title, yearlyPrice, monthlyPrice, credits, description, features, isPopular, stripeLink, isYearly }) => (
  <div className={`bg-gray-800 rounded-lg shadow-lg p-8 ${isPopular ? 'border-2 border-blue-400 relative' : ''}`}>
    {isPopular && (
      <span className="bg-blue-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide absolute -top-3 right-3">
        Most Popular
      </span>
    )}
    <h3 className="text-2xl font-semibold mb-4 text-white">{title}</h3>
    <p className="text-5xl font-bold mb-6 text-blue-400">
      ${isYearly ? yearlyPrice : (monthlyPrice * 12)} 
      <span className="text-sm font-normal text-gray-300">/ year</span>
      {isYearly ? (
        <span className="text-xl font-normal text-gray-500 line-through ml-2">${monthlyPrice * 12} / year</span>
      ) : (
        <span className="text-xl font-normal text-gray-300 ml-2">(${monthlyPrice} / month)</span>
      )}
    </p>
    <p className="mb-4 text-lg text-gray-300">{credits}</p>
    <p className="mb-6 text-gray-400">{description}</p>
    <ul className="mb-8 text-gray-300 space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {feature}
        </li>
      ))}
    </ul>
    <a 
      href={stripeLink} 
      className="block w-full bg-blue-500 text-white text-center py-3 rounded-lg hover:bg-blue-600 transition duration-300 text-lg font-semibold"
      target="_blank"
      rel="noopener noreferrer"
    >
      Get Started
    </a>
  </div>
);

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(true);

  const togglePricing = () => {
    setIsYearly(!isYearly);
  };

  return (
    <div className="bg-gray-900 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-white text-center mb-12">Choose Your Travel Plan</h2>
        <p className="text-xl text-gray-300 text-center mb-16 max-w-3xl mx-auto">
          Unlock the power of AI-driven travel planning with our flexible pricing options. 
          Whether you're an occasional traveler or a globetrotter, we have a plan for you.
        </p>
        <div className="flex justify-center mb-8">
          <button
            onClick={togglePricing}
            className={`px-4 py-2 rounded-l-lg ${isYearly ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
          >
            Yearly
          </button>
          <button
            onClick={togglePricing}
            className={`px-4 py-2 rounded-r-lg ${!isYearly ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
          >
            Monthly
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <PricingOption
            title="Pro"
            yearlyPrice={60}
            monthlyPrice={10}
            credits={isYearly ? "12,000 credits / year" : "1,000 credits / month"}
            description="Ideal for any traveler. Enjoy more credits each year for comprehensive trip planning."
            isPopular={true}
            stripeLink={isYearly ? process.env.REACT_APP_STRIPE_PRO_YEARLY_URL : process.env.REACT_APP_STRIPE_PRO_URL}
            features={[
              "Custom travel themes",
              "Edit your itinerary",
              "Create new itineraries",
              "Cost breakdowns",
              "Downloadable itineraries",
            ]}
            isYearly={isYearly}
          />
          <PricingOption
            title="Jet Setter"
            yearlyPrice={600}
            monthlyPrice={100}
            credits={isYearly ? "1,200,000 credits / year" : "100,000 credits / month"}
            description="For the ultimate travel enthusiasts. Unlimited planning possibilities."
            isPopular={false}
            stripeLink={isYearly ? process.env.REACT_APP_STRIPE_JETSETTER_YEARLY_URL : process.env.REACT_APP_STRIPE_JET_SETTER_URL}
            features={[
              "All Pro features",
              "Priority customer support",
              "VIP experiences access",
              "Multi-city trip planning",
            ]}
            isYearly={isYearly}
          />
        </div>
      </div>
    </div>
  );
};

export default Pricing;