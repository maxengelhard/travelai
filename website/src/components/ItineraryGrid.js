import React from 'react';
import { usePDF } from 'react-to-pdf';
import { FaDownload } from 'react-icons/fa';

const ItineraryGrid = ({ destination, itinerary, darkMode }) => {
  const { toPDF, targetRef } = usePDF({filename: `${destination}-itinerary.pdf`});
  
  if (!itinerary) return <div className={`text-center p-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No itinerary available</div>;

  const parseItinerary = (rawItinerary) => {
    const days = rawItinerary.split(/Day \d+:/).filter(day => day.trim() !== '');
    const parsedDays = days.map((day, index) => ({
      day: `Day ${index + 1}`,
      content: day.trim()
    }));

    // Extract overall costs
    const overallCosts = rawItinerary.split('Overall estimated costs for the 5 days:')[1];
    if (overallCosts) {
      parsedDays.push({
        day: 'Overall Costs',
        content: overallCosts.trim()
      });
    }

    return parsedDays;
  };

  const parsedItinerary = parseItinerary(itinerary);

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
            <h3 className={`text-2xl font-bold p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
              {day.day}
            </h3>
            <div className="p-4">
              <pre className={`whitespace-pre-wrap font-sans ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {day.content}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryGrid;