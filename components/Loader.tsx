import React, { useState, useEffect } from 'react';

const messages = [
  "Summoning creative spirits...",
  "Painting with pixels...",
  "Teaching the AI about art history...",
  "This might take a moment, great art needs patience.",
  "Analyzing your image for poster potential...",
  "Warming up the generative engine...",
];

const Loader: React.FC = () => {
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        let newMessage;
        do {
          newMessage = messages[Math.floor(Math.random() * messages.length)];
        } while (newMessage === prevMessage);
        return newMessage;
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
      <svg className="animate-spin h-12 w-12 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="mt-4 text-white text-lg font-semibold text-center px-4">{message}</p>
    </div>
  );
};

export default Loader;
