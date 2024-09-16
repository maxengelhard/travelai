import React, { useState } from 'react';
import CategorySelector from './CategorySelector';

const StyledItinerary = ({ itinerary, onUpdateItinerary }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);

  const handleActivityClick = (dayIndex, activityIndex) => {
    setSelectedActivity({ dayIndex, activityIndex });
  };

  const handleCategorySelect = async (category) => {
    if (selectedActivity) {
      const { dayIndex, activityIndex } = selectedActivity;
      const updatedItinerary = {
        ...itinerary,
        days: itinerary.days.map((day, i) => {
          if (i === dayIndex) {
            return {
              ...day,
              activities: day.activities.map((activity, j) => {
                if (j === activityIndex) {
                  return `${activity} (Updated for ${category})`;
                }
                return activity;
              })
            };
          }
          return day;
        })
      };
      onUpdateItinerary(updatedItinerary);
    }
    setSelectedActivity(null);
  };

  return (
    <div className="relative pl-8 space-y-8 before:absolute before:left-4 before:h-full before:w-0.5 before:bg-blue-200">
      {itinerary.days.map((day, dayIndex) => (
        <div key={dayIndex} className="relative">
          <div className="absolute -left-8 top-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{day.day}</span>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Day {day.day}</h3>
            <div className="space-y-2">
              {day.activities.map((activity, activityIndex) => (
                <div
                  key={activityIndex}
                  className="pl-4 relative before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-blue-300 before:rounded-full cursor-pointer hover:bg-blue-50 transition-colors duration-200"
                  onClick={() => handleActivityClick(dayIndex, activityIndex)}
                >
                  <p className="text-sm text-gray-700">{activity}</p>
                </div>
              ))}
            </div>
            {day.costBreakdown && (
              <div className="mt-2 pt-2 border-t border-blue-100 text-sm">
                <h4 className="font-semibold text-blue-600">Day {day.day} Cost:</h4>
                <p className="text-gray-600">{day.costBreakdown}</p>
              </div>
            )}
          </div>
        </div>
      ))}
      {itinerary.totalCostBreakdown && (
        <div className="bg-white rounded-lg shadow-md p-4 mt-4">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Total Cost Breakdown:</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-600">{itinerary.totalCostBreakdown}</pre>
        </div>
      )}
      {selectedActivity && (
        <CategorySelector
          onSelect={handleCategorySelect}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>
  );
};

export default StyledItinerary;