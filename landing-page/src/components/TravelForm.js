import React, { useState, useEffect } from 'react';

const popularDestinations = [
  "Paris", "Tokyo", "New York", "Rome", "London", "Barcelona", "Sydney", 
  "Amsterdam", "Dubai", "Singapore", "Bangkok", "Istanbul", "Prague", 
  "Rio de Janeiro", "Venice", "San Francisco", "Bali", "Marrakech", 
  "Cape Town", "Kyoto"
];

function TravelForm({ onSubmit, isLoading, error, isGenerationComplete,isVerified }) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [budget, setBudget] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isGenerationComplete) {
      setIsSubmitted(false);
    }
  }, [isGenerationComplete]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    const budgetInt = parseInt(budget, 10);
    onSubmit(destination, days, budgetInt, email);
  };

  const handleRandomDestination = () => {
    const randomIndex = Math.floor(Math.random() * popularDestinations.length);
    setDestination(popularDestinations[randomIndex]);
  };

  const handleBudgetChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setBudget(value);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-900 mb-1">Destination</label>
          <div className="flex rounded-md shadow-sm">
            <input
              type="text"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Paris, Tokyo, New York"
              className="flex-grow min-w-0 block w-full px-4 py-3 rounded-l-md bg-white border-2 border-green-700 text-gray-800 placeholder-gray-600 focus:ring-2 focus:ring-green-300 focus:border-green-300 sm:text-sm transition duration-150 ease-in-out"
              required
            />
            <button
              type="button"
              onClick={handleRandomDestination}
              className="inline-flex items-center px-4 py-3 border-2 border-green-700 rounded-r-md bg-green-700 text-white text-sm hover:bg-green-800 hover:border-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out ml-1"
            >
              Random
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="days" className="block text-sm font-medium text-gray-900 mb-1">Number of Days</label>
            <input
              type="number"
              id="days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              min="1"
              placeholder="e.g., 7"
              className="block w-full px-4 py-3 bg-white border-2 border-green-700 text-gray-800 placeholder-gray-600 rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-300 sm:text-sm transition duration-150 ease-in-out"
              required
            />
          </div>
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-900 mb-1">Budget (USD)</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-900 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                id="budget"
                value={budget}
                onChange={handleBudgetChange}
                placeholder="e.g., 1000"
                className="block w-full pl-7 pr-12 py-3 bg-white border-2 border-green-700 text-gray-900 placeholder-gray-600 rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-300 sm:text-sm transition duration-150 ease-in-out"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-900 sm:text-sm">USD</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-4 py-3 bg-white border-2 border-green-700 text-gray-800 placeholder-gray-600 rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-300 sm:text-sm transition duration-150 ease-in-out"
            placeholder="your@email.com"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || isSubmitted || !isVerified}
        >
          {isLoading ? 'Generating...' : 'Generate Itinerary'}
        </button>
        <p className="text-sm text-center text-gray-700 mt-2">
          If you already have an account, we'll log you in.
        </p>
      </form>
      {isLoading && (
        <div className="text-center mt-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-700"></div>
          <p className="mt-2 text-sm text-gray-200">Generating your itinerary...</p>
        </div>
      )}
      {error && (
        <div className="text-red-300 text-sm mt-4">
          {error}
        </div>
      )}
    </div>
  );
}

export default TravelForm;