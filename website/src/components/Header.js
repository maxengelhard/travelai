import React from 'react';
import { FaCoins, FaUser } from 'react-icons/fa';

const Header = ({ credits, userInfo, onUserButtonClick }) => {
  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <img src="/logo192.png" alt="TripJourney Logo" className="h-8 w-auto mr-2" />
        <h1 className="text-xl font-bold">TripJourney</h1>
      </div>
      <div className="flex-1 flex justify-center md:justify-end">
        <div className="flex items-center">
          <FaCoins className="text-yellow-400 mr-1" />
          <span>{credits}</span>
        </div>
      </div>
      {/* Hide UserButton on mobile */}
      <button 
        onClick={onUserButtonClick}
        className="hidden md:flex items-center justify-center w-8 h-8 bg-white text-blue-600 rounded-full ml-4"
      >
        <FaUser />
      </button>
    </header>
  );
};

export default Header;