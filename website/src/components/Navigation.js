import React from 'react';

function Navigation() {
  return (
    <header className="absolute top-0 left-0 z-10 w-full bg-gradient-to-b from-black to-transparent pb-8">
      <div className="container mx-auto px-6 py-4">
        <div className="logo flex items-center h-16">
          <img src="/logo192.png" alt="Travel AI Logo" className="h-full w-auto object-contain" />
        </div>
      </div>
    </header>
  );
}

export default Navigation;