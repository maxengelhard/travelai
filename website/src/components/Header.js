import React from 'react';
import { FaCoins, FaUser, FaMoon, FaSun } from 'react-icons/fa';

const Header = ({ credits, userInfo, onUserButtonClick, darkMode, setDarkMode }) => {
  return (
    <header className={`
      ${darkMode 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-blue-500 text-white'
      } 
      p-4 flex justify-between items-center transition-colors duration-300
    `}>
      <div className="flex items-center">
        <img src="/logo192.png" alt="TripJourney Logo" className="h-8 w-auto mr-2" />
        <h1 className="text-xl font-bold">TripJourney</h1>
      </div>
      <div className="flex-1 flex justify-center md:justify-end items-center">
        <div className="flex items-center mr-4">
          <FaCoins className={`
            ${darkMode ? 'text-yellow-300' : 'text-yellow-400'} 
            mr-1
          `} />
          <span>{credits}</span>
        </div>
        {/* Dark mode toggle button - visible only on larger screens */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`
            hidden md:block p-2 rounded-full 
            ${darkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-blue-400 text-white hover:bg-blue-300'
            }
            transition-colors duration-300
          `}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
      {/* Hide UserButton on mobile */}
      <button 
        onClick={onUserButtonClick}
        className={`
          hidden md:flex items-center justify-center w-8 h-8 rounded-full ml-4
          ${darkMode 
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'bg-white text-blue-500 hover:bg-blue-100'
          }
          transition-colors duration-300
        `}
      >
        <FaUser />
      </button>
    </header>
  );
};

export default Header;