import React from 'react';

interface PromptControlsProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
}

const PromptControls: React.FC<PromptControlsProps> = ({ prompt, setPrompt }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-200 mb-2">
        Describe your poster idea
      </h3>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., A vintage-style travel poster for Mars, with a rocket and red canyons."
        className="w-full h-24 bg-gray-700 text-white rounded-md border border-gray-600 p-3 focus:ring-2 focus:ring-blue-500 transition-shadow"
        rows={3}
      />
    </div>
  );
};

export default PromptControls;
