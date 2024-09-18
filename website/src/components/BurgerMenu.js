import React, { useState } from 'react';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';

const BurgerMenu = ({ userInfo, previousItineraries, onSelectItinerary, selectedItineraryId, onUserButtonClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleItineraryClick = (itinerary) => {
    localStorage.setItem('selectedItineraryId', itinerary.itinerary_id);
    onSelectItinerary(itinerary.itinerary_id);
    toggleMenu();
  };

  return (
    <div className="md:hidden">
      <button onClick={toggleMenu} className="fixed top-4 right-4 z-50">
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-white z-40 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">User Info</h2>
              <button 
                onClick={() => {
                  onUserButtonClick();
                  toggleMenu();
                }}
                className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full"
              >
                <FaUser />
              </button>
            </div>
            <p><strong>Email:</strong> {userInfo.email}</p>
            <p><strong>Credits:</strong> {userInfo.credits}</p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Previous Itineraries</h2>
            {previousItineraries.map((itinerary) => (
              <div
                key={itinerary.itinerary_id}
                className={`p-4 mb-4 rounded-lg cursor-pointer ${
                  selectedItineraryId === itinerary.itinerary_id ? 'bg-blue-100' : 'bg-gray-100'
                }`}
                onClick={() => handleItineraryClick(itinerary)}
              >
                <p><strong>Destination:</strong> {itinerary.destination}</p>
                <p><strong>Days:</strong> {itinerary.days}</p>
                <p><strong>Budget:</strong> ${itinerary.budget}</p>
                {itinerary.themes && itinerary.themes.length > 0 && (
                  <p><strong>Themes:</strong> {itinerary.themes.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BurgerMenu;