import React, { useState } from 'react';

const ItineraryDay = ({ day, activities }) => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold mb-2 text-blue-400">Day {day}</h3>
    <ul className="list-disc list-inside">
      {activities.map((activity, index) => (
        <li key={index} className="mb-1 text-gray-300">
          {activity.name} <span className="text-green-400">(${activity.cost})</span>
        </li>
      ))}
    </ul>
  </div>
);

const ItineraryExample = ({ destination, days, budget }) => {
  const totalExpense = days.reduce((total, day) => 
    total + day.reduce((dayTotal, activity) => dayTotal + activity.cost, 0), 0
  );

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-white">{destination} - {days.length} Day Itinerary</h2>
      <p className="text-green-400 mb-4">Estimated Budget: ${budget}</p>
      {days.map((day, index) => (
        <ItineraryDay key={index} day={index + 1} activities={day} />
      ))}
      <p className="text-xl font-semibold text-green-400 mt-6">
        Total Estimated Expense: ${totalExpense}
      </p>
    </div>
  );
};

const ItineraryExamples = () => {
  const [activeExample, setActiveExample] = useState(0);

  const examples = [
    {
      destination: "Paris, France",
      days: [
        [
          { name: "Visit the Eiffel Tower", cost: 25 },
          { name: "Explore the Louvre Museum", cost: 15 },
          { name: "Evening Seine River Cruise", cost: 35 }
        ],
        [
          { name: "Tour Notre-Dame Cathedral", cost: 0 },
          { name: "Walk through Montmartre", cost: 0 },
          { name: "Visit Sacré-Cœur Basilica", cost: 0 }
        ],
        [
          { name: "Day trip to Palace of Versailles", cost: 27 },
          { name: "Shopping on Champs-Élysées", cost: 100 },
          { name: "Dinner at a Michelin-star restaurant Baillotte", cost: 200 }
        ],
        [
          { name: "Explore the Catacombs", cost: 15 },
          { name: "Picnic in Luxembourg Gardens", cost: 20 },
          { name: "Visit the Musée d'Orsay", cost: 14 }
        ]
      ],
      budget: 2000
    },
    {
      destination: "Tokyo, Japan",
      days: [
        [
          { name: "Explore Senso-ji Temple", cost: 0 },
          { name: "Visit Ueno Park", cost: 0 },
          { name: "Experience the bustle of Shibuya Crossing", cost: 0 }
        ],
        [
          { name: "Tour the Imperial Palace", cost: 0 },
          { name: "Shop in Harajuku", cost: 100 },
          { name: "Enjoy dinner in Shinjuku", cost: 50 }
        ],
        [
          { name: "Day trip to Mount Fuji", cost: 130 },
          { name: "Relax in an onsen", cost: 15 },
          { name: "Try karaoke in Roppongi", cost: 30 }
        ],
        [
          { name: "Visit Tsukiji Outer Market", cost: 0 },
          { name: "Explore Akihabara", cost: 50 },
          { name: "Watch sumo wrestling practice", cost: 0 }
        ],
        [
          { name: "Day trip to Kamakura", cost: 20 },
          { name: "Visit the Great Buddha", cost: 3 },
          { name: "Hike the Daibutsu trail", cost: 0 }
        ]
      ],
      budget: 2500
    },
    {
      destination: "New York City, USA",
      days: [
        [
          { name: "Visit the Statue of Liberty", cost: 19 },
          { name: "Explore Times Square", cost: 0 },
          { name: "Walk through Central Park", cost: 0 }
        ],
        [
          { name: "Tour the Metropolitan Museum of Art", cost: 25 },
          { name: "Walk the High Line", cost: 0 },
          { name: "See a Broadway show", cost: 150 }
        ],
        [
          { name: "Visit the 9/11 Memorial", cost: 26 },
          { name: "Shop in SoHo", cost: 100 },
          { name: "Enjoy the view from Top of the Rock", cost: 40 }
        ]
      ],
      budget: 1500
    }
  ];

  return (
    <div className="bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-white text-center mb-8">Sample Itineraries</h2>
        <div className="flex justify-center mb-8">
          {examples.map((example, index) => (
            <button
              key={index}
              className={`mx-2 px-4 py-2 rounded ${
                activeExample === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-blue-400 hover:bg-gray-700'
              }`}
              onClick={() => setActiveExample(index)}
            >
              {example.destination}
            </button>
          ))}
        </div>
        <ItineraryExample {...examples[activeExample]} />
      </div>
    </div>
  );
};

export default ItineraryExamples;