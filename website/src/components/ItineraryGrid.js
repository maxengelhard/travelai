import React from 'react';

const ItineraryGrid = ({ itinerary }) => {
  if (!itinerary) return <div>No itinerary available</div>;

  // Parse the itinerary string into a structured format
  const parseItinerary = (rawItinerary) => {
    const days = rawItinerary.split(/Day \d+:/)
      .filter(day => day.trim() !== '')
      .map((day, index) => {
        const dayNumber = index + 1;
        const activities = day.split('\n')
          .filter(line => line.trim() !== '')

        const parseActivities = (activityLines) => {
          const combinedActivities = [];
          for (let i = 0; i < activityLines.length; i += 2) {
            if (i + 1 < activityLines.length) {
              const label = activityLines[i].trim().replace(/:\s*$/, '');
              combinedActivities.push(`${label}: ${activityLines[i + 1].trim()}`);
            } else {
              combinedActivities.push(activityLines[i].trim());
            }
          }
          return combinedActivities;
        };

        return {
          day: dayNumber,
          activities: parseActivities(activities)
        };
      });

    // Filter out any "days" that don't have activities (likely cost breakdown sections)
    return days.filter(day => day.activities.length > 0);
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