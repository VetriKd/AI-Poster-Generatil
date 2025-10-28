import React, { useState, useRef } from 'react';
import { transcribeAudio, generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';

interface AudioTranscriberProps {
  setIsLoading: (isLoading: boolean) => void;
}

const AudioTranscriber: React.FC<AudioTranscriberProps> = ({ setIsLoading }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    setTranscription('');
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        
        // Use the blob to call the transcription service
        setIsLoading(true);
        try {
            const result = await transcribeAudio(new File([audioBlob], "recording.webm"));
            setTranscription(result);
        } catch(err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Transcription failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }

        // Stop media tracks
        stream.getTracks().forEach(track => track.stop());
      };
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Could not start recording. Please check microphone permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

   const handleReadAloud = async () => {
      if (!transcription) return;
      setIsLoading(true);
      try {
        const { audioData, mimeType } = await generateSpeech(transcription);
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
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700 space-y-6">
      <h2 className="text-xl font-bold text-center">Transcribe Audio</h2>
      <div className="flex justify-center">
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`p-4 rounded-full transition-colors text-white ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isRecording ? 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            :
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          }
        </button>
      </div>
      <p className="text-center text-gray-400">{isRecording ? "Recording in progress..." : "Click the microphone to start recording"}</p>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
          <p>{error}</p>
        </div>
      )}

      {transcription && (
        <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Transcription Result:</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{transcription}</p>
            <button onClick={handleReadAloud} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v4a1 1 0 11-2 0V4a1 1 0 011-1zm-2.002 8.415a1 1 0 011.415-1.414l.707.707a1 1 0 01-1.415 1.414l-.707-.707zM15.414 10l-.707.707a1 1 0 11-1.415-1.414l.707-.707a1 1 0 111.415 1.414zM4.586 10l.707.707A1 1 0 013.879 12.12l-.707-.707a1 1 0 011.414-1.414zM10 15a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" /></svg>
                Read Aloud
            </button>
        </div>
      )}
    </div>
  );
};

export default AudioTranscriber;