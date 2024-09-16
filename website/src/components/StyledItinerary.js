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
      {itinerary.map((day, dayIndex) => (
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
            </div>
          )}
        </div>
      ))}
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