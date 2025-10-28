import React, { useState } from 'react';
import ImageUploader from './ImageUploader';
import PromptControls from './PromptControls';
import ImageViewer from './ImageViewer';
import { generatePoster } from '../services/geminiService';
import { BrandKitData } from '../App';
import CanvasEditor from './CanvasEditor';

interface PosterStudioProps {
  setIsLoading: (isLoading: boolean) => void;
  brandKit: BrandKitData | null;
}

const PosterStudio: React.FC<PosterStudioProps> = ({ setIsLoading, brandKit }) => {
  const [baseImageFile, setBaseImageFile] = useState<File | null>(null);
  const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null);
  const [generatedPosterUrl, setGeneratedPosterUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleImageUpload = (file: File) => {
    setBaseImageFile(file);
    setBaseImageUrl(URL.createObjectURL(file));
    setGeneratedPosterUrl(null); // Clear previous result
    setError(null);
  };

  const handleGenerate = async () => {
    if (!baseImageFile) {
      setError('Please upload a base image first.');
      return;
    }
    if (!prompt) {
      setError('Please enter a prompt to describe your poster.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedPosterUrl(null);
    try {
      const resultUrl = await generatePoster(baseImageFile, prompt, brandKit);
      setGeneratedPosterUrl(resultUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Generation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setBaseImageFile(null);
    setBaseImageUrl(null);
    setGeneratedPosterUrl(null);
    setPrompt('');
    setError(null);
  };
  
  const handleSaveEdit = (dataUrl: string) => {
      setGeneratedPosterUrl(dataUrl);
      setIsEditing(false);
  }

  if (isEditing && generatedPosterUrl) {
      return <CanvasEditor imageUrl={generatedPosterUrl} onSave={handleSaveEdit} onClose={() => setIsEditing(false)} />
  }

  return (
    <div className="space-y-8">
      {!baseImageUrl ? (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700">
          <h2 className="text-xl font-bold text-center mb-6">Create a Poster</h2>
          <ImageUploader onImageUpload={handleImageUpload} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImageViewer title="Base Image" imageUrl={baseImageUrl}>
              <button onClick={handleStartOver} className="mt-4 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700">
                Change Image
              </button>
            </ImageViewer>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700 space-y-6 flex flex-col justify-center">
              <PromptControls prompt={prompt} setPrompt={setPrompt} />
              <div className="text-center mt-4">
                <button
                  onClick={handleGenerate}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  ✨ Generate Poster
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
              <p>{error}</p>
            </div>
          )}

          {generatedPosterUrl && (
            <div className="space-y-4 pt-8">
              <ImageViewer title="Generated Poster" imageUrl={generatedPosterUrl} />
              <div className="text-center space-x-4">
                 <button onClick={() => setIsEditing(true)} className="inline-block bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-600">
                    Edit Poster
                </button>
                <a
                  href={generatedPosterUrl}
                  download="ai-generated-poster.png"
                  className="inline-block bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600"
                >
                  Download Poster
                </a>
                <button onClick={handleStartOver} className="text-gray-400 hover:text-white transition">Start Over</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PosterStudio;
