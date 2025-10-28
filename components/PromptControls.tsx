import React, { useState, useEffect, useRef } from 'react';

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


interface PromptControlsProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
}

const PromptControls: React.FC<PromptControlsProps> = ({ prompt, setPrompt }) => {
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<'en-US' | 'ta-IN'>('en-US');
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
    recognition.lang = language;

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
  }, [language, setPrompt]);
  
  const handleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };


  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">Choose Prompt Language</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setLanguage('en-US')}
            className={`px-4 py-2 font-semibold rounded-md transition-colors ${language === 'en-US' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('ta-IN')}
            className={`px-4 py-2 font-semibold rounded-md transition-colors ${language === 'ta-IN' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            தமிழ் (Tamil)
          </button>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">
          Describe your poster idea
        </h3>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A vintage-style travel poster for Mars, with a rocket and red canyons."
            className="w-full h-24 bg-gray-700 text-white rounded-md border border-gray-600 p-3 pr-12 focus:ring-2 focus:ring-blue-500 transition-shadow"
            rows={3}
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
      </div>
    </div>
  );
};

export default PromptControls;