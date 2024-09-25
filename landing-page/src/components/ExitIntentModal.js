import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ExitIntentModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [budget, setBudget] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    let lastY = 0;
    const handleMouseMove = (e) => {
      const currentY = e.clientY;
      if (currentY < lastY && currentY < 10 && !isVisible) {
        setIsVisible(true);
      }
      lastY = currentY;
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isVisible]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log({ email, destination, days, budget });
    setIsVisible(false);
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleOutsideClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-6xl w-full flex"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left side - Benefits */}
            <div className="w-1/2 pr-6 border-r border-gray-300">
              <h2 className="text-2xl font-bold mb-4">Trip Journey AI Itinerary Planner Benefits</h2>
              <ul className="space-y-2">
                {[
                  "Personalized travel plans tailored to your preferences",
                  "Save time on research and planning",
                  "Discover hidden gems and local favorites",
                  "Optimize your budget with smart recommendations",
                  "Real-time updates and adjustments to your itinerary",
                  "Access to exclusive deals and discounts",
                  "24/7 AI-powered travel assistant",
                  "Seamless integration with local transportation and booking systems",
                  "Customizable itineraries for any travel style",
                  "Reduce travel stress with expertly planned schedules"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right side - Form */}
            <div className="w-1/2 pl-6">
              <h2 className="text-2xl font-bold mb-4">Plan Your Dream Trip</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Destination</label>
                  <input
                    type="text"
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="days" className="block text-sm font-medium text-gray-700">Number of Days</label>
                  <input
                    type="number"
                    id="days"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Budget</label>
                  <input
                    type="number"
                    id="budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                    min="0"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Create My Itinerary
                </button>
              </form>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentModal;