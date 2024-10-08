import React from 'react';
import { Helmet } from 'react-helmet';

const backgroundImages = [
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination4.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination5.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination9.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination15.jpg',
];

function About() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Helmet>
        <title>About Us | Trip Journey AI</title>
        <meta name="description" content="Learn about Trip Journey AI, our mission to revolutionize travel planning with artificial intelligence, and meet our team." />
      </Helmet>
      <div className="container mx-auto pt-32 px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-blue-400 text-center">About Trip Journey AI</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <p className="mb-4 text-gray-300 text-lg">Trip Journey AI was founded in 2024 with a simple mission: to make travel planning effortless and personalized using the power of artificial intelligence.</p>
            <p className="mb-4 text-gray-300 text-lg">Our team of travel enthusiasts and AI experts work tirelessly to create intelligent algorithms that understand your travel preferences and craft the perfect itinerary for your dream vacation.</p>
          </div>
          <div className="relative h-64 md:h-auto">
            <img src={backgroundImages[0]} alt="AI Travel Planning" className="w-full h-full object-cover rounded-lg shadow-lg" />
            <div className="absolute inset-0 bg-black opacity-30 rounded-lg"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-3xl font-bold text-white text-center">AI-Powered Travel</h2>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-blue-400">Our Vision</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {backgroundImages.slice(1).map((img, index) => (
            <div key={index} className="relative h-48 md:h-64">
              <img src={img} alt={`Travel Vision ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-lg" />
              <div className="absolute inset-0 bg-black opacity-30 rounded-lg"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-xl font-bold text-white text-center">
                  {index === 0 ? "Personalized Experiences" : index === 1 ? "Global Exploration" : "Sustainable Travel"}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold mb-6 text-blue-400">Why Choose Trip Journey AI?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Personalized Itineraries</h3>
            <p className="text-gray-300 mb-4">Our AI analyzes your preferences, budget, and travel style to create tailor-made itineraries that perfectly match your desires.</p>
            
            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Time-Saving</h3>
            <p className="text-gray-300 mb-4">Say goodbye to hours of research and planning. Our AI does the hard work for you, allowing you to focus on enjoying your trip.</p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-blue-300">Hidden Gems</h3>
            <p className="text-gray-300 mb-4">Discover off-the-beaten-path locations and experiences that traditional travel agencies might miss.</p>
            
            <h3 className="text-2xl font-semibold mb-4 text-blue-300">24/7 Availability</h3>
            <p className="text-gray-300 mb-4">Our AI is always ready to help, whether you're planning months in advance or need last-minute assistance.</p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-blue-400">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-300 mb-8">Let Trip Journey AI be your personal travel planner and experience the future of travel today!</p>
          <a href="/" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
            Plan Your Trip Now
          </a>
        </div>
      </div>
    </div>
  );
}

export default About;