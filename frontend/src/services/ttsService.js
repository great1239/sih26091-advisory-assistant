// Indic Text-To-Speech (TTS) Voice Engine (ttsService.js)
// Solves all browser speech synthesis bugs (Chrome 15s pause bug, getVoices async loading, language code matching, and phonetic symbol preprocessing).

class TTSService {
  constructor() {
    this.voices = [];
    this.currentUtterance = null;
    this.keepAliveInterval = null;
    this.onStateChange = null;
    this.initVoices();
  }

  initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    const updateVoices = () => {
      this.voices = window.speechSynthesis.getVoices() || [];
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  // Detects if text is Hindi / Hinglish or contains Devanagari script
  detectLanguage(text, requestedLang = 'Hindi') {
    if (!text) return 'en-IN';

    // 1. Devanagari Unicode Range (\u0900-\u097F)
    if (/[\u0900-\u097F]/.test(text)) {
      return 'hi-IN';
    }

    // 2. Tamil Unicode Range (\u0B80-\u0BFF)
    if (/[\u0B80-\u0BFF]/.test(text)) {
      return 'ta-IN';
    }

    // 3. Telugu Unicode Range (\u0C00-\u0C7F)
    if (/[\u0C00-\u0C7F]/.test(text)) {
      return 'te-IN';
    }

    // 4. Bengali Unicode Range (\u0980-\u09FF)
    if (/[\u0980-\u09FF]/.test(text)) {
      return 'bn-IN';
    }

    // 5. Common Hinglish Words
    const hinglishPattern = /\b(namaste|aapka|shuru|karein|rupaye|hazaar|lakh|dukaan|kirana|bataiye|yojana|byaj|vyapar|kharch|bhi|hai|hain|nahi|milenge|yojna|sarkar)\b/i;
    if (hinglishPattern.test(text)) {
      return 'hi-IN';
    }

    // 6. Fallback to requested language
    const langMap = {
      'Hindi': 'hi-IN',
      'Tamil': 'ta-IN',
      'Telugu': 'te-IN',
      'Marathi': 'mr-IN',
      'Bengali': 'bn-IN',
      'English': 'en-IN'
    };

    return langMap[requestedLang] || 'en-IN';
  }

  // Pre-process text to replace currency symbols & markdown for smooth speech
  cleanTextForSpeech(text) {
    if (!text) return '';
    let clean = String(text);

    // Replace Markdown symbols
    clean = clean.replace(/[*#_`~>]/g, ' ');
    clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Replace Indian Rupee Symbol with phonetic words
    clean = clean.replace(/₹\s*([0-9,]+(\.[0-9]+)?)/g, '$1 rupaye');
    clean = clean.replace(/₹/g, 'rupaye ');

    // Replace percentage
    clean = clean.replace(/%/g, ' percent ');

    // Clean whitespace
    clean = clean.replace(/\s+/g, ' ').trim();
    return clean;
  }

  // Find best available Indic / English voice
  getBestVoice(targetLangCode) {
    if (!this.voices || this.voices.length === 0) {
      this.voices = window.speechSynthesis.getVoices() || [];
    }

    // 1. Exact match (e.g. hi-IN, ta-IN)
    let voice = this.voices.find(v => v.lang === targetLangCode);
    if (voice) return voice;

    // 2. Language prefix match (e.g. hi, ta)
    const prefix = targetLangCode.split('-')[0];
    voice = this.voices.find(v => v.lang.startsWith(prefix));
    if (voice) return voice;

    // 3. Indian English / Google Indic fallback
    voice = this.voices.find(v => 
      v.lang === 'en-IN' || 
      v.name.includes('India') || 
      v.name.includes('Hindi') || 
      v.name.includes('हिन्दी') ||
      v.name.includes('Hemant') ||
      v.name.includes('Kalpana') ||
      v.name.includes('Swara') ||
      v.name.includes('Ravi') ||
      v.name.includes('Heera')
    );
    if (voice) return voice;

    // 4. Default voice
    return this.voices.find(v => v.default) || this.voices[0] || null;
  }

  // Speak text with safety handlers
  speak(text, options = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('[TTSService] Speech Synthesis is not supported in this browser.');
      return false;
    }

    // Stop any ongoing speech
    this.stop();

    const cleanText = this.cleanTextForSpeech(text);
    if (!cleanText) return false;

    const targetLangCode = this.detectLanguage(cleanText, options.language || 'Hindi');
    const selectedVoice = this.getBestVoice(targetLangCode);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetLangCode;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = options.rate || 0.95;
    utterance.pitch = options.pitch || 1.0;

    utterance.onstart = () => {
      this.startKeepAlive();
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.stopKeepAlive();
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      this.stopKeepAlive();
      this.currentUtterance = null;
      console.warn('[TTSService Error]', e);
      if (options.onError) options.onError(e);
    };

    this.currentUtterance = utterance;

    // Small timeout prevents Chrome race-condition where cancel() immediately aborts speak()
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[TTSService speak error]', err);
      }
    }, 40);

    return true;
  }

  stop() {
    this.stopKeepAlive();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    this.currentUtterance = null;
  }

  isSpeaking() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;
  }

  // Keep-alive for Chrome 15-second speech pause bug
  startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveInterval = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (!window.speechSynthesis.speaking) {
          this.stopKeepAlive();
        } else {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 10000);
  }

  stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }
}

export const ttsService = new TTSService();
export default ttsService;
