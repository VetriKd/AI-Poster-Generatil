

import React, { useState, useEffect, useRef } from 'react';
import ImageUploader from './ImageUploader';
import ImageViewer from './ImageViewer';
import { generatePoster } from '../services/geminiService';
import PromptControls from './PromptControls';
import { dataUrlToFile } from '../utils/file';
import CanvasEditor from './CanvasEditor';

interface PosterStudioProps {
  setIsLoading: (isLoading: boolean) => void;
}

const PosterStudio: React.FC<PosterStudioProps> = ({ setIsLoading }) => {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [posterImageUrl, setPosterImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const topOfPageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!originalImageFile) {
      setOriginalImageUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(originalImageFile);
    setOriginalImageUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [originalImageFile]);

  const handleImageUpload = (file: File) => {
    setOriginalImageFile(file);
  };

  const handleGeneratePoster = async () => {
    if (!prompt) {
      setError('Please create a prompt first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setPosterImageUrl(null);
    
    try {
      const generatedPosterUrl = await generatePoster(prompt, originalImageFile);
      setPosterImageUrl(generatedPosterUrl);
      setIsEditing(false); 
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Generation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenEditor = () => {
    if (!posterImageUrl) return;
    setIsEditorOpen(true);
  };

  const handleSaveFromEditor = (editedImageUrl: string) => {
    setPosterImageUrl(editedImageUrl);
    setIsEditorOpen(false);
  }


  const handleReset = () => {
    setOriginalImageFile(null);
    setOriginalImageUrl(null);
    setPosterImageUrl(null);
    setError(null);
    setPrompt(''); 
    setIsEditing(false);
  };

  return (
    <div className="space-y-8" ref={topOfPageRef}>
      {isEditorOpen && posterImageUrl && (
          <CanvasEditor 
            imageUrl={posterImageUrl}
            onSave={handleSaveFromEditor}
            onClose={() => setIsEditorOpen(false)}
          />
      )}

      {(!posterImageUrl || isEditing) && !isEditorOpen && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700">
              <PromptControls
                prompt={prompt}
                setPrompt={setPrompt}
              />
               <div className="mt-8 text-center">
                 <button
                  onClick={handleGeneratePoster}
                  className="w-full sm:w-auto flex-grow bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
                >
                  {isEditing ? '🎨 Apply Changes' : '✨ Generate Poster'}
                </button>
            </div>
              <div className="mt-6 border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 text-center">
                   {isEditing ? "Editing This Image" : "Add an Image to Edit (Optional)"}
                </h3>
                {originalImageFile ? (
                   <div className="text-center relative w-full max-w-sm mx-auto group">
                    <img src={originalImageUrl} alt="Uploaded preview" className="rounded-lg shadow-md mx-auto" />
                    <button 
                      onClick={() => setOriginalImageFile(null)} 
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-7 w-7 flex items-center justify-center font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <ImageUploader onImageUpload={handleImageUpload} />
                )}
              </div>
          </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
          <p>{error}</p>
        </div>
      )}

      {posterImageUrl && !isEditing && !isEditorOpen && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImageViewer title="Source Image" imageUrl={originalImageUrl}>
              <div className="text-center text-gray-500">
                <p>No starting image was used.</p>
              </div>
            </ImageViewer>
            <ImageViewer title="Generated Poster" imageUrl={posterImageUrl} />
          </div>
          <div className="text-center space-x-4 flex items-center justify-center flex-wrap gap-4">
              <a
                href={posterImageUrl}
                download="ai-poster.png"
                className="inline-block bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-all duration-300"
              >
                  Download Poster
              </a>
               <button
                onClick={handleOpenEditor}
                className="inline-block bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-all duration-300"
              >
                Fine-Tune in Editor
              </button>
              <button onClick={handleReset} className="text-gray-400 hover:text-white transition">Start Over</button>
          </div>
        </>
      )}
    </div>
  );
};

export default PosterStudio;