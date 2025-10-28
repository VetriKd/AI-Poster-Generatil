import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import React, { useState, useRef, useEffect } from 'react';
import { decode, encode, decodeAudioData } from '../utils/audio';

interface TranscriptionEntry {
  speaker: 'user' | 'model';
  text: string;
}

// Helper function to correctly create audio blob for the API.
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const LiveAgent: React.FC<{ setIsLoading: (l: boolean) => void; }> = ({ setIsLoading }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
  const [language, setLanguage] = useState<'en-US' | 'ta-IN'>('en-US');
  
  const sessionRef = useRef<LiveSession | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopConversation();
    };
  }, []);

  const stopConversation = () => {
    setIsConnecting(false);
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
    }
     if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
    }
    setIsConnected(false);
  };
  
  const startConversation = async () => {
    setIsConnecting(true);
    setIsLoading(true);
    setTranscriptionHistory([]);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const langName = language === 'en-US' ? 'English' : 'Tamil';
      const systemInstruction = `You are Sarah, a creative AI agent. You are having a conversation with a user.

*** ABSOLUTE AND CRITICAL RULE ***
The user has selected their language as: ${langName}.
Your transcription engine MUST be locked to ${langName}.
Your response language MUST be locked to ${langName}.

**DO NOT** under any circumstances, attempt to auto-detect the language.
**DO NOT** transcribe the user's speech into any language other than ${langName}. For example, if the user selects English, you must not transcribe it as Hindi, Spanish, or any other language. All transcription output must be in English.
**DO NOT** respond in any language other than ${langName}.

Your entire functionality for this session is hard-coded to ${langName} for both input transcription and audio output. There are no exceptions.

Your persona is Sarah, a helpful creative assistant. Do not mention being an AI, a model, or Google. Your world is this application. Begin the conversation after the user starts speaking.`;
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsConnected(true);
            setIsLoading(false);
            
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
            outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
            
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                setTranscriptionHistory(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.speaker === 'user') {
                        return [...prev.slice(0, -1), { speaker: 'user', text: last.text + text }];
                    }
                    return [...prev, { speaker: 'user', text }];
                });
            } else if (message.serverContent?.outputTranscription) {
                 const text = message.serverContent.outputTranscription.text;
                 setTranscriptionHistory(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.speaker === 'model') {
                        return [...prev.slice(0, -1), { speaker: 'model', text: last.text + text }];
                    }
                    return [...prev, { speaker: 'model', text }];
                });
            }

            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const audioCtx = outputAudioContextRef.current;
              
              // FIX: Resume audio context if it gets suspended by the browser
              if (audioCtx.state === 'suspended') {
                await audioCtx.resume();
              }
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
              const source = audioCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live session error:', e);
            alert(`Connection Error: ${e.message}. Please try again.`);
            stopConversation();
            setIsLoading(false);
          },
          onclose: () => {
            setIsConnected(false);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: { },
          outputAudioTranscription: { },
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: systemInstruction,
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error("Failed to start conversation:", error);
      alert("Could not access microphone. Please check your browser permissions.");
      setIsConnecting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700 space-y-4">
      <h2 className="text-xl font-bold text-center">Conversational AI Agent</h2>
      
      {!isConnected && !isConnecting && (
        <div className="space-y-3 text-center">
          <h3 className="text-lg font-semibold text-gray-200">Choose Language</h3>
          <div className="flex justify-center gap-4">
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
      )}
      
      <div className="text-center pt-2">
        {!isConnected && !isConnecting && (
          <button onClick={startConversation} className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600">
            Start Conversation
          </button>
        )}
        {isConnecting && (
            <p className="text-gray-400">Connecting...</p>
        )}
        {isConnected && (
          <button onClick={stopConversation} className="bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600">
            End Conversation
          </button>
        )}
      </div>
       <div className="w-full h-64 bg-gray-900/50 rounded-lg p-4 overflow-y-auto space-y-3">
            {transcriptionHistory.length === 0 && <p className="text-gray-500 text-center">Conversation will appear here...</p>}
            {transcriptionHistory.map((entry, index) => (
                <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <p className={`max-w-[80%] p-2 rounded-lg ${entry.speaker === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>
                       {entry.text}
                    </p>
                </div>
            ))}
       </div>
    </div>
  );
};

export default LiveAgent;