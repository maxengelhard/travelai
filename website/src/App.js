import React, { useState , useEffect } from 'react';
import TravelForm from './components/TravelForm';
import Itinerary from './components/Itinerary';
import Navigation from './components/Navigation';

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

function App() {
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);

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

  const generateItinerary = async (destination, days, budget) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destination, days: 1, budget }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setItinerary(data.itinerary);
      setShowPaymentPrompt(true);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      setItinerary("Sorry, there was an error generating your itinerary. Please try again.");
    }
    setIsLoading(false);
  };

  const handlePayment = () => {
    // Implement Stripe payment logic here
    console.log("Redirecting to payment...");
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
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">Fire Your Travel Agent</h1>
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
            <div className="w-full lg:w-2/5 bg-white bg-opacity-90 p-6 lg:p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-gray-800">Plan Your Trip</h2>
              <TravelForm onSubmit={generateItinerary} />
              {isLoading && <p className="mt-4 text-center">Generating your itinerary...</p>}
              {itinerary && <Itinerary plan={itinerary} />}
              {showPaymentPrompt && (
                <div className="mt-4 p-4 bg-blue-100 rounded">
                  <p className="mb-2">Want to see the full itinerary? Sign up and pay to unlock all days!</p>
                  <button
                    onClick={handlePayment}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Sign Up and Pay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;