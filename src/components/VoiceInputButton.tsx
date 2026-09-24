import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, Volume2, ShieldAlert, X } from 'lucide-react';
import { trackPermissionPromptAccepted, trackPermissionPromptDeclined } from '../services/analytics';

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
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Clear any temporary permission error after 5 seconds
  useEffect(() => {
    if (permissionError) {
      const timer = setTimeout(() => setPermissionError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [permissionError]);

  const requestAndStartRecording = () => {
    setPermissionError(null);
    const hasConsented = localStorage.getItem('campusai_mic_consent') === 'granted';

    if (!hasConsented) {
      setShowPermissionPrompt(true);
      return;
    }

    startRecording();
  };

  const handleAcceptPermission = () => {
    try {
      localStorage.setItem('campusai_mic_consent', 'granted');
    } catch (_) {}
    setShowPermissionPrompt(false);
    trackPermissionPromptAccepted({
      permission_type: 'microphone',
      feature: 'voice_input'
    });
    startRecording();
  };

  const handleDeclinePermission = () => {
    setShowPermissionPrompt(false);
    trackPermissionPromptDeclined({
      permission_type: 'microphone',
      feature: 'voice_input',
      reason: 'user_declined'
    });
    setPermissionError("Voice dictation cancelled. You can type directly in the text field.");
  };

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
            setPermissionError("Microphone access was not permitted. You can type your query in the input box.");
            trackPermissionPromptDeclined({
              permission_type: 'microphone',
              feature: 'speech_recognition',
              reason: 'browser_not_allowed'
            });
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
    } catch (err: any) {
      console.warn("Microphone access could not be initialized:", err);
      setIsRecording(false);
      setIsProcessing(false);
      setPermissionError("Microphone permission was denied or is blocked in browser settings. Please type your query.");
      trackPermissionPromptDeclined({
        permission_type: 'microphone',
        feature: 'media_recorder',
        reason: err?.name || 'blocked'
      });
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
      requestAndStartRecording();
    }
  };

  return (
    <>
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={handleClick}
          disabled={isProcessing}
          aria-label={isRecording ? "Stop voice dictation" : "Dictate with voice"}
          title={isRecording ? "Stop voice dictation" : "Dictate with voice"}
          className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
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

        {/* Temporary Graceful Fallback Message */}
        {permissionError && (
          <div className="absolute bottom-full mb-2 left-0 sm:left-auto sm:right-0 z-50 w-64 p-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl border border-slate-700 flex items-start gap-2 animate-in fade-in slide-in-from-bottom-1">
            <ShieldAlert size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px] leading-snug">{permissionError}</div>
            <button
              onClick={() => setPermissionError(null)}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Permission Explanation Dialog with "Not Now" Option */}
      {showPermissionPrompt && (
        <div 
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mic-permission-title"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-left space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Volume2 size={24} />
            </div>

            <div>
              <h3 id="mic-permission-title" className="text-lg font-black text-slate-900 dark:text-white">
                Enable Voice Input
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                CampusAI uses your microphone solely to transcribe your academic questions and search queries into text. Audio is processed for instant speech-to-text and is never permanently stored.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
              💡 <span className="font-semibold text-slate-700 dark:text-slate-300">Tip:</span> If you decline, you can always type your question manually in the input box.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDeclinePermission}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={handleAcceptPermission}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/20 transition-colors cursor-pointer text-center"
              >
                Allow Microphone
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

