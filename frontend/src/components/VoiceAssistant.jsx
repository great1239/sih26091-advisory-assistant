import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Sparkles } from 'lucide-react';
import { translations } from '../translations';

export default function VoiceAssistant({ textToSpeak, language = 'Hindi', onVoiceInput }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const t = translations[language] || translations.English;

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    // Configure Indic dialect if available
    utterance.lang = language === 'Hindi' ? 'hi-IN' : language === 'Tamil' ? 'ta-IN' : 'en-IN';
    utterance.rate = 0.95; // Clearer pace for rural users

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'Hindi' ? 'hi-IN' : language === 'Tamil' ? 'ta-IN' : 'en-IN';
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
      console.error(err);
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
          className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
            isPlaying
              ? 'bg-amber-500 text-white animate-pulse'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
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
          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
            isListening
              ? 'bg-rose-500 text-white animate-bounce'
              : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
          }`}
        >
          {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          <span>{isListening ? 'Listening...' : t.voiceMic}</span>
        </button>
      )}
    </div>
  );
}
