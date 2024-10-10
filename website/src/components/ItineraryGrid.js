import React from 'react';
import { usePDF } from 'react-to-pdf';
import { FaDownload, FaSun, FaCloud, FaMoon, FaUtensils, FaWalking, FaBed, FaMoneyBill } from 'react-icons/fa';

const ItineraryGrid = ({ destination, itinerary, darkMode }) => {
  const { toPDF, targetRef } = usePDF({filename: `${destination}-itinerary.pdf`});
  
  if (!itinerary) return <div className="text-gray-600 dark:text-gray-400 text-center p-8">No itinerary available</div>;

  const parseItinerary = (rawItinerary) => {
    const days = rawItinerary.split(/Day \d+:/).filter(day => day.trim() !== '');
    return days.map((day, index) => {
      const activities = day.split('\n').filter(line => line.trim() !== '');
      return {
        day: `Day ${index + 1}`,
        activities: activities.map(activity => {
          const [key, value] = activity.split(':').map(s => s.trim());
          return { key, value };
        })
      };
    });
  };

  const parsedItinerary = parseItinerary(itinerary);

  const getIcon = (key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('morning')) return FaSun;
    if (lowerKey.includes('afternoon')) return FaCloud;
    if (lowerKey.includes('evening')) return FaMoon;
    if (lowerKey.includes('dinner') || lowerKey.includes('lunch') || lowerKey.includes('breakfast')) return FaUtensils;
    if (lowerKey.includes('activity') || lowerKey.includes('visit')) return FaWalking;
    if (lowerKey.includes('costs')) return FaMoneyBill;
    return FaBed;
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className={`rounded-lg shadow-xl overflow-hidden transition-colors duration-300 mb-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-center sm:text-left mb-4 sm:mb-0 flex-grow">
              <h2 className="text-3xl sm:text-4xl font-bold">{destination} Itinerary</h2>
            </div>
            <div className="flex justify-center sm:justify-end w-full sm:w-auto">
              <button
                onClick={() => toPDF()}
                className={`
                  ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}
                  font-bold p-3 rounded-full 
                  flex items-center justify-center transition-all duration-300 shadow-lg
                  transform hover:scale-105 w-12 h-12
                `}
              >
                <FaDownload className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div ref={targetRef} className="space-y-8">
        {parsedItinerary.map((day, index) => (
          <div key={index} className={`rounded-lg shadow-xl overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <h3 className={`text-2xl font-bold p-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
              {day.day}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 pb-2 pt-2">
              {day.activities.map((activity, actIndex) => {
                const Icon = getIcon(activity.key);
                return (
                  <div 
                    key={actIndex} 
                    className={`p-2 rounded-lg transition-colors duration-300 transform hover:scale-105 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center mb-4">
                      <Icon className="mr-3 text-2xl" />
                      <h4 className="font-semibold text-lg">
                        {activity.key}
                      </h4>
                    </div>
                    <p>{activity.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryGrid;