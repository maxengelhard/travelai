import React from 'react';

function Navigation() {
  return (
    <header className="bg-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="logo flex items-center h-16">
          <img src="/logo192.png" alt="Travel AI Logo" className="h-full w-auto object-contain" />
        </div>
        <nav className="flex items-center">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition duration-300 ease-in-out">
            Sign In
          </button>
          <button className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105">
            Sign Up
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navigation;