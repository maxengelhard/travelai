import React from 'react';
import { capitalizeWords } from '../utils/capitalizeWords';
import ExpediaWidget from './ExpediaSearchWidget';
import { FaSuitcase, FaCalendarAlt, FaDollarSign, FaTags, FaCommentAlt } from 'react-icons/fa';

const SideBar = ({ onSelectItinerary, selectedItineraryId, previousItineraries, darkMode }) => {
  const handleItineraryClick = (itinerary) => {
    localStorage.setItem('selectedItineraryId', itinerary.itinerary_id);
    onSelectItinerary(itinerary.itinerary_id);
  };  

  return (
    <aside className={`w-[280px] h-screen flex flex-col border-r ${
      darkMode 
        ? 'bg-gray-900 text-gray-100 border-gray-700' 
        : 'bg-gray-50 text-gray-900 border-gray-200'
    }`}>
      <div className="flex flex-col h-full">
        <div className={`flex-grow overflow-auto p-6 pb-4 mb-4 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-300'
        }`}>
          <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Previous Itineraries</h2>
          {previousItineraries.length > 0 ? (
            <div className="space-y-6">
              {previousItineraries.map((itinerary) => (
                <div
                  key={itinerary.itinerary_id}
                  className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 ${
                    selectedItineraryId === itinerary.itinerary_id 
                      ? darkMode 
                        ? 'bg-blue-900 border-2 border-blue-500 transform scale-105' 
                        : 'bg-blue-50 border-2 border-blue-500 transform scale-105'
                      : darkMode
                        ? 'bg-gray-800 hover:bg-gray-700'
                        : 'bg-white hover:bg-gray-100'
                  }`}
                  onClick={() => handleItineraryClick(itinerary)}
                >
                  <p className="text-lg font-semibold mb-2 flex items-center">
                    <FaSuitcase className="mr-2" />
                    {capitalizeWords(itinerary.destination)}
                  </p>
                  <div className="text-sm mb-1 flex items-center">
                    <FaCalendarAlt className="mr-2 flex-shrink-0" />
                    <span><strong>Days:</strong><span className="ml-1">{itinerary.days}</span></span>
                  </div>
                  <div className="text-sm mb-1 flex items-center">
                    <FaDollarSign className="mr-2 flex-shrink-0" />
                    <span><strong>Budget:</strong><span className="ml-1">${itinerary.budget}</span></span>
                  </div>
                  {itinerary.themes && itinerary.themes.length > 0 && (
                    <div className="text-sm mb-1 flex items-start">
                      <FaTags className="mr-2 mt-1 flex-shrink-0" />
                      <span><strong>Themes:</strong><span className="ml-1">{itinerary.themes.join(', ')}</span></span>
                    </div>
                  )}
                  {itinerary.prompt && (
                    <div className="text-sm flex items-start">
                      <FaCommentAlt className="mr-2 mt-1 flex-shrink-0" />
                      <span><strong>Prompt:</strong><span className="ml-1">{itinerary.prompt}</span></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No previous itineraries found.</p>
          )}
        </div>
        <div className="flex-shrink-0 pb-6 pt-0">
          <ExpediaWidget darkMode={darkMode} />
        </div>
      </div>
    </aside>
  );
};

export default SideBar;