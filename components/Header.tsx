
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          AI Creative Suite
        </h1>
        <p className="mt-2 text-lg text-gray-300">
          Your all-in-one AI-powered studio for posters, images, and more.
        </p>
      </div>
    </header>
  );
};

export default Header;
