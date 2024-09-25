import React, { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import components
import TravelForm from '../components/TravelForm';
import Itinerary from '../components/Itinerary';
import Navigation from '../components/Navigation';
import Testimonial from '../components/Testimonial';
import ItineraryExamples from '../components/ItineraryExamples';
import ExitIntentModal from '../components/ExitIntentModal';
import HowItWorks from '../components/HowItWorks';

const backgroundImages = [
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination1.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination2.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination3.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination4.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination5.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination6.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination7.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination8.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination9.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination11.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination12.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination13.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination14.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination15.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination16.jpg',
  'https://travel-ai-s3.s3.amazonaws.com/travel_images/destination18.jpg',
];

const styles = `
  .netflix-background {
    position: absolute;
    top: -10%;
    left: -10%;
    right: -10%;
    bottom: -10%;
    transform: rotate(10deg) scale(1.5);
    overflow: hidden;
    background-color: black;
  }

  .netflix-background::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%);
  }
   
  .netflix-scroll {
    display: flex;
    animation: scroll 60s linear infinite;
  }

  .netflix-scroll-content {
    display: flex;
    flex-wrap: wrap;
  }

  .netflix-thumbnail {
    width: 200px;
    height: 200px;
    background-size: cover;
    background-position: center;
    margin: 5px;
    border-radius: 10px;
    opacity: 1;
    transition: opacity 0.3s ease;
  }

  .netflix-thumbnail:hover {
    opacity: 1;
  }

  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

    @media (max-width: 768px) {
    .netflix-thumbnail {
      width: 100px;
      height: 100px;
    }
  }
`;

function Home() {
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [error, setError] = useState(null);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    createThumbnails();
  }, []);

  const createThumbnails = () => {
    const scrollContainer = document.querySelector('.netflix-scroll');
    if (!scrollContainer) return;

    const scrollContent = document.createElement('div');
    scrollContent.classList.add('netflix-scroll-content');

    const containerWidth = Math.max(window.innerWidth, window.innerHeight) * 1.5;
    const containerHeight = Math.max(window.innerWidth, window.innerHeight) * 1.5;
    const thumbnailWidth = 200 + 10;
    const thumbnailHeight = 200 + 10;
    const columns = Math.ceil(containerWidth / thumbnailWidth);
    const rows = Math.ceil(containerHeight / thumbnailHeight);

    const grid = Array(rows).fill().map(() => Array(columns).fill(null));
    const imageCount = backgroundImages.length;

    const isValidPlacement = (row, col, imageIndex) => {
      const adjacentPositions = [
        [row - 1, col], [row + 1, col],
        [row, col - 1], [row, col + 1],
        [row - 1, col - 1], [row - 1, col + 1],
        [row + 1, col - 1], [row + 1, col + 1]
      ];

      for (const [r, c] of adjacentPositions) {
        if (r >= 0 && r < rows && c >= 0 && c < columns) {
          if (grid[r][c] === imageIndex) return false;
        }
      }
      return true;
    };

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        let attempts = 0;
        let placedImage = false;

        while (!placedImage && attempts < imageCount) {
          const imageIndex = Math.floor(Math.random() * imageCount);
          if (isValidPlacement(row, col, imageIndex)) {
            grid[row][col] = imageIndex;
            placedImage = true;
          }
          attempts++;
        }

        if (!placedImage) {
          // If we couldn't place a unique image, just place any
          grid[row][col] = Math.floor(Math.random() * imageCount);
        }

        const thumbnail = document.createElement('div');
        thumbnail.classList.add('netflix-thumbnail');
        thumbnail.style.backgroundImage = `url(${backgroundImages[grid[row][col]]})`;
        scrollContent.appendChild(thumbnail);
      }
    }

    // Duplicate the content for seamless scrolling
    scrollContainer.appendChild(scrollContent);
    scrollContainer.appendChild(scrollContent.cloneNode(true));
  };

  const generateItinerary = async (destination, days, budget, email) => {
    setIsLoading(true);
    setError(null); // Clear any previous errors
    setIsGenerationComplete(false);
    try {
      const response = await fetch(`https://${process.env.REACT_APP_API_DOMAIN_SUFFIX}.tripjourney.co/itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination,
          days,
          budget,
          email,
        })
      });
  
      const responseData = await response.json();
      setIsGenerationComplete(true);
      // console.log("Response:", responseData); // Log the full response for debugging
  
      if (!response.ok) {
        // Parse the nested error message
        const errorBody = JSON.parse(responseData.body);
        throw new Error(errorBody.error || 'An error occurred');
      }
  
      // Assuming the successful response has the itinerary directly in responseData
      setItinerary(responseData.itinerary);
      setShowPaymentPrompt(true);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      
      if (error.message === 'Email already in the system') {
        setError("This email is already registered.");
        setIsExistingUser(true);
      } else {
        setError("Sorry, there was an error generating your itinerary. Please try again.");
      }
      setItinerary(null); // Clear any previous itinerary
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToPricing = () => {
    navigate('/pricing');
  };

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen flex flex-col relative">
        <Navigation />
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
          <div className="netflix-background">
            <div className="netflix-scroll">
              {/* Background images will be added here by createThumbnails() */}
            </div>
          </div>
        </div>
        <div className="flex-grow flex items-start lg:items-center justify-center z-20 relative pt-16 lg:pt-32 px-4">
          <div className="container mx-auto py-8 lg:py-12 flex flex-col lg:flex-row lg:items-center lg:justify-end">
            <div className="w-full lg:w-1/2 lg:pr-12 text-white mb-8 lg:mb-0">
              <div className="flex flex-col mb-8">
                <div className="flex items-center mb-6">
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-white mr-2">
                      #1 AI Travel App
                    </h1>
                    <div className="flex">
                      {[...Array(5)].map((_, index) => (
                        <svg key={index} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold">🔥 Fire Your Travel Agent</h2>
              </div>
              <p className="text-xl lg:text-2xl mb-6">🌍 Plan your dream vacation with AI</p>
              <ul className="list-disc list-inside mb-6 text-lg lg:text-xl">
                <li>📅 Get personalized day-by-day itineraries</li>
                <li>💰 Stay within your budget</li>
                <li>🏖️ Discover hidden gems and local favorites</li>
              </ul>
              <p className="text-lg lg:text-xl">
                Save time and money by using our AI travel planner instead of hiring an expensive travel agent!
              </p>
            </div>
            <div className="w-full lg:w-2/5 bg-blue-600 p-6 lg:p-8 rounded-lg shadow-2xl">
              <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-100 text-center">Plan Your Dream Trip</h2>
              <TravelForm onSubmit={generateItinerary} isGenerationComplete={isGenerationComplete} />
              {isLoading && <p className="mt-4 text-center">Generating your itinerary...</p>}
            {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                <p>{error}</p>
                {isExistingUser && (
                    <p className="mt-2">
                    Please{' '}
                    <a 
                        href={`https://${process.env.REACT_APP_DOMAIN_SUFFIX}.tripjourney.co/`} 
                        className="text-blue-600 hover:text-blue-800 underline"
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        log in or sign up
                    </a>{' '}
                    to continue.
                    </p>
                )}
                </div>
            )}
            {itinerary && <Itinerary plan={itinerary} />}
            {showPaymentPrompt && (
                <div className="mt-4 p-4 bg-blue-100 rounded">
                <p className="mb-2">Check your email for the itinerary! Want to see the full itinerary? Sign up to unlock all days!</p>
                <button
                    onClick={handleNavigateToPricing}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    View Pricing
                </button>
                </div>
            )}
            </div>
          </div>
        </div>
        <div className="z-20 relative w-full">
          <ItineraryExamples />
        </div>
        <div className="z-20 relative w-full bg-black bg-opacity-75 py-16">
          <Testimonial />
        </div>
        <div className="z-20 relative w-full">
          <HowItWorks />
        </div>
        <ExitIntentModal />
      </div>
    </>
  );
}

export default Home;