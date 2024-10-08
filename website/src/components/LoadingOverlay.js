import React from 'react';

const LoadingOverlay = ({ darkMode }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-8 rounded-lg shadow-xl flex flex-col items-center`}>
      <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-500'} mb-4`}></div>
      <p className="text-xl font-semibold">Processing your itinerary...</p>
    </div>
  </div>
);

export default LoadingOverlay;