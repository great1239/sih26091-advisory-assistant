// COST GUARDRAIL: Free tier only
// Natural language conversational stream powered by Google AI Studio (Gemini 2.5 Flash / Flash Latest) free tier.
// Includes in-flight request debouncing, contextual quick-reply pills, Indic TTS read-aloud, and 429 quota alerts.
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Bot,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Briefcase,
  Users,
  Award,
  Layers,
  Compass,
  Volume2,
  VolumeX,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import VoiceAssistant from './VoiceAssistant';
import LiveLocationMap from './LiveLocationMap';
import { offlineStorage } from '../services/offlineStorage';
import { ttsService } from '../services/ttsService';

export default function ChatOnboarding({ onAssessmentComplete, language }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: (
        <span>
          👋 <b>Namaste! I am Vikas Sarthi</b>, your MoSJE AI Business Advisory Assistant.
          <br /><br />
          I am here to help you structure a viable rural enterprise, assess local market demand, and calculate your concessional government loan.
          <br /><br />
          How can I assist you today? Feel free to describe your enterprise idea, available capital, or ask any scheme questions.
        </span>
      ),
      rawText: "Namaste! I am Vikas Sarthi, your MoSJE AI Business Advisory Assistant. How can I assist you today? Feel free to describe your enterprise idea, available capital, or ask any scheme questions.",
      quickReplies: []
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [missingParams, setMissingParams] = useState([]);
  const [currentQuickReplies, setCurrentQuickReplies] = useState([]);
  const [currentState, setCurrentState] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    geographic_location: 'Selected Map Plot'
  });
  const [extractedDisplay, setExtractedDisplay] = useState(null);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  const socialCategoryShortcuts = [
    'OBC', 'SC', 'ST', 'Women', 'General', 'PwD / Divyang', 'Safai Karamchari'
  ];

  // Text-To-Speech read aloud in Indic voice
  const speakMessage = (msgId, textToSpeak) => {
    if (speakingMessageId === msgId) {
      ttsService.stop();
      setSpeakingMessageId(null);
      return;
    }

    const cleanText = typeof textToSpeak === 'string'
      ? textToSpeak
      : 'Namaste! I am Vikas Sarthi, your MoSJE AI Business Advisor.';

    setSpeakingMessageId(msgId);
    ttsService.speak(cleanText, {
      language: language || 'Hindi',
      onEnd: () => setSpeakingMessageId(null),
      onError: () => setSpeakingMessageId(null)
    });
  };

  // Reset conversation
  const handleResetChat = () => {
    ttsService.stop();
    setSpeakingMessageId(null);
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: "Namaste! Let's start fresh. Tell me about your business idea or how much savings you have.",
        rawText: "Namaste! Let's start fresh. Tell me about your business idea or how much savings you have.",
        quickReplies: ["🏪 Kirana Store (₹15k)", "🥛 Dairy Farm", "👩 Tailoring Unit", "🌾 Spice Mill"]
      }
    ]);
    setCurrentState({
      latitude: 28.6139,
      longitude: 77.2090,
      geographic_location: 'Selected Map Plot'
    });
    setExtractedDisplay(null);
    setMissingParams([]);
    setCurrentQuickReplies(["🏪 Kirana Store (₹15k)", "🥛 Dairy Farm", "👩 Tailoring Unit", "🌾 Spice Mill"]);
  };

  // Transmit message to Gemini
  const handleSendMessage = async (textToSend, stateOverride) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    if (!textToSend) {
      const userMsg = {
        id: Date.now().toString(),
        sender: 'user',
        text: text
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
    }

    setLoading(true);

    try {
      const activeState = stateOverride || currentState;
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: typeof m.text === 'string' ? m.text : (m.rawText || '')
      }));

      const response = await axios.post('/api/chat/extract', {
        message: text,
        current_state: activeState,
        conversation_history: historyPayload
      });

      const data = response.data;
      setCurrentState(data.extracted_parameters);
      setExtractedDisplay(data.extracted_parameters);
      setMissingParams(data.missing_parameters || []);
      if (data.suggested_quick_replies && data.suggested_quick_replies.length > 0) {
        setCurrentQuickReplies(data.suggested_quick_replies);
      }
      offlineStorage.saveDraft(data.extracted_parameters);

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.conversational_reply,
        rawText: data.conversational_reply,
        quickReplies: data.suggested_quick_replies || []
      };
      setMessages((prev) => [...prev, aiMsg]);

      // If assessment ready, celebrate with confetti & trigger dashboard
      if (data.assessment_result) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
        onAssessmentComplete(data.assessment_result);
      }
    } catch (err) {
      console.error(err);
      let errorMsg = 'I encountered an issue processing that. Please try describing your margin capital, sector, or category.';
      
      if (err.response && err.response.status === 429) {
        errorMsg = '⏳ Free-tier request quota limit reached. Please wait 10 seconds before sending another message to protect developer rate limits.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: errorMsg,
          rawText: errorMsg
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col h-[780px] relative">
      
      {/* Top Chat Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-xs sm:text-sm text-white tracking-tight">
                Vikas Sarthi Live AI
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ● Gemini AI Studio
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Interactive MoSJE Business Advisory Mentor
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Live Coordinate Badge in Header */}
          {extractedDisplay?.latitude && (
            <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-emerald-300 border border-slate-700 font-mono text-[10px] hidden sm:flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-rose-400" />
              <span>{extractedDisplay.latitude.toFixed(3)}, {extractedDisplay.longitude.toFixed(3)}</span>
            </span>
          )}

          <button
            onClick={handleResetChat}
            title="Reset Conversation"
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start space-x-2.5 ${
                m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-gradient-to-tr from-indigo-600 to-blue-700 shadow-md shadow-indigo-500/20'
                }`}
              >
                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className="max-w-[85%] space-y-1.5">
                <div
                  className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white font-medium shadow-md rounded-tr-sm'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-sm font-sans'
                  }`}
                >
                  {typeof m.text === 'string' ? (
                    <div
                      className="prose prose-xs max-w-none text-slate-800"
                      dangerouslySetInnerHTML={{
                        __html: m.text
                          .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                          .replace(/\*(.*?)\*/g, '<i>$1</i>')
                          .replace(/\n/g, '<br/>')
                      }}
                    />
                  ) : (
                    m.text
                  )}

                  {/* Speaker Button on AI Messages */}
                  {m.sender === 'ai' && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[9px] text-slate-400 font-medium">
                        MoSJE Concessional Advisory
                      </span>
                      <button
                        type="button"
                        onClick={() => speakMessage(m.id, m.rawText || m.text)}
                        title={speakingMessageId === m.id ? "Stop Audio" : "Listen Aloud (Voice TTS)"}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black transition-all shadow-xs ${
                          speakingMessageId === m.id
                            ? 'bg-amber-500 text-white animate-pulse shadow-amber-500/30'
                            : 'bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 border border-slate-200/80'
                        }`}
                      >
                        {speakingMessageId === m.id ? (
                          <>
                            <VolumeX className="w-3 h-3 text-white" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-blue-600" />
                            <span>Listen Aloud</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Inline Quick Action Pills */}
                {m.sender === 'ai' && m.quickReplies && m.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.quickReplies.map((qr, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={loading}
                        onClick={() => handleSendMessage(qr)}
                        className="px-2.5 py-1 rounded-xl bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200/90 text-[10px] font-bold text-slate-700 shadow-xs transition-all disabled:opacity-50"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2 text-slate-400 text-xs py-1 pl-9"
          >
            <div className="flex space-x-1 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-[10px] font-medium text-slate-500">
              Vikas Sarthi is thinking & checking 5km micro-market saturation...
            </span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Dynamic Social Category Quick-Select Chips (Shown when social category is requested) */}
      {missingParams.some((m) => m.includes('Social Category')) && (
        <div className="p-2 px-3 bg-blue-50/90 border-t border-blue-200/80 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider flex-shrink-0">
            Category:
          </span>
          {socialCategoryShortcuts.map((cat, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleSendMessage(cat)}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-blue-300 text-[10px] font-bold text-blue-800 whitespace-nowrap shadow-xs transition-all flex-shrink-0 disabled:opacity-50"
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Contextual Interactive Suggestions Bar */}
      {currentQuickReplies && currentQuickReplies.length > 0 && (
        <div className="p-2 px-3 bg-white border-t border-slate-200 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center space-x-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
            <span>Suggestions:</span>
          </span>
          {currentQuickReplies.map((qr, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleSendMessage(qr)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200/80 text-[10px] font-bold text-slate-700 whitespace-nowrap transition-all flex-shrink-0 disabled:opacity-50"
            >
              {qr}
            </button>
          ))}
        </div>
      )}

      {/* Conversational Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <VoiceAssistant
            language={language}
            onVoiceInput={(text) => handleSendMessage(text)}
          />

          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything or describe your business (e.g. 'How to start a dairy with 15k?')..."
              className="w-full pl-3 pr-10 py-2.5 rounded-2xl bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white text-xs font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:outline-hidden"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="w-9 h-9 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shadow-blue-600/20 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
