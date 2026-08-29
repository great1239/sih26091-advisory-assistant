// ============================================================================
// SpeechContext.tsx - Dependency Injection Voice & Dynamic Multilingual Context
// Future-Proofed Architecture: Injects ISpeechProvider based on ENV configuration
// ============================================================================

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  ISpeechProvider,
  SpeechRecognitionOptions,
  SpeechSynthesisOptions
} from '../services/speech/ISpeechProvider';
import { NativeSpeechProvider } from '../services/speech/NativeSpeechProvider';
import { BhashiniSpeechProvider } from '../services/speech/BhashiniSpeechProvider';
import { translations } from '../translations';

interface SpeechContextValue {
  provider: ISpeechProvider;
  currentLanguage: string; // e.g. 'hi-IN', 'ta-IN', 'en-US'
  isListening: boolean;
  isSpeaking: boolean;
  speakingMessageId: string | null;
  setLanguage: (langCode: string) => void;
  startListening: (options: SpeechRecognitionOptions) => Promise<void>;
  stopListening: () => void;
  speak: (text: string, messageId?: string, options?: SpeechSynthesisOptions) => Promise<void>;
  stopSpeaking: () => void;
  t: (key: string) => string;
}

const SpeechContext = createContext<SpeechContextValue | null>(null);

// Factory method for Dependency Injection
function createSpeechProvider(): ISpeechProvider {
  const providerType =
    (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_SPEECH_PROVIDER || process.env.VITE_SPEECH_PROVIDER)) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SPEECH_PROVIDER) ||
    'native';

  if (providerType === 'bhashini') {
    return new BhashiniSpeechProvider();
  }
  return new NativeSpeechProvider();
}

export const SpeechProvider: React.FC<{ children: ReactNode; initialLanguage?: string }> = ({
  children,
  initialLanguage = 'en-US'
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(initialLanguage);
  const [isListeningState, setIsListeningState] = useState<boolean>(false);
  const [isSpeakingState, setIsSpeakingState] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Instantiate the injected Speech Provider once
  const provider = useMemo<ISpeechProvider>(() => createSpeechProvider(), []);

  // Update UI Language dynamically when Gemini backend sends ui_translation_language
  const setLanguage = (langCode: string) => {
    if (!langCode) return;
    const normalized = langCode.trim();
    setCurrentLanguage(normalized);
  };

  const startListening = async (options: SpeechRecognitionOptions) => {
    setIsListeningState(true);
    try {
      await provider.startListening({
        ...options,
        language: options.language || currentLanguage,
        onEnd: () => {
          setIsListeningState(false);
          if (options.onEnd) options.onEnd();
        },
        onError: (err) => {
          setIsListeningState(false);
          if (options.onError) options.onError(err);
        }
      });
    } catch (e) {
      setIsListeningState(false);
    }
  };

  const stopListening = () => {
    provider.stopListening();
    setIsListeningState(false);
  };

  const speak = async (text: string, messageId?: string, options?: SpeechSynthesisOptions) => {
    if (speakingMessageId === messageId && isSpeakingState) {
      stopSpeaking();
      return;
    }

    setSpeakingMessageId(messageId || 'global-audio');
    setIsSpeakingState(true);

    try {
      await provider.speak(text, {
        ...options,
        language: options?.language || currentLanguage,
        onStart: () => {
          setIsSpeakingState(true);
          if (options?.onStart) options.onStart();
        },
        onEnd: () => {
          setIsSpeakingState(false);
          setSpeakingMessageId(null);
          if (options?.onEnd) options.onEnd();
        },
        onError: (err) => {
          setIsSpeakingState(false);
          setSpeakingMessageId(null);
          if (options?.onError) options.onError(err);
        }
      });
    } catch (e) {
      setIsSpeakingState(false);
      setSpeakingMessageId(null);
    }
  };

  const stopSpeaking = () => {
    provider.stopSpeaking();
    setIsSpeakingState(false);
    setSpeakingMessageId(null);
  };

  // Dynamic native language UI translation lookup
  const t = (key: string): string => {
    const langCode = currentLanguage.split('-')[0].toLowerCase();
    const langNameMap: Record<string, string> = {
      hi: 'Hindi',
      bn: 'Bengali',
      te: 'Telugu',
      mr: 'Marathi',
      ta: 'Tamil',
      gu: 'Gujarati',
      kn: 'Kannada',
      ml: 'Malayalam',
      pa: 'Punjabi',
      or: 'Odia',
      as: 'Assamese',
      ur: 'Urdu',
      en: 'English'
    };
    const langName = langNameMap[langCode] || 'English';
    const dict = (translations as any)[langName] || (translations as any)['English'] || {};
    return dict[key] || (translations as any)['English']?.[key] || key;
  };

  const contextValue: SpeechContextValue = {
    provider,
    currentLanguage,
    isListening: isListeningState,
    isSpeaking: isSpeakingState,
    speakingMessageId,
    setLanguage,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    t
  };

  return <SpeechContext.Provider value={contextValue}>{children}</SpeechContext.Provider>;
};

export const useSpeech = (): SpeechContextValue => {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
};

export default SpeechContext;
