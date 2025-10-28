import React, { useState } from 'react';
import ImageUploader from './ImageUploader';
import { analyzeImage, generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';

interface ImageAnalyzerProps {
  setIsLoading: (isLoading: boolean) => void;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ setIsLoading }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    setImageFile(file);
    setAnalysis('');
    setError(null);
    setImageUrl(URL.createObjectURL(file));

    setIsLoading(true);
    try {
      const result = await analyzeImage(file);
      setAnalysis(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadAloud = async () => {
      if (!analysis) return;
      setIsLoading(true);
      try {
        const { audioData, mimeType } = await generateSpeech(analysis);
        // FIX: Cast window to any to access webkitAudioContext for cross-browser compatibility.
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(audioData), audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      } catch (error) {
          console.error("TTS failed", error);
          alert("Failed to generate speech.");
      } finally {
          setIsLoading(false);
      }
  }

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700 space-y-6">
        <h2 className="text-xl font-bold text-center">Analyze an Image</h2>
        {!imageFile && <ImageUploader onImageUpload={handleImageUpload} />}
        
        {error && (
            <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
                <p>{error}</p>
            </div>
        )}

        {imageUrl && (
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
                 <img src={imageUrl} alt="Uploaded for analysis" className="rounded-lg shadow-md mx-auto" />
                 <button onClick={() => {setImageFile(null); setImageUrl(null); setAnalysis('')}} className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700">
                    Analyze Another Image
                </button>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">AI Analysis:</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{analysis}</p>
                {analysis && (
                     <button onClick={handleReadAloud} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v4a1 1 0 11-2 0V4a1 1 0 011-1zm-2.002 8.415a1 1 0 011.415-1.414l.707.707a1 1 0 01-1.415 1.414l-.707-.707zM15.414 10l-.707.707a1 1 0 11-1.415-1.414l.707-.707a1 1 0 111.415 1.414zM4.586 10l.707.707A1 1 0 013.879 12.12l-.707-.707a1 1 0 011.414-1.414zM10 15a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" /></svg>
                        Read Aloud
                    </button>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnalyzer;