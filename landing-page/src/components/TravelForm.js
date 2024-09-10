import React, { useState } from 'react';

const popularDestinations = [
  "Paris", "Tokyo", "New York", "Rome", "London", "Barcelona", "Sydney", 
  "Amsterdam", "Dubai", "Singapore", "Bangkok", "Istanbul", "Prague", 
  "Rio de Janeiro", "Venice", "San Francisco", "Bali", "Marrakech", 
  "Cape Town", "Kyoto"
];

function TravelForm({ onSubmit }) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [budget, setBudget] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter your email address');
      return;
    }
    onSubmit(
      destination || 'any destination',
      days || 'flexible duration',
      budget ? `$${budget}` : 'flexible budget',
      email
    );
  };

  const handleRandomDestination = () => {
    const randomIndex = Math.floor(Math.random() * popularDestinations.length);
    setDestination(popularDestinations[randomIndex]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">Destination (optional)</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Paris, Tokyo, New York"
            className="flex-grow min-w-0 block w-full px-3 py-2 rounded-l-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={handleRandomDestination}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          >
            Random
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-1">Number of Days (optional)</label>
        <input
          type="number"
          id="days"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          min="1"
          placeholder="e.g., 7"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
        />
      </div>
      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">Budget (USD, optional)</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            min="0"
            placeholder="e.g., 1000"
            className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">USD</span>
          </div>
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <label htmlFor="email" className="block text-sm font-medium text-blue-700 mb-1">Email (required)</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="your@email.com"
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:-translate-y-1 hover:scale-105"
      >
        Generate Itinerary
      </button>
    </form>
  );
}

export default TravelForm;