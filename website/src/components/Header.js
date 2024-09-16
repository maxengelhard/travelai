import React, { useState } from 'react';
import UserSidebar from './UserSidebar';

const Header = ({ credits, userInfo }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between">
      <div className="w-1/3">
        <img src="/logo192.png" alt="Your Icon" className="h-8" />
      </div>
      <div className="w-1/3 text-center flex items-center justify-center">
        <span className="text-xl font-bold mr-2">Itinerary Creation</span>
        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-2.5 py-0.5 rounded">
          {credits} credits
        </span>
      </div>
      <div className="w-1/3 flex justify-end">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="text-gray-700 hover:text-gray-900 focus:outline-none"
        >
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
      <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} userInfo={userInfo} />
    </header>
  );
};

export default Header;