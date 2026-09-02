import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  className = ""
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const startRecording = async () => {
    // 1. First attempt Web Speech Recognition for instant on-device recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      try {
        const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognitionClass();
        recognition.lang = 'en-NG';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event?.results?.[0]?.[0]?.transcript;
          if (transcript) {
            onTranscript(transcript.trim());
          }
          setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
          console.warn("[SpeechRecognition event error]:", event?.error);
          setIsRecording(false);
          // Fall back to MediaRecorder if recognition fails
          if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
            console.warn("Microphone not allowed for SpeechRecognition.");
          } else {
            startMediaRecorder();
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (recErr) {
        console.warn("[SpeechRecognition start failed, falling back to MediaRecorder]:", recErr);
      }
    }

    // 2. Fallback to MediaRecorder + Gemini 3.6 Multimodal Audio API
    startMediaRecorder();
  };

  const startMediaRecorder = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Detect supported mimeType
      let mimeType = 'audio/webm';
      let options: MediaRecorderOptions = {};
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options = { mimeType: 'audio/webm;codecs=opus' };
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' };
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          options = { mimeType: 'audio/ogg' };
          mimeType = 'audio/ogg';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const resultStr = reader.result as string;
            const audioBase64 = resultStr ? resultStr.split(',')[1] : null;
            if (!audioBase64) {
              setIsProcessing(false);
              return;
            }

            try {
              const response = await fetch('/api/ai/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioBase64, mimeType })
              });

              const data = await response.json();
              if (data.success && data.text) {
                onTranscript(data.text);
              }
            } catch (postErr) {
              console.error("[Transcribe API error]:", postErr);
            } finally {
              setIsProcessing(false);
            }
          };
        } catch (err) {
          console.error("Audio processing failed", err);
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn("Microphone access could not be initialized:", err);
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
      setIsRecording(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isProcessing}
      title={isRecording ? "Stop voice dictation" : "Dictate with voice (gemini-3.5-transcribe)"}
      className={`p-2 rounded-lg transition-all flex items-center justify-center ${
        isRecording
          ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30 ring-2 ring-red-400'
          : isProcessing
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 cursor-wait'
          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800'
      } ${className}`}
    >
      {isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
      ) : isRecording ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
};
