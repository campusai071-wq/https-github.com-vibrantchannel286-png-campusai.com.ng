/**
 * Robust Speech & Audio Engine for CampusAI
 * Supports both Client-side Web Speech Synthesis (with iframe keep-alive & voice selection)
 * and Server-side Gemini 3.1 Flash TTS (PCM-to-WAV playback).
 */

export function cleanTextForSpeech(markdown: string): string {
  return markdown
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove images & links, keeping text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markers
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
    // Remove blockquotes and bullet dashes
    .replace(/^>\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    // Clean excessive spaces and newlines
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Encodes raw 16-bit PCM (from Gemini TTS API) into a standard WAV container
 * so standard HTML5 Audio can play it in any browser or iframe.
 */
export function pcmToWavUrl(
  pcmBase64: string,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): string {
  const binaryString = atob(pcmBase64);
  const len = binaryString.length;
  const pcmBytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    pcmBytes[i] = binaryString.charCodeAt(i);
  }

  const wavBuffer = new ArrayBuffer(44 + len);
  const view = new DataView(wavBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF identifier
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + len, true);
  writeString(8, 'WAVE');

  // fmt chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size for PCM
  view.setUint16(20, 1, true);  // AudioFormat 1 = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // ByteRate
  view.setUint16(32, numChannels * (bitsPerSample / 8), true); // BlockAlign
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(36, 'data');
  view.setUint32(40, len, true);

  // Copy audio samples
  const wavBytes = new Uint8Array(wavBuffer);
  wavBytes.set(pcmBytes, 44);

  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

let currentAudioElement: HTMLAudioElement | null = null;
let currentKeepAliveTimer: any = null;

/**
 * Stops any active speech synthesis or audio playback.
 */
export function stopAllSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }
  if (currentKeepAliveTimer) {
    clearInterval(currentKeepAliveTimer);
    currentKeepAliveTimer = null;
  }
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch (_) {}
    currentAudioElement = null;
  }
}

/**
 * Dual-engine speech player:
 * 1. Tries Web Speech API with browser audio unlocking & keep-alive
 * 2. Seamlessly falls back to Server-side Gemini TTS if Web Speech is blocked in iframe
 */
export async function speakText(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (msg: string) => void;
  }
): Promise<() => void> {
  stopAllSpeech();

  const clean = cleanTextForSpeech(text);
  if (!clean) {
    callbacks?.onEnd?.();
    return () => {};
  }

  let hasEnded = false;
  const finish = () => {
    if (hasEnded) return;
    hasEnded = true;
    if (currentKeepAliveTimer) {
      clearInterval(currentKeepAliveTimer);
      currentKeepAliveTimer = null;
    }
    callbacks?.onEnd?.();
  };

  // Helper to fallback to server-side Gemini TTS
  const fallbackToGeminiTTS = async () => {
    try {
      callbacks?.onStart?.();
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean.slice(0, 1200) })
      });

      if (!res.ok) {
        throw new Error('TTS service unavailable');
      }

      const data = await res.json();
      if (!data.success || !data.audioBase64) {
        throw new Error(data.error || 'Failed to generate voice');
      }

      const audioUrl = pcmToWavUrl(data.audioBase64, 24000);
      const audio = new Audio(audioUrl);
      currentAudioElement = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudioElement = null;
        finish();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudioElement = null;
        callbacks?.onError?.('Audio playback failed in this browser.');
        finish();
      };

      await audio.play();
    } catch (err: any) {
      console.warn('[Audio Player Fallback Error]:', err);
      callbacks?.onError?.('Voice speech could not be played. Please check sound settings.');
      finish();
    }
  };

  // Check if Web Speech API is supported
  const hasWebSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  if (hasWebSpeech) {
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferredVoice = voices.find(v => 
          v.lang.startsWith('en') && (
            v.name.includes('Natural') || 
            v.name.includes('Google') || 
            v.name.includes('Samantha') || 
            v.name.includes('Neural') ||
            v.name.includes('English')
          )
        ) || voices.find(v => v.lang.startsWith('en'));
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      let speechStarted = false;

      utterance.onstart = () => {
        speechStarted = true;
        callbacks?.onStart?.();

        // Chrome 15-second speech synthesis pause bug workaround
        if (currentKeepAliveTimer) clearInterval(currentKeepAliveTimer);
        currentKeepAliveTimer = setInterval(() => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10000);
      };

      utterance.onend = () => {
        finish();
      };

      utterance.onerror = (e) => {
        console.warn('[WebSpeech Utterance Error]:', e);
        // If error happened before starting or was blocked/not-allowed, try Gemini TTS
        if (!speechStarted) {
          fallbackToGeminiTTS();
        } else {
          finish();
        }
      };

      window.speechSynthesis.speak(utterance);

      // Timeout watchdog: if speech doesn't trigger within 1.2s in iframe, fallback to Gemini TTS
      setTimeout(() => {
        if (!speechStarted && !hasEnded) {
          console.warn('[WebSpeech Watchdog]: SpeechSynthesis did not start. Triggering Gemini TTS.');
          window.speechSynthesis.cancel();
          fallbackToGeminiTTS();
        }
      }, 1200);

      return () => {
        stopAllSpeech();
        finish();
      };
    } catch (err) {
      console.warn('[WebSpeech Exception]:', err);
      fallbackToGeminiTTS();
      return () => stopAllSpeech();
    }
  } else {
    // No Web Speech API support; use Gemini TTS directly
    fallbackToGeminiTTS();
    return () => stopAllSpeech();
  }
}
