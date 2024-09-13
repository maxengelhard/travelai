import React, { useState, useEffect, useRef } from 'react';

const ChatInterface = ({ initialItinerary }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [dates, setDates] = useState({ start: '', end: '' });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialItinerary) {
      setMessages([{ type: 'ai', content: initialItinerary }]);
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-auto p-4">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.type === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block p-2 rounded-lg ${
              message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <div className="mb-4">
          <label className="block mb-2">Categories:</label>
          <div>
            {['Food', 'Culture', 'Nature', 'Adventure'].map(category => (
              <label key={category} className="inline-flex items-center mr-4">
                <input
                  type="checkbox"
                  value={category}
                  checked={categories.includes(category)}
                  onChange={handleCategoryChange}
                  className="form-checkbox"
                />
                <span className="ml-2">{category}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4 flex">
          <div className="mr-4">
            <label className="block mb-2">Start Date:</label>
            <input
              type="date"
              name="start"
              value={dates.start}
              onChange={handleDateChange}
              className="form-input"
            />
          </div>
          <div>
            <label className="block mb-2">End Date:</label>
            <input
              type="date"
              name="end"
              value={dates.end}
              onChange={handleDateChange}
              className="form-input"
            />
          </div>
        </div>
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow mr-2 p-2 border rounded"
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;