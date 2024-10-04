import React, { useState, useRef, useEffect } from 'react';
import API from '../services/API';

const ChatButton = ({ darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);
    setSuccess(false);

    try {
      await API.post('email-question', { data: { question: question } });
      setSuccess(true);
      setQuestion('');
    } catch (err) {
      setError('Failed to send question. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white p-4 rounded-full shadow-lg ${darkMode ? 'hover:bg-blue-700' : 'hover:bg-blue-600'} transition-colors z-50`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {isOpen && (
        <div ref={chatWindowRef} className={`fixed bottom-20 right-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-80 z-50`}>
          <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Ask a Question</h2>
            <button
              onClick={() => setIsOpen(false)}
              className={`absolute top-2 right-2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ✕
            </button>
          </div>
          <div className="p-4">
            <form onSubmit={handleSubmit}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className={`w-full p-2 border rounded mb-4 ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-100 border-gray-600' 
                    : 'bg-white text-gray-900 border-gray-300'
                }`}
                rows="4"
                placeholder="Type your question here..."
                required
              />
              <button
                type="submit"
                disabled={isSending}
                className={`w-full px-4 py-2 ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white rounded disabled:opacity-50`}
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </form>
            {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
            {success && <p className="mt-2 text-green-500 text-sm">Question sent successfully!</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatButton;