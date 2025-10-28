import React, { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import ImageViewer from './ImageViewer';
import { replicateDesign } from '../services/geminiService';

interface DesignReplicatorProps {
  setIsLoading: (isLoading: boolean) => void;
}

const DesignReplicator: React.FC<DesignReplicatorProps> = ({ setIsLoading }) => {
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referenceUrl, setReferenceUrl] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!referenceFile) {
      setReferenceUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(referenceFile);
    setReferenceUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [referenceFile]);

  const handleImageUpload = (file: File) => {
    setReferenceFile(file);
    setGeneratedUrl(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!referenceFile) {
      setError('Please upload a reference image first.');
      return;
    }
    if (!prompt) {
      setError('Please describe the new content for the poster.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedUrl(null);
    
    try {
      const resultUrl = await replicateDesign(referenceFile, prompt);
      setGeneratedUrl(resultUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Generation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReferenceFile(null);
    setGeneratedUrl(null);
    setPrompt('');
    setError(null);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700 space-y-6">
        <h2 className="text-xl font-bold text-center">Replicate a Design</h2>
        
        {!referenceFile ? (
          <ImageUploader onImageUpload={handleImageUpload} />
        ) : (
          <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-200 mb-2">1. Reference Image</h3>
                <div className="relative w-full max-w-sm mx-auto group">
                    <img src={referenceUrl} alt="Reference design" className="rounded-lg shadow-md" />
                     <button 
                      onClick={() => setReferenceFile(null)} 
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-7 w-7 flex items-center justify-center font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      &times;
                    </button>
                </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">2. Describe New Content</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A robot drinking coffee."
                className="w-full h-24 bg-gray-700 text-white rounded-md border border-gray-600 p-3 focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="text-center">
              <button
                onClick={handleGenerate}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:from-blue-600 hover:to-purple-700"
              >
                ✨ Generate Replica
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
          <p>{error}</p>
        </div>
      )}

      {generatedUrl && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImageViewer title="Reference Design" imageUrl={referenceUrl} />
            <ImageViewer title="Generated Replica" imageUrl={generatedUrl} />
          </div>
          <div className="text-center space-x-4">
             <a
                href={generatedUrl}
                download="ai-replicated-poster.png"
                className="inline-block bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600"
              >
                Download Replica
            </a>
            <button onClick={handleReset} className="text-gray-400 hover:text-white transition">Start Over</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignReplicator;
