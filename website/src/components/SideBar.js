import React from 'react';
import { capitalizeWords } from '../utils/capitalizeWords';
import ExpediaWidget from './ExpediaSearchWidget';

const SideBar = ({ onSelectItinerary, selectedItineraryId, previousItineraries, darkMode }) => {
  const handleItineraryClick = (itinerary) => {
    localStorage.setItem('selectedItineraryId', itinerary.itinerary_id);
    onSelectItinerary(itinerary.itinerary_id);
  };  

  return (
    <aside className={`w-64 h-screen flex flex-col border-r overflow-auto ${
      darkMode 
        ? 'bg-gray-800 text-gray-100 border-gray-700' 
        : 'bg-gray-100 text-gray-900 border-gray-300'
    }`}>
      <div className="p-4">
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Travel Search</h3>
        <ExpediaWidget />
      </div>
      <div className="flex-grow p-4">
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Previous Itineraries</h2>
        {previousItineraries.length > 0 ? (
          <div className="space-y-4">
            {previousItineraries.map((itinerary) => (
              <div
                key={itinerary.itinerary_id}
                className={`p-3 rounded-lg shadow-sm cursor-pointer transition-colors duration-200 ${
                  selectedItineraryId === itinerary.itinerary_id 
                    ? darkMode 
                      ? 'bg-blue-900 border-2 border-blue-500' 
                      : 'bg-blue-100 border-2 border-blue-500'
                    : darkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => handleItineraryClick(itinerary)}
              >
                <p className="text-sm"><strong>Destination:</strong> {capitalizeWords(itinerary.destination)}</p>
                <p className="text-sm"><strong>Days:</strong> {itinerary.days}</p>
                <p className="text-sm"><strong>Budget:</strong> ${itinerary.budget}</p>
                {itinerary.themes && itinerary.themes.length > 0 && (
                  <p className="text-sm"><strong>Themes:</strong> {itinerary.themes.join(', ')}</p>
                )}
                {itinerary.prompt && (
                  <p className="text-sm"><strong>Prompt:</strong> {itinerary.prompt}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No previous itineraries found.</p>
        )}
      </div>
    </aside>
  );
};

export default SideBar;