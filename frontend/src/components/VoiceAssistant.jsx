import React from 'react';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { useSpeech } from '../context/SpeechContext';

export default function VoiceAssistant({ textToSpeak, language, onVoiceInput }) {
  const { isSpeaking, isListening, speak, stopSpeaking, startListening, stopListening, t, currentLanguage } = useSpeech();

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (!textToSpeak) return;

    speak(textToSpeak, 'voice-assistant-audio', {
      language: language || currentLanguage
    });
  };

  const handleListen = () => {
    if (isListening) {
      stopListening();
      return;
    }

    startListening({
      language: language || currentLanguage,
      onResult: (transcript, isFinal) => {
        if (isFinal && onVoiceInput) {
          onVoiceInput(transcript);
        }
      }
    });
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Read Aloud Button */}
      {textToSpeak && (
        <button
          type="button"
          onClick={handleSpeak}
          className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isSpeaking
              ? 'bg-amber-500 text-white animate-pulse shadow-amber-500/20'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span>{isSpeaking ? (t('stop_audio') || 'Stop Audio') : (t('voiceListen') || 'Listen Aloud')}</span>
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
          <span>{isListening ? 'Listening...' : (t('voiceMic') || 'Voice Input')}</span>
        </button>
      )}
    </div>
  );
}
