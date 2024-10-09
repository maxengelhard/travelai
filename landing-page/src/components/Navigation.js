import React from 'react';
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-gradient-to-b from-black to-transparent">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="logo flex items-center h-16">
            <img src="/logo192.png" alt="Travel AI Logo" className="h-full w-auto object-contain" />
          </Link>
          <nav className="space-x-4">
            <Link to="/about" className="text-white hover:text-blue-200 transition duration-300">About</Link>
            <Link to="/pricing" className="text-white hover:text-blue-200 transition duration-300">Pricing</Link>
            <Link to="/blog" className="text-white hover:text-blue-200 transition duration-300">Blog</Link>
            <Link to="/contact" className="text-white hover:text-blue-200 transition duration-300">Contact</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navigation;