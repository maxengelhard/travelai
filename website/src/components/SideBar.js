import React, { useState , useEffect} from 'react';
// import { Menu } from '@headlessui/react';

// services
import API from '../services/API';

// const categories = ['Food', 'Culture', 'Nature', 'Adventure', 'Relaxation'];

const SideBar = ({ selectedCategories, setSelectedCategories, dates, setDates }) => {
  // const [isOpen, setIsOpen] = useState(false);
  const [previousItineraries, setPreviousItineraries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // const handleCategoryChange = (category) => {
  //   setSelectedCategories(prev => 
  //     prev.includes(category) 
  //       ? prev.filter(c => c !== category)
  //       : [...prev, category]
  //   );
  // };

  useEffect(() => {
    const fetchPreviousItineraries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await API.get('user-itineraries', { useCache: false });
        setPreviousItineraries(response.data.body);
      } catch (err) {
        console.error('Error fetching previous itineraries:', err);
        setError('Failed to load previous itineraries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreviousItineraries();
  }, []);

  return (
    <aside className="w-64 bg-gray-100 p-6 overflow-auto relative">
      {/* <Menu as="div" className="relative">
        <Menu.Button 
          className="w-full text-left px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>Themes</span>
          <svg
            className="w-5 h-5 ml-2 -mr-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Menu.Button>
        {isOpen && (
          <Menu.Items 
            static
            className="absolute z-10 left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <div className="py-1">
              {categories.map(category => (
                <Menu.Item key={category}>
                  {({ active }) => (
                    <label 
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } flex items-center px-4 py-2 text-sm cursor-pointer`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="mr-2"
                      />
                      {category}
                    </label>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        )}
      </Menu> */}

      {/* <h2 className="text-lg font-semibold mt-6 mb-4">Dates</h2>
      <div className="space-y-2">
        <div>
          <label className="block text-sm">Start Date</label>
          <input
            type="date"
            value={dates.start}
            onChange={(e) => setDates(prev => ({ ...prev, start: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm">End Date</label>
          <input
            type="date"
            value={dates.end}
            onChange={(e) => setDates(prev => ({ ...prev, end: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>
      </div> */}
      <div className="mt-auto">
        <h2 className="text-lg font-semibold mb-4">Previous Itineraries</h2>
        {isLoading ? (
          <p>Loading previous itineraries...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : previousItineraries.length > 0 ? (
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {previousItineraries.map((itinerary) => (
              <div key={itinerary.itinerary_id} className="bg-white p-4 rounded-lg shadow-sm">
                <p><strong>Destination:</strong> {itinerary.destination}</p>
                <p><strong>Days:</strong> {itinerary.days}</p>
                <p><strong>Budget:</strong> ${itinerary.budget}</p>
                {itinerary.themes && itinerary.themes.length > 0 && (
                  <p><strong>Themes:</strong> {itinerary.themes.join(', ')}</p>
                )}
                {itinerary.prompt && (
                  <p><strong>Prompt:</strong> {itinerary.prompt}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No previous itineraries found.</p>
        )}
      </div>
    </aside>
  );
};

export default SideBar;