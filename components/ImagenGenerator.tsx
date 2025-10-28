import React, { useState, useEffect, useRef } from 'react';
import { generateWithImagen, suggestPrompt } from '../services/geminiService';
import ImageViewer from './ImageViewer';

// TypeScript interfaces for the Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: any) => void;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

declare var SpeechRecognition: { new(): SpeechRecognition; };
declare var webkitSpeechRecognition: { new(): SpeechRecognition; };

interface ImagenGeneratorProps {
  setIsLoading: (isLoading: boolean) => void;
}

const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];

const ImagenGenerator: React.FC<ImagenGeneratorProps> = ({ setIsLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Default to English for this component

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setPrompt(prevPrompt => prevPrompt + finalTranscript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    }

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

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
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A majestic lion wearing a crown, photorealistic, 8k"
              className="w-full h-24 bg-gray-700 text-white rounded-md border border-gray-600 p-3 pr-12 focus:ring-2 focus:ring-blue-500"
            />
             <button 
              onClick={handleListen} 
              className={`absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'}`}
              title={isListening ? 'Stop recording' : 'Start recording'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
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