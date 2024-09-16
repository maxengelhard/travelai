import React, { useState, useEffect, useRef } from 'react';
import StyledItinerary from './StyledItinerary';

const ChatInterface = ({ initialItinerary }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [itinerary, setItinerary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dates, setDates] = useState({ start: '', end: '' });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialItinerary) {
      const parsedItinerary = parseItinerary(initialItinerary);
      setItinerary(parsedItinerary);
      setMessages([{ type: 'ai', content: parsedItinerary }]);
    }
  }, [initialItinerary]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { type: 'user', content: input }]);
      setInput('');
      // Here you would typically send the input to your AI service
      // and then add the AI's response to the messages
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleDateChange = (e) => {
    setDates({ ...dates, [e.target.name]: e.target.value });
  };

  const parseItinerary = (rawItinerary) => {
    const days = rawItinerary.split('Day').filter(day => day.trim() !== '');
    return days.map(day => {
      const [dayNumber, ...activities] = day.split('\n').filter(line => line.trim() !== '');
      return {
        day: dayNumber.trim(),
        activities: activities.map(activity => activity.trim())
      };
    });
  };

  const handleUpdateItinerary = (updatedItinerary) => {
    setItinerary(updatedItinerary);
    setMessages(messages.map(msg => 
      msg.type === 'ai' ? { ...msg, content: updatedItinerary } : msg
    ));
  };

  if (!itinerary) {
    return <div>Loading itinerary...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-gray-900">Plan Your Trip</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2">
              {['Food', 'Culture', 'Nature', 'Adventure'].map(category => (
                <label key={category} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={category}
                    checked={categories.includes(category)}
                    onChange={handleCategoryChange}
                    className="form-checkbox h-4 w-4 text-purple-600"
                  />
                  <span className="ml-1 text-sm">{category}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                name="start"
                value={dates.start}
                onChange={handleDateChange}
                className="form-input text-sm"
              />
              <span>to</span>
              <input
                type="date"
                name="end"
                value={dates.end}
                onChange={handleDateChange}
                className="form-input text-sm"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
          <StyledItinerary 
            itinerary={itinerary} 
            onUpdateItinerary={handleUpdateItinerary}
          />
        </div>
      </div>
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow mr-2 p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
            />
            <button
              onClick={handleSend}
              className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition duration-300 text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;