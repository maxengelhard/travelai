import React, { useState, useEffect } from 'react';
import TravelForm from './components/TravelForm';
import Itinerary from './components/Itinerary';
import Navigation from './components/Navigation';

const backgroundImages = [
  '/travel_images/destination1.jpg',
  '/travel_images/destination2.jpg',
  '/travel_images/destination3.jpg',
  '/travel_images/destination4.jpg',
  '/travel_images/destination5.jpg',
  '/travel_images/destination6.jpg',
  '/travel_images/destination7.jpg',
  '/travel_images/destination8.jpg',
];

function App() {
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);


  const generateItinerary = async (destination, days, budget) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destination, days: 1, budget }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setItinerary(data.itinerary);
      setShowPaymentPrompt(true);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      setItinerary("Sorry, there was an error generating your itinerary. Please try again.");
    }
    setIsLoading(false);
  };

  const handlePayment = () => {
    // Implement Stripe payment logic here
    console.log("Redirecting to payment...");
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Navigation />
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <div className="flex -rotate-12 transform scale-125 animate-slide">
          {backgroundImages.concat(backgroundImages).map((img, index) => (
            <div
              key={index}
              className="w-1/4 h-screen flex-shrink-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${img})` }}
            ></div>
          ))}
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center z-20 relative pt-32">
        <div className="container mx-auto px-4 py-12 flex">
          <div className="w-1/2 pr-8 text-white">
            <h1 className="text-4xl font-bold mb-4">Fire Your Travel Agent</h1>
            <p className="text-xl mb-4">🌍 Plan your dream vacation with AI</p>
            <ul className="list-disc list-inside mb-4">
              <li>📅 Get personalized day-by-day itineraries</li>
              <li>💰 Stay within your budget</li>
              <li>🏖️ Discover hidden gems and local favorites</li>
            </ul>
            <p className="text-lg">
              Save time and money by using our AI travel planner instead of hiring an expensive travel agent!
            </p>
          </div>
          <div className="w-1/2 bg-white bg-opacity-90 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Plan Your Trip</h2>
            <TravelForm onSubmit={generateItinerary} />
            {isLoading && <p className="mt-4 text-center">Generating your itinerary...</p>}
            {itinerary && <Itinerary plan={itinerary} />}
            {showPaymentPrompt && (
              <div className="mt-4 p-4 bg-blue-100 rounded">
                <p className="mb-2">Want to see the full itinerary? Sign up and pay to unlock all days!</p>
                <button
                  onClick={handlePayment}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Sign Up and Pay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;