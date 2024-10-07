import React, { useState } from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaRandom, FaEnvelope } from 'react-icons/fa';

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
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
      <div>
        <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">Destination (optional)</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            <FaMapMarkerAlt className="text-blue-500" />
          </span>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Paris, Tokyo, New York"
            className="flex-grow min-w-0 block w-full px-3 py-2 rounded-none border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={handleRandomDestination}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <FaRandom className="mr-2" /> Random
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-1">Number of Days (optional)</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaCalendarAlt className="text-gray-400" />
          </div>
          <input
            type="number"
            id="days"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            min="1"
            placeholder="e.g., 7"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">Budget (USD, optional)</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaDollarSign className="text-gray-400" />
          </div>
          <input
            type="number"
            id="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            min="0"
            placeholder="e.g., 1000"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email (required)</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaEnvelope className="text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out transform hover:-translate-y-1 hover:scale-105"
      >
        Generate Itinerary
      </button>
    </form>
  );
}

export default TravelForm;