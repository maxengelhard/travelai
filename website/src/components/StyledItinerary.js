import React, { useState } from 'react';
import CategorySelector from './CategorySelector';

const StyledItinerary = ({ itinerary, onUpdateItinerary }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  const handleActivityClick = (dayIndex, activityIndex) => {
    setSelectedActivity({ dayIndex, activityIndex });
  };

  const handleCategorySelect = async (category) => {
    if (selectedActivity) {
      const { dayIndex, activityIndex } = selectedActivity;
      // Here, you would typically call your AI service to get a new suggestion
      // For now, we'll just append the category to the activity
      const updatedItinerary = itinerary.map((day, i) => {
        if (i === dayIndex) {
          const updatedActivities = day.activities.map((activity, j) => {
            if (j === activityIndex) {
              return `${activity} (Updated for ${category})`;
            }
            return activity;
          });
          return { ...day, activities: updatedActivities };
        }
        return day;
      });
      onUpdateItinerary(updatedItinerary);
    }
    setSelectedActivity(null);
  };

  const toggleDay = (dayIndex) => {
    setExpandedDay(expandedDay === dayIndex ? null : dayIndex);
  };

  return (
    <div className="space-y-2">
      {itinerary.days.map((day, dayIndex) => (
        <div key={dayIndex} className="border rounded-md overflow-hidden">
          <div 
            className="bg-gray-100 p-2 cursor-pointer flex justify-between items-center"
            onClick={() => toggleDay(dayIndex)}
          >
            <h3 className="text-md font-semibold">Day {day.day}</h3>
            <span>{expandedDay === dayIndex ? '▲' : '▼'}</span>
          </div>
          {expandedDay === dayIndex && (
            <div className="p-2 space-y-1">
              {day.activities.map((activity, activityIndex) => (
                <div
                  key={activityIndex}
                  className="text-sm p-1 rounded hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleActivityClick(dayIndex, activityIndex)}
                >
                  {activity}
                </div>
              ))}
              {day.costBreakdown && (
                <div className="mt-2 pt-2 border-t text-sm">
                  <h4 className="font-semibold">Day {day.day} Cost:</h4>
                  <p>{day.costBreakdown}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {itinerary.totalCostBreakdown && (
        <div className="mt-4 pt-4 border-t">
          <h3 className="text-lg font-semibold mb-2">Total Cost Breakdown:</h3>
          <pre className="whitespace-pre-wrap text-sm">{itinerary.totalCostBreakdown}</pre>
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