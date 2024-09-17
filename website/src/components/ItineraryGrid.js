import React from 'react';

const ItineraryGrid = ({ itinerary }) => {
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
  );
};

export default ItineraryGrid;