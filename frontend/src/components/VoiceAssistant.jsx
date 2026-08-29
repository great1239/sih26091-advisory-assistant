import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Sparkles } from 'lucide-react';
import { translations } from '../translations';
import { ttsService } from '../services/ttsService';

export default function VoiceAssistant({ textToSpeak, language = 'Hindi', onVoiceInput }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const t = translations[language] || translations.English;

  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  const handleSpeak = () => {
    if (isPlaying) {
      ttsService.stop();
      setIsPlaying(false);
      return;
    }

    if (!textToSpeak) return;

    setIsPlaying(true);
    ttsService.speak(textToSpeak, {
      language: language,
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false)
    });
  };

  const handleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langMap = {
        'Hindi': 'hi-IN',
        'Tamil': 'ta-IN',
        'Telugu': 'te-IN',
        'Marathi': 'mr-IN',
        'Bengali': 'bn-IN',
        'English': 'en-IN'
      };
      recognition.lang = langMap[language] || 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onVoiceInput) {
          onVoiceInput(transcript);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('[Voice Recognition error]', err);
      setIsListening(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Read Aloud Button */}
      {textToSpeak && (
        <button
          type="button"
          onClick={handleSpeak}
          className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isPlaying
              ? 'bg-amber-500 text-white animate-pulse shadow-amber-500/20'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
          }`}
        >
          {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'Stop Audio' : t.voiceListen}</span>
        </button>
      )}

      {/* Voice Input Mic */}
      {onVoiceInput && (
        <button
          type="button"
          onClick={handleListen}
          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isListening
              ? 'bg-rose-500 text-white animate-bounce shadow-rose-500/20'
              : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
          }`}
        >
          {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          <span>{isListening ? 'Listening...' : t.voiceMic}</span>
        </button>
      )}
    </div>
  );
}
