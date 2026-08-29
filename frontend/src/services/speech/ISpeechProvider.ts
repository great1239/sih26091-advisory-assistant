// ============================================================================
// ISpeechProvider.ts - Speech Recognition & Synthesis Provider Interface
// Architecture: Voice Adapter Pattern (Future-Proofed for Bhashini & Native Web API)
// ============================================================================

export interface SpeechRecognitionOptions {
  language?: string; // e.g., 'hi-IN', 'ta-IN', 'te-IN', 'en-US'
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface SpeechSynthesisOptions {
  language?: string; // e.g., 'hi-IN', 'ta-IN', 'te-IN', 'en-US'
  rate?: number; // 0.1 to 10 (default: 1.0)
  pitch?: number; // 0 to 2 (default: 1.0)
  volume?: number; // 0 to 1 (default: 1.0)
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export interface ISpeechProvider {
  readonly providerId: string;
  readonly providerName: string;

  /** Check if this speech provider is supported in the current environment */
  isSupported(): boolean;

  /** Check if the microphone STT is currently active */
  isListening(): boolean;

  /** Check if speech synthesis TTS is currently speaking */
  isSpeaking(): boolean;

  /** Start speech-to-text listening */
  startListening(options: SpeechRecognitionOptions): Promise<void>;

  /** Stop speech-to-text listening */
  stopListening(): void;

  /** Vocalize text in the target native Indian language */
  speak(text: string, options?: SpeechSynthesisOptions): Promise<void>;

  /** Immediately cancel any ongoing speech playback */
  stopSpeaking(): void;

  /** Get list of supported language codes (e.g. ['hi-IN', 'ta-IN', 'te-IN', 'mr-IN', 'bn-IN', 'en-US']) */
  getSupportedLanguages(): string[];
}
