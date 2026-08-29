// ============================================================================
// NativeSpeechProvider.ts - HTML5 Web Speech API Voice Adapter Implementation
// Features: Full Unicode Indian Script Detection, Keep-Alive Watchdog,
// Clean SpeechRecognition & SpeechSynthesis Lifecycle.
// ============================================================================

import {
  ISpeechProvider,
  SpeechRecognitionOptions,
  SpeechSynthesisOptions
} from './ISpeechProvider';

const INDIAN_LANG_MAP: Record<string, string> = {
  'hi-IN': 'hi-IN',
  'hi': 'hi-IN',
  'hindi': 'hi-IN',
  'bn-IN': 'bn-IN',
  'bn': 'bn-IN',
  'bengali': 'bn-IN',
  'te-IN': 'te-IN',
  'te': 'te-IN',
  'telugu': 'te-IN',
  'mr-IN': 'mr-IN',
  'mr': 'mr-IN',
  'marathi': 'mr-IN',
  'ta-IN': 'ta-IN',
  'ta': 'ta-IN',
  'tamil': 'ta-IN',
  'gu-IN': 'gu-IN',
  'gu': 'gu-IN',
  'gujarati': 'gu-IN',
  'kn-IN': 'kn-IN',
  'kn': 'kn-IN',
  'kannada': 'kn-IN',
  'ml-IN': 'ml-IN',
  'ml': 'ml-IN',
  'malayalam': 'ml-IN',
  'pa-IN': 'pa-IN',
  'pa': 'pa-IN',
  'punjabi': 'pa-IN',
  'or-IN': 'or-IN',
  'odia': 'or-IN',
  'as-IN': 'as-IN',
  'assamese': 'as-IN',
  'ur-IN': 'ur-IN',
  'ur': 'ur-IN',
  'urdu': 'ur-IN',
  'en-IN': 'en-IN',
  'en-US': 'en-US',
  'en': 'en-IN'
};

export class NativeSpeechProvider implements ISpeechProvider {
  readonly providerId = 'native';
  readonly providerName = 'HTML5 Native Web Speech Provider';

  private recognitionInstance: any = null;
  private isListeningActive = false;
  private keepAliveInterval: any = null;

  isSupported(): boolean {
    const hasSTT = typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window;
    return hasSTT || hasTTS;
  }

  isListening(): boolean {
    return this.isListeningActive;
  }

  isSpeaking(): boolean {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false;
    return window.speechSynthesis.speaking;
  }

  getSupportedLanguages(): string[] {
    return [
      'en-IN', 'en-US', 'hi-IN', 'bn-IN', 'te-IN', 'mr-IN', 'ta-IN',
      'gu-IN', 'kn-IN', 'ml-IN', 'pa-IN', 'or-IN', 'as-IN', 'ur-IN'
    ];
  }

  async startListening(options: SpeechRecognitionOptions): Promise<void> {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (options.onError) {
        options.onError('SpeechRecognition is not supported in this browser.');
      }
      return;
    }

    this.stopListening();

    try {
      const recognition = new SpeechRecognition();
      const langKey = (options.language || 'hi-IN').toLowerCase();
      recognition.lang = INDIAN_LANG_MAP[langKey] || 'hi-IN';
      recognition.continuous = options.continuous ?? false;
      recognition.interimResults = options.interimResults ?? true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        this.isListeningActive = true;
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const activeTranscript = finalTranscript || interimTranscript;
        if (options.onResult && activeTranscript) {
          options.onResult(activeTranscript, !!finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        this.isListeningActive = false;
        if (options.onError) {
          options.onError(event.error || 'Speech recognition error occurred.');
        }
      };

      recognition.onend = () => {
        this.isListeningActive = false;
        if (options.onEnd) {
          options.onEnd();
        }
      };

      this.recognitionInstance = recognition;
      recognition.start();
    } catch (err: any) {
      this.isListeningActive = false;
      if (options.onError) {
        options.onError(err.message || 'Failed to initialize speech recognition.');
      }
    }
  }

  stopListening(): void {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch (e) {}
      this.recognitionInstance = null;
    }
    this.isListeningActive = false;
  }

  private cleanCurrencyPhonetics(text: string, langCode: string): string {
    let clean = text
      .replace(/₹\s*([0-9,]+)/g, (_, val) => `${val.replace(/,/g, '')} rupees `)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/#{1,6}\s+/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[\n\r]+/g, ' ')
      .trim();

    if (langCode.startsWith('hi')) {
      clean = clean.replace(/rupees/gi, 'rupaye');
    }
    return clean;
  }

  private detectScriptLanguage(text: string, defaultLang: string): string {
    if (/[\u0900-\u097F]/.test(text)) return 'hi-IN'; // Devanagari (Hindi / Marathi)
    if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN'; // Bengali / Assamese
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN'; // Tamil
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN'; // Telugu
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu-IN'; // Gujarati
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN'; // Kannada
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN'; // Malayalam
    if (/[\u0A00-\u0A7F]/.test(text)) return 'pa-IN'; // Punjabi
    if (/[\u0B00-\u0B7F]/.test(text)) return 'or-IN'; // Odia
    if (/[\u0600-\u06FF]/.test(text)) return 'ur-IN'; // Urdu
    return defaultLang;
  }

  async speak(text: string, options?: SpeechSynthesisOptions): Promise<void> {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (options?.onError) options.onError('SpeechSynthesis is not supported.');
      return;
    }

    this.stopSpeaking();

    const rawLang = (options?.language || 'hi-IN').toLowerCase();
    const mappedLang = INDIAN_LANG_MAP[rawLang] || 'hi-IN';
    const detectedLang = this.detectScriptLanguage(text, mappedLang);
    const sanitizedText = this.cleanCurrencyPhonetics(text, detectedLang);

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(sanitizedText);
      utterance.lang = detectedLang;
      utterance.rate = options?.rate ?? 0.95;
      utterance.pitch = options?.pitch ?? 1.0;
      utterance.volume = options?.volume ?? 1.0;

      // Select Best Available Voice
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = detectedLang.split('-')[0];
      const matchedVoice =
        voices.find((v) => v.lang.toLowerCase() === detectedLang.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
        voices.find((v) => v.lang.toLowerCase().includes('in')) ||
        null;

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      // Chrome 15-Second Freeze Workaround (Keep-Alive Watchdog)
      if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(this.keepAliveInterval);
        } else {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);

      utterance.onstart = () => {
        if (options?.onStart) options.onStart();
      };

      utterance.onend = () => {
        if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
        if (options?.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (e: any) => {
        if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
        if (options?.onError) options.onError(e.error || 'TTS Playback Error');
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  stopSpeaking(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
      window.speechSynthesis.cancel();
    }
  }
}
