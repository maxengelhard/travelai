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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-purple-700">Your Itinerary</h2>
      {itinerary.map((day, dayIndex) => (
        <div key={dayIndex} className="mb-6 last:mb-0">
          <h3 className="text-xl font-semibold mb-2 text-purple-600">Day {day.day}</h3>
          {day.activities.map((activity, activityIndex) => (
            <div
              key={activityIndex}
              className="mb-2 p-2 rounded hover:bg-purple-100 cursor-pointer transition duration-300"
              onClick={() => handleActivityClick(dayIndex, activityIndex)}
            >
              {activity}
            </div>
          ))}
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