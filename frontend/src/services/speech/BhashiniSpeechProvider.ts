// ============================================================================
// BhashiniSpeechProvider.ts - Stubbed Bhashini AI Pipeline Voice Adapter
// Architecture: Government of India Digital India Bhashini ULCA Pipeline
// ============================================================================

import {
  ISpeechProvider,
  SpeechRecognitionOptions,
  SpeechSynthesisOptions
} from './ISpeechProvider';
import { NativeSpeechProvider } from './NativeSpeechProvider';

export class BhashiniSpeechProvider implements ISpeechProvider {
  readonly providerId = 'bhashini';
  readonly providerName = 'Digital India Bhashini AI Speech Engine';

  private fallbackProvider = new NativeSpeechProvider();
  private apiKey: string | null = null;
  private userId: string | null = null;

  constructor(apiKey?: string, userId?: string) {
    this.apiKey = apiKey || null;
    this.userId = userId || null;
  }

  isSupported(): boolean {
    // If Bhashini credentials are not yet configured in env, fallback is supported
    return this.fallbackProvider.isSupported();
  }

  isListening(): boolean {
    return this.fallbackProvider.isListening();
  }

  isSpeaking(): boolean {
    return this.fallbackProvider.isSpeaking();
  }

  getSupportedLanguages(): string[] {
    return [
      'hi-IN', 'ta-IN', 'te-IN', 'bn-IN', 'mr-IN', 'gu-IN',
      'kn-IN', 'ml-IN', 'pa-IN', 'or-IN', 'as-IN', 'ur-IN', 'en-IN'
    ];
  }

  async startListening(options: SpeechRecognitionOptions): Promise<void> {
    if (!this.apiKey || !this.userId) {
      console.warn(
        '[BhashiniSpeechProvider] Bhashini API credentials not detected. Gracefully delegating to NativeSpeechProvider.'
      );
      return this.fallbackProvider.startListening(options);
    }

    // Future ULCA ASR pipeline implementation:
    // POST to https://dhruva-api.bhashini.gov.in/services/inference/pipeline
    throw new Error(
      'Bhashini ASR Pipeline is currently pending API credentials. Please set BHASHINI_API_KEY.'
    );
  }

  stopListening(): void {
    this.fallbackProvider.stopListening();
  }

  async speak(text: string, options?: SpeechSynthesisOptions): Promise<void> {
    if (!this.apiKey || !this.userId) {
      console.warn(
        '[BhashiniSpeechProvider] Bhashini API credentials not detected. Gracefully delegating to NativeSpeechProvider.'
      );
      return this.fallbackProvider.speak(text, options);
    }

    // Future ULCA TTS pipeline implementation
    throw new Error(
      'Bhashini TTS Pipeline is currently pending API credentials. Please set BHASHINI_API_KEY.'
    );
  }

  stopSpeaking(): void {
    this.fallbackProvider.stopSpeaking();
  }
}
