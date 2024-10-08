import React from 'react';
import { capitalizeWords } from '../utils/capitalizeWords';
import ExpediaWidget from './ExpediaSearchWidget';

const SideBar = ({ onSelectItinerary, selectedItineraryId, previousItineraries, darkMode }) => {
  const handleItineraryClick = (itinerary) => {
    localStorage.setItem('selectedItineraryId', itinerary.itinerary_id);
    onSelectItinerary(itinerary.itinerary_id);
  };  

  return (
    <aside className={`w-[300px] h-screen flex flex-col border-r ${
      darkMode 
        ? 'bg-gray-800 text-gray-100 border-gray-700' 
        : 'bg-gray-100 text-gray-900 border-gray-300'
    }`}>
      <div className="flex flex-col h-full">
        <div className={`flex-grow overflow-auto p-4 pb-2 mb-2 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-300'
        }`}>
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
        <div className="flex-shrink-0">
          <ExpediaWidget />
        </div>
      </div>
    </aside>
  );
};

export default SideBar;