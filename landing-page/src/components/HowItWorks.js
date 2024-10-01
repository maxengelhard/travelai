import React from 'react';
import { FaRobot, FaMapMarkedAlt, FaCalendarAlt } from 'react-icons/fa';

const Step = ({ icon, title, description }) => (
  <div className="flex flex-col items-center text-center">
    <div className="text-4xl text-blue-500 mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const HowItWorks = () => {
  const steps = [
    {
      icon: <FaRobot />,
      title: "AI Analysis",
      description: "Our AI analyzes your preferences, travel style, and budget to create a personalized trip."
    },
    {
      icon: <FaMapMarkedAlt />,
      title: "Local Insights",
      description: "Discover hidden gems and local favorites, not just tourist hotspots."
    },
    {
      icon: <FaCalendarAlt />,
      title: "Smart Scheduling",
      description: "Optimized daily itineraries that balance activities, rest, and travel time."
    },
    // {
    //   icon: <FaPlane />,
    //   title: "Real-time Adaptability",
    //   description: "Your itinerary adjusts to flight changes, weather, and local events in real-time."
    // }
  ];

  return (
    <div className="bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">How Our AI Creates Your Perfect Trip</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Step key={index} {...step} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;