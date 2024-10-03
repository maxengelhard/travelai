import React from 'react';
import { usePDF } from 'react-to-pdf';
import { FaDownload } from 'react-icons/fa';

const ItineraryGrid = ({ destination, itinerary, darkMode }) => {
  const { toPDF, targetRef } = usePDF({filename: `${destination}-itinerary.pdf`});
  
  if (!itinerary) return <div className="text-gray-600 dark:text-gray-400">No itinerary available</div>;

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

  return (
    <div className="relative">
      <div className={`
        ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}
        shadow-xl overflow-hidden transition-colors duration-300
      `}>
        <div className={`
          relative
          ${darkMode 
            ? 'bg-gradient-to-r from-indigo-900 to-indigo-800 border-indigo-700' 
            : 'bg-gradient-to-r from-blue-500 to-blue-500 border-blue-400'
          }
          text-white transition-all duration-300
          border-b
        `}>
          <div className="text-center py-6">
            <h2 className="text-3xl font-bold">{destination} Itinerary</h2>
          </div>
          <button
            onClick={() => toPDF()}
            className={`
              absolute right-4 top-1/2 transform -translate-y-1/2
              ${darkMode 
                ? 'bg-indigo-700 hover:bg-indigo-600 border-indigo-500' 
                : 'bg-blue-400 hover:bg-blue-300 border-blue-300'
              }
              text-white font-bold py-2 px-4 rounded-lg 
              flex items-center transition-all duration-300 shadow-lg
              border-2
            `}
          >
            <FaDownload className="mr-2" />
            Download PDF
          </button>
        </div>
      </div>
      <div ref={targetRef}>
        {parsedItinerary.map((day, index) => (
          <div key={index} className={`
            ${darkMode ? 'bg-gray-800' : 'bg-white'}
            shadow-xl overflow-hidden transition-colors duration-300
            ${index !== 0 ? 'border-t border-gray-700 dark:border-gray-600' : ''}
          `}>
            <h3 className={`
              text-xl font-bold 
              ${darkMode 
                ? 'bg-gradient-to-r from-indigo-800 to-indigo-700' 
                : 'bg-gradient-to-r from-blue-400 to-blue-300'
              } 
              text-white p-4 transition-all duration-300
            `}>
              {day.day}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 dark:bg-gray-700">
              {day.activities.map((activity, actIndex) => (
                <div 
                  key={actIndex} 
                  className={`
                    ${darkMode ? 'bg-gray-800' : 'bg-white'} 
                    p-4 transition-colors duration-300
                  `}
                >
                  <h4 className={`
                    font-semibold mb-2
                    ${darkMode ? 'text-indigo-300' : 'text-blue-600'}
                    transition-colors duration-300
                  `}>
                    {activity.key}
                  </h4>
                  <p className={`
                    ${darkMode ? 'text-gray-300' : 'text-gray-700'}
                    transition-colors duration-300
                  `}>
                    {activity.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryGrid;