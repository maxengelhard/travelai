import React from 'react';

function Itinerary({ plan }) {
  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-indigo-800 mb-4">Your Itinerary</h2>
      <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">{plan}</pre>
    </div>
  );
}

export default Itinerary;