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
      <div className={`
        ${darkMode ? 'bg-gray-800' : 'bg-white'}
        rounded-lg shadow-xl overflow-hidden transition-colors duration-300 mb-8
      `}>
        <div className={`
          ${darkMode 
            ? 'bg-gradient-to-r from-purple-900 to-indigo-800' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
          }
          text-white transition-all duration-300
          p-2
        `}>
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <h2 className="text-3xl sm:text-4xl font-bold">{destination} Itinerary</h2>
            </div>
            <button
              onClick={() => toPDF()}
              className={`
                ${darkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-500' 
                  : 'bg-blue-400 hover:bg-blue-300'
                }
                text-white font-bold py-3 px-6 rounded-full 
                flex items-center transition-all duration-300 shadow-lg
                transform hover:scale-105
              `}
            >
              <FaDownload className="mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
      <div ref={targetRef} className="space-y-8">
        {parsedItinerary.map((day, index) => (
          <div key={index} className={`
            ${darkMode ? 'bg-gray-800' : 'bg-white'}
            rounded-lg shadow-xl overflow-hidden transition-colors duration-300
          `}>
            <h3 className={`
              text-2xl font-bold 
              ${darkMode 
                ? 'bg-gradient-to-r from-purple-800 to-indigo-700' 
                : 'bg-gradient-to-r from-blue-400 to-indigo-400'
              } 
              text-white p-2 transition-all duration-300
            `}>
              {day.day}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 pb-2 pt-2">
              {day.activities.map((activity, actIndex) => {
                const Icon = getIcon(activity.key);
                return (
                  <div 
                    key={actIndex} 
                    className={`
                      ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} 
                      p-2 rounded-lg transition-colors duration-300 transform hover:scale-105
                    `}
                  >
                    <div className="flex items-center mb-4">
                      <Icon className={`mr-3 text-2xl ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      <h4 className={`
                        font-semibold text-lg
                        ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}
                        transition-colors duration-300
                      `}>
                        {activity.key}
                      </h4>
                    </div>
                    <p className={`
                      ${darkMode ? 'text-gray-300' : 'text-gray-700'}
                      transition-colors duration-300
                    `}>
                      {activity.value}
                    </p>
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