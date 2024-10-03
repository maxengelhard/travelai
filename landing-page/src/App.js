import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col relative">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route 
            path="*" 
            element={
              <Navigate 
                to={{
                  pathname: "/",
                  search: window.location.search
                }} 
                replace 
              />
            } 
          />
        </Routes>
      </div>
      <Analytics />
    </Router>
  );
}

export default App;