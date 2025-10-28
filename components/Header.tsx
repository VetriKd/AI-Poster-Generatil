import React from 'react';

interface HeaderProps {
  onSetupBrandKit: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSetupBrandKit }) => {
  return (
    <header className="py-6">
      <div className="container mx-auto text-center relative">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          AI Creative Suite
        </h1>
        <p className="mt-2 text-lg text-gray-300">
          Your all-in-one AI-powered studio for posters, images, and more.
        </p>
        <div className="absolute top-1/2 right-4 -translate-y-1/2">
            <button 
              onClick={onSetupBrandKit}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Setup Brand Kit
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;