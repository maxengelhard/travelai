import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col relative">
        <Helmet>
          <title>Trip Journey AI | Intelligent Travel Planning</title>
          <meta name="description" content="Create personalized AI-powered itineraries and get smart travel recommendations with Trip Journey AI." />
          <meta name="keywords" content="AI itinerary, AI travel planner, smart travel assistant, personalized travel plans, AI travel helper" />
          <link rel="canonical" href="https://www.tripjourney.co/" />
        </Helmet>
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:title" element={<BlogPost />} />
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
        </main>
      </div>
      <Analytics />
    </Router>
  );
}

export default App;