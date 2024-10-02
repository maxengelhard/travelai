import React from 'react';

const AIModelExplanation = () => {
  return (
    <div className="bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center mb-8">
          Our AI: Powered by Expertly Curated Travel Data
        </h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src='https://travel-ai-s3.s3.amazonaws.com/travel_images/destination5.jpg'
              alt="AI Travel Data Visualization" 
              className="rounded-lg shadow-xl"
            />
          </div>
          <div>
            <p className="text-xl mb-6">
              Our AI travel planner is built on a foundation of meticulously curated data, ensuring that your itineraries are both innovative and reliable.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Expert-verified travel information from seasoned globetrotters</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Up-to-date data on attractions, local customs, and hidden gems</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Continuously refined based on real traveler feedback and experiences</span>
              </li>
            </ul>
            <p className="text-xl mt-6">
              The result? A smart travel companion that creates personalized, authentic experiences tailored just for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModelExplanation;