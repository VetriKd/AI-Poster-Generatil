import React from 'react';
import { TabValue } from '../App';

interface TabsProps {
  activeTab: TabValue;
  setActiveTab: (tab: TabValue) => void;
}

const TABS: { label: string; value: TabValue }[] = [
  { label: 'Poster Studio', value: 'poster' },
  { label: 'Replicate Design', value: 'replicate' },
  { label: 'Imagen Generate', value: 'imagen' },
  { label: 'Live Agent', value: 'live' },
  { label: 'Analyze Image', value: 'analyze' },
  { label: 'Transcribe Audio', value: 'transcribe' },
];

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 border-b border-gray-700 pb-4">
      {TABS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => setActiveTab(value)}
          className={`px-3 py-2 text-sm sm:px-4 sm:text-base font-semibold rounded-md transition-all duration-200 ${
            activeTab === value
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
