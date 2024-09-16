import React from 'react';

const Header = ({ credits }) => {
  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between">
      <div className="w-1/3">
        <img src="/your-icon.png" alt="Your Icon" className="h-8" />
      </div>
      <div className="w-1/3 text-center text-xl font-bold">
        Itinerary Creation
      </div>
      <div className="w-1/3 text-right">
        {credits} credits
      </div>
    </header>
  );
};

export default Header;