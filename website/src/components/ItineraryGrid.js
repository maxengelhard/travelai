import React from 'react';

const ItineraryGrid = ({ itinerary }) => {
  if (!itinerary) return <div>No itinerary available</div>;

  // Parse the itinerary string into a structured format
  const parseItinerary = (rawItinerary) => {
    const days = rawItinerary.split('Day').filter(day => day.trim() !== '');
    return days.map(day => {
      const [dayNumber, ...activities] = day.split('\n').filter(line => line.trim() !== '');
      const combinedActivities = [];
      for (let i = 0; i < activities.length; i += 2) {
        if (i + 1 < activities.length) {
          // Remove the colon from the label if it exists
          const label = activities[i].trim().replace(/:\s*$/, '');
          combinedActivities.push(`${label}: ${activities[i + 1].trim()}`);
        } else {
          combinedActivities.push(activities[i].trim());
        }
      }
      return {
        day: dayNumber.trim(),
        activities: combinedActivities
      };
    });
  };

  const parsedItinerary = parseItinerary(itinerary);

  return (
    <div className="grid gap-4">
      {parsedItinerary.map((day, index) => (
        <div key={index} className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Day {day.day}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {day.activities.map((activity, actIndex) => (
              <div key={actIndex} className="bg-gray-100 p-3 rounded">
                {activity}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItineraryGrid;