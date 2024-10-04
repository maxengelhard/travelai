import React from 'react';

const LoadingSpinner = ({ darkMode }) => {
  return (
    <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="relative">
        <div className={`w-20 h-20 ${darkMode ? 'border-purple-700' : 'border-purple-200'} border-2 rounded-full`}></div>
        <div className={`w-20 h-20 ${darkMode ? 'border-purple-400' : 'border-purple-700'} border-t-2 animate-spin rounded-full absolute left-0 top-0`}></div>
      </div>
      <div className={`ml-4 text-2xl font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>Loading...</div>
    </div>
  );
};

export default LoadingSpinner;