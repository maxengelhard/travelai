import React from 'react';
import { Helmet } from 'react-helmet';

function About() {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="container mx-auto pt-32 px-4 py-8">
        <Helmet>
          <title>About Us | Trip Journey AI</title>
          <meta name="description" content="Learn about Trip Journey AI, our mission to revolutionize travel planning with artificial intelligence, and meet our team." />
        </Helmet>
        <h1 className="text-3xl font-bold mb-4 text-blue-400">About Trip Journey AI</h1>
        <p className="mb-4 text-gray-300">Trip Journey AI was founded in 2024 with a simple mission: to make travel planning effortless and personalized using the power of artificial intelligence.</p>
        <p className="mb-4 text-gray-300">Our team of travel enthusiasts and AI experts work tirelessly to create intelligent algorithms that understand your travel preferences and craft the perfect itinerary for your dream vacation.</p>
        <p className="text-gray-300">We believe that everyone deserves a memorable trip, and with Trip Journey AI, your next adventure is just a few clicks away.</p>
      </div>
    </div>
  );
}

export default About;