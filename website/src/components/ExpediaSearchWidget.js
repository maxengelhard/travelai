import React from 'react';
import { FaPlane } from 'react-icons/fa';

const ExpediaWidget = () => {
  const handleClick = () => {
    window.open('https://expedia.com/affiliate/UcHCHQd', '_blank');
  };

  return (
    <div className="sidebar-widget relative w-full h-[240px] overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80')`}}
      ></div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black opacity-70"></div>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col p-4">
        {/* Expedia logo */}
        <div className="self-end">
          <img src="https://www.expedia.com/_dms/header/logo.svg?locale=en_US&siteid=1&2" alt="Expedia" className="w-16" />
        </div>
        
        {/* Text and button */}
        <div className="text-white text-center flex-grow flex flex-col justify-center mt-4">
          <h3 className="text-lg font-bold leading-tight mb-4">Bye Bye Bucket List,<br />Hello Adventure</h3>
          <button 
            onClick={handleClick}
            className="px-4 py-2 bg-yellow-400 text-black text-sm font-semibold rounded-full hover:bg-yellow-300 transition duration-300 flex items-center justify-center mx-auto mb-4"
          >
            <FaPlane className="mr-2" />
            Start My Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpediaWidget;