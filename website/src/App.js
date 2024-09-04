import React, { useState } from 'react';
import TravelForm from './components/TravelForm';
import Itinerary from './components/Itinerary';

function App() {
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateItinerary = async (destination, days, budget) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destination, days, budget }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setItinerary(data.itinerary);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      setItinerary("Sorry, there was an error generating your itinerary. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Travel AI Itinerary Planner</h1>
          <TravelForm onSubmit={generateItinerary} />
          {isLoading && <p className="mt-4 text-center">Generating your itinerary...</p>}
          {itinerary && <Itinerary plan={itinerary} />}
        </div>
      </div>
    </div>
  );
}

export default App;