import React from 'react';

const StyledItinerary = ({ itinerary }) => {
  const days = itinerary.split('Day').filter(day => day.trim() !== '');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-purple-700">Your Itinerary</h2>
      {days.map((day, index) => {
        const [dayNumber, ...content] = day.split('\n').filter(line => line.trim() !== '');
        return (
          <div key={index} className="mb-6 last:mb-0">
            <h3 className="text-xl font-semibold mb-2 text-purple-600">Day {dayNumber.trim()}</h3>
            {content.map((item, itemIndex) => {
              if (item.endsWith(':')) {
                return <h4 key={itemIndex} className="font-medium text-purple-500 mt-2">{item}</h4>;
              } else if (item.startsWith('-')) {
                return <p key={itemIndex} className="ml-4 mb-1">{item}</p>;
              } else if (item.includes(':')) {
                const [time, description] = item.split(':');
                return (
                  <div key={itemIndex} className="mb-2">
                    <span className="font-medium text-purple-500">{time}:</span>
                    <span>{description}</span>
                  </div>
                );
              } else {
                return <p key={itemIndex} className="mb-1">{item}</p>;
              }
            })}
          </div>
        );
      })}
    </div>
  );
};

export default StyledItinerary;