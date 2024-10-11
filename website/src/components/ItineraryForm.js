import React, { useState, useEffect, useMemo, useRef } from 'react';
import API from '../services/API';
import LoadingOverlay from './LoadingOverlay';
import { FaMapMarkerAlt } from 'react-icons/fa';

const availableThemes = [
  'Adventure', 'Social', 'Relaxation', 'Cultural', 'Foodie', 'Nightlife', 'Nature', 'Urban', 'Beach', 'Historical', 'Shopping'
];

const ItineraryForm = ({ userInfo, onItineraryUpdate, option, onClose, currentItinerary, darkMode }) => {
  const [formData, setFormData] = useState({
    destination: '',
    days: '',
    budget: '',
    themes: [],
    prompt: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionClicked, setSuggestionClicked] = useState(false);
  const suggestionRef = useRef(null);

  useEffect(() => {
    if (option === 'edit' && currentItinerary) {
      setFormData({
        destination: currentItinerary.destination || '',
        days: currentItinerary.days || '',
        budget: currentItinerary.budget || '',
        themes: currentItinerary.themes || [],
        prompt: ''
      });
    }
  }, [option, currentItinerary]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (option === 'create' && formData.destination.length > 2 && !suggestionClicked) {
        try {
          const response = await API.get('search-location', {
            queryParams: { input: formData.destination }
          });
          setSuggestions(response.data.body);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [option, formData.destination, suggestionClicked]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'destination' && option === 'create') {
      setSuggestionClicked(false);
    }
  };

  const handleThemeToggle = (theme) => {
    setFormData(prev => ({
      ...prev,
      themes: prev.themes.includes(theme)
        ? prev.themes.filter(t => t !== theme)
        : [...prev.themes, theme]
    }));
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData(prev => ({ ...prev, destination: suggestion.description }));
    setShowSuggestions(false);
    setSuggestionClicked(true);
  };

  const creditCost = useMemo(() => {
    const baseCost = 10;
    const themeCost = formData.themes.length === 0 ? 0 : formData.themes.length === 1 ? 4 : 6;
    return baseCost + themeCost;
  }, [formData.themes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const endpoint = option === 'create' ? 'create-new-itinerary' : 'update-itinerary';
      const payload = {
        ...formData,
        itinerary_id: option === 'edit' ? currentItinerary.itinerary_id : undefined
      };
      const response = await API.post(endpoint, { data: payload });
      if (option === 'create' && response.data.body && response.data.body.itinerary_id) {
        localStorage.setItem('selectedItineraryId', response.data.body.itinerary_id.toString());
      }
      
      const userStatusResponse = await API.get('user-status');
      const userItinerariesResponse = await API.get('user-itineraries');
      
      onItineraryUpdate({
        userStatus: {
          ...userStatusResponse.data.body
        },
        userItineraries: userItinerariesResponse.data.body,
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting itinerary:', error);
      if (error.response && error.response.data && error.response.data.error === 'Insufficient credits') {
        alert('You do not have enough credits to perform this action.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <LoadingOverlay darkMode={darkMode} />}
      <form onSubmit={handleSubmit} className={`space-y-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        <h2 className={`text-2xl font-bold mb-4 text-center ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {option === 'create' ? 'Create New Itinerary' : 'Edit Existing Itinerary'}
        </h2>
        <div ref={suggestionRef}>
          <label htmlFor="destination" className="block mb-1 font-medium">Destination</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FaMapMarkerAlt className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
            </span>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              onFocus={() => option === 'create' && setShowSuggestions(true)}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                option === 'edit' ? 'bg-gray-100 dark:bg-gray-700' : ''
              } ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'}`}
              required
              readOnly={option === 'edit'}
              disabled={option === 'edit'}
            />
            {option === 'create' && showSuggestions && suggestions.length > 0 && (
              <ul className={`absolute z-10 w-full mt-1 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 overflow-auto focus:outline-none sm:text-sm ${
                darkMode 
                  ? 'bg-gray-800 ring-gray-700 text-gray-200' 
                  : 'bg-white ring-gray-300 text-gray-900'
              }`}>
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.place_id}
                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                      darkMode
                        ? 'hover:bg-gray-700 text-gray-200'
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="days" className="block mb-1 font-medium">Number of Days</label>
          <input
            type="number"
            id="days"
            name="days"
            value={formData.days}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'
            }`}
            required
          />
        </div>
        <div>
          <label htmlFor="budget" className="block mb-1 font-medium">Budget</label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'
            }`}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Themes</label>
          <div className="flex flex-wrap -mx-1">
            {availableThemes.map(theme => (
              <button
                key={theme}
                type="button"
                onClick={() => handleThemeToggle(theme)}
                className={`m-1 px-3 py-1 rounded-full text-sm ${
                  formData.themes.includes(theme)
                    ? 'bg-blue-500 text-white'
                    : darkMode
                      ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
        {option === 'edit' && (
          <div>
            <label htmlFor="prompt" className="block mb-1 font-medium">Prompt for Editing</label>
            <textarea
              id="prompt"
              name="prompt"
              value={formData.prompt}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'
              }`}
              rows="3"
              placeholder="Enter any specific changes or additions you'd like for this itinerary..."
            ></textarea>
          </div>
        )}
        <div className="flex justify-end space-x-2 mt-6">
          <button 
            type="button" 
            onClick={onClose}
            className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${
              darkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              userInfo.credits < creditCost ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={userInfo.credits < creditCost}
          >
            {option === 'create' ? 'Create Itinerary' : 'Update Itinerary'} ({creditCost} credits)
          </button>
        </div>
        {userInfo.credits < creditCost && (
          <p className="text-red-500 text-sm mt-2">
            You don't have enough credits for this action. You need {creditCost} credits, but you only have {userInfo.credits}.
          </p>
        )}
      </form>
    </>
  );
};

export default ItineraryForm;