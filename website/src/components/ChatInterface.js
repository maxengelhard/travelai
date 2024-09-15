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
    <div className="flex flex-col h-full bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Plan Your Trip</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-purple-600">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {['Food', 'Culture', 'Nature', 'Adventure'].map(category => (
                <label key={category} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={category}
                    checked={categories.includes(category)}
                    onChange={handleCategoryChange}
                    className="form-checkbox text-purple-600"
                  />
                  <span className="ml-2">{category}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-purple-600">Travel Dates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  name="start"
                  value={dates.start}
                  onChange={handleDateChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  name="end"
                  value={dates.end}
                  onChange={handleDateChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-grow bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
        <div className="flex-grow overflow-auto p-6">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.type === 'user' ? 'text-right' : ''}`}>
              {message.type === 'ai' && index === 0 ? (
                <StyledItinerary 
                  itinerary={itinerary} 
                  onUpdateItinerary={handleUpdateItinerary}
                />
              ) : (
                <div className={`inline-block p-3 rounded-lg ${
                  message.type === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-200'
                }`}>
                  {message.content}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t">
          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow mr-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSend}
              className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition duration-300"
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