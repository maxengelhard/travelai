import React, { useState } from 'react';
import ExitIntentModal from './ExitIntentModal';

const ItineraryExample = ({ destination, image, activities, cost, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <img src={image} alt={destination} className="w-full h-64 object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
        <div className="text-white p-4">
          <h3 className="text-xl font-bold">{destination}</h3>
          <p className="text-sm mt-1">Expected cost: ${cost}</p>
        </div>
      </div>
      {isHovered && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="text-white text-left">
            <ul className="list-none space-y-2">
              <li>🌅 {activities.morning}</li>
              <li>☀️ {activities.afternoon}</li>
              <li>🌙 {activities.evening}</li>
              <li>💰 Expected cost: ${cost}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const ItineraryExamples = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('');

  const examples = [
    {
      destination: "Paris, France",
      image: "https://travel-ai-s3.s3.amazonaws.com/travel_images/paris.jpg",
      activities: {
        morning: "Enjoy a croissant at a local boulangerie",
        afternoon: "Picnic in the hidden Parc des Buttes-Chaumont",
        evening: "Jazz night at Le Caveau de la Huchette"
      },
      cost: 150
    },
    {
      destination: "Tokyo, Japan",
      image: "https://travel-ai-s3.s3.amazonaws.com/travel_images/tokyo.jpg",
      activities: {
        morning: "Join locals for morning exercise at Yoyogi Park",
        afternoon: "Explore the quirky shops of Shimokitazawa",
        evening: "Izakaya hopping in Harmonica Yokocho, Kichijoji"
      },
      cost: 180
    },
    {
      destination: "New York City, USA",
      image: "https://travel-ai-s3.s3.amazonaws.com/travel_images/nyc.jpg",
      activities: {
        morning: "Bagel and lox at Russ & Daughters",
        afternoon: "Stroll through the High Line park",
        evening: "Comedy show at the Comedy Cellar"
      },
      cost: 200
    },
    {
      destination: "Marrakech, Morocco",
      image: "https://travel-ai-s3.s3.amazonaws.com/travel_images/morocco.jpg",
      activities: {
        morning: "Breakfast at Cafe Clock in the Kasbah",
        afternoon: "Shop for spices in the hidden Souk des Épices",
        evening: "Dinner at a local's home through Traveling Spoon"
      },
      cost: 100
    },
    {
      destination: "Kyoto, Japan",
      image: "https://travel-ai-s3.s3.amazonaws.com/travel_images/kyoto.jpg",
      activities: {
        morning: "Join a morning meditation at a local temple",
        afternoon: "Tea ceremony in a traditional machiya house",
        evening: "Sake tasting in Fushimi district"
      },
      cost: 160
    },
    {
      destination: "Buenos Aires, Argentina",
      image: "https://travel-ai-s3.s3.amazonaws.com/travel_images/buenos_aires.jpg",
      activities: {
        morning: "Coffee and medialunas at Café Tortoni",
        afternoon: "Book hunting in El Ateneo Grand Splendid",
        evening: "Milonga night at La Catedral Club"
      },
      cost: 120
    },
    {
      destination: "Istanbul, Turkey",
      image: "https://travel-ai-s3.s3.amazonaws.com/travel_images/istanbul.jpg",
      activities: {
        morning: "Breakfast cruise on the Bosphorus",
        afternoon: "Explore the hidden Pera neighborhood",
        evening: "Meyhane experience in Beyoğlu"
      },
      cost: 110
    },
    {
      destination: "Melbourne, Australia",
      image: "https://travel-ai-s3.s3.amazonaws.com/travel_images/melbourne.jpg",
      activities: {
        morning: "Coffee tasting tour in laneway cafes",
        afternoon: "Street art walk in Fitzroy",
        evening: "Rooftop cinema and bar hopping"
      },
      cost: 170
    },
    {
      destination: "Lisbon, Portugal",
      image: "https://travel-ai-s3.s3.amazonaws.com/travel_images/lisbon.jpg",
      activities: {
        morning: "Pastel de nata tasting in Belém",
        afternoon: "Fado workshop in Mouraria",
        evening: "Sunset at a secret miradouro (viewpoint)"
      },
      cost: 130
    }
  ];

  return (
    <div className="bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-100 text-center mb-8">Sample Day Itineraries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {examples.map((example, index) => (
            <ItineraryExample
              key={index}
              {...example}
              onClick={() => {
                setSelectedDestination(example.destination);
                setShowModal(true);
              }}
            />
          ))}
        </div>
      </div>
      {showModal && (
        <ExitIntentModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          destination={selectedDestination}
        />
      )}
    </div>
  );
};

export default ItineraryExamples;