import React, { useState } from 'react';
import { generateWithImagen, suggestPrompt } from '../services/geminiService';
import ImageViewer from './ImageViewer';

interface ImagenGeneratorProps {
  setIsLoading: (isLoading: boolean) => void;
}

const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];

const ImagenGenerator: React.FC<ImagenGeneratorProps> = ({ setIsLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const result = await generateWithImagen(prompt, aspectRatio);
      setImageUrl(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Generation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestPrompt = async () => {
    setIsLoading(true);
    const suggestion = await suggestPrompt();
    setPrompt(suggestion);
    setIsLoading(false);
  }

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Describe the image you want to create</h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A majestic lion wearing a crown, photorealistic, 8k"
            className="w-full h-24 bg-gray-700 text-white rounded-md border border-gray-600 p-3 focus:ring-2 focus:ring-blue-500"
          />
           <button 
              onClick={handleSuggestPrompt} 
              className="text-sm text-blue-400 hover:text-blue-300 mt-2"
            >
              Suggest a prompt for me
            </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">Choose Aspect Ratio</h3>
          <div className="flex flex-wrap gap-2">
            {aspectRatios.map(ar => (
              <button
                key={ar}
                onClick={() => setAspectRatio(ar)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${aspectRatio === ar ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                {ar}
              </button>
            ))}
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={handleGenerate}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:from-blue-600 hover:to-purple-700"
          >
            ✨ Generate Image
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
          <p>{error}</p>
        </div>
      )}

      {imageUrl && (
        <div className="space-y-4">
            <ImageViewer title="Generated Image" imageUrl={imageUrl} />
             <div className="text-center">
                <a
                    href={imageUrl}
                    download="imagen-generated-image.png"
                    className="inline-block bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600"
                >
                    Download Image
                </a>
            </div>
        </div>
      )}
    </div>
  );
};

export default ImagenGenerator;
