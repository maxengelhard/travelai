import React from 'react';
import { usePDF } from 'react-to-pdf';

const ItineraryGrid = ({ itinerary }) => {
    const { toPDF, targetRef } = usePDF({filename: 'my-itinerary.pdf'});
  if (!itinerary) return <div>No itinerary available</div>;

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
      <button
        onClick={() => toPDF()}
        className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        Download PDF
      </button>
    <div ref={targetRef}>
    <div className="space-y-8">
      {parsedItinerary.map((day, index) => (
        <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
          <h3 className="text-xl font-bold bg-blue-600 text-white p-4">{day.day}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {day.activities.map((activity, actIndex) => (
              <div key={actIndex} className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">{activity.key}</h4>
                <p className="text-gray-700">{activity.value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    </div>
    </div>
  );
};

export default ItineraryGrid;