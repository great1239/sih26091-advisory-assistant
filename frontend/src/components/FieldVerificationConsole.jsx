import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  FileCheck,
  MapPin,
  Building2,
  DollarSign,
  User,
  Sliders,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { useSpeech } from '../context/SpeechContext';
import { offlineStorage } from '../services/offlineStorage';

export default function FieldVerificationConsole({
  onAssessmentComplete,
  selectedCoords,
  onLocationChange
}) {
  const {
    speak,
    stopSpeaking,
    speakingMessageId,
    startListening,
    stopListening,
    isListening,
    currentLanguage,
    setLanguage,
    t
  } = useSpeech();

  const [messages, setMessages] = useState([
    {
      id: 'init-01',
      sender: 'system',
      text: 'Field Verification Console initialized. Input beneficiary operational profile or dictate via audio recording bar.',
      rawText: 'Field Verification Console initialized. Input beneficiary operational profile or dictate via audio recording bar.'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Field Verification Ledger State
  const [currentState, setCurrentState] = useState({
    beneficiary_name: 'Beneficiary',
    latitude: selectedCoords?.lat || 28.6139,
    longitude: selectedCoords?.lng || 77.2090,
    geographic_location: 'Delhi / NCR Sector Hub',
    margin_capital: null,
    business_category: '',
    social_category: 'General',
    land_asset_status: 'Owned',
    years_in_industry: 0,
    specific_skillsets: []
  });

  const [missingParams, setMissingParams] = useState([
    'margin_capital',
    'business_category'
  ]);
  const [quickOptions, setQuickOptions] = useState([
    'Kirana Store (₹15,000 Equity)',
    'Tailoring Unit (₹20,000 Equity)',
    'Commercial Dairy (₹25,000 Equity)',
    'Spice & Flour Processing (₹30,000 Equity)'
  ]);

  const messagesEndRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Sync coordinates when map pin drops
  useEffect(() => {
    if (selectedCoords?.lat && selectedCoords?.lng) {
      setCurrentState((prev) => ({
        ...prev,
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng
      }));
    }
  }, [selectedCoords]);

  // Audio level animation when listening
  useEffect(() => {
    if (isListening) {
      const updateWave = () => {
        setAudioLevel(Math.floor(20 + Math.random() * 80));
        animationFrameRef.current = requestAnimationFrame(updateWave);
      };
      animationFrameRef.current = requestAnimationFrame(updateWave);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setAudioLevel(0);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isListening]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening({
        language: currentLanguage,
        onResult: (transcript, isFinal) => {
          setInputText(transcript);
          if (isFinal) {
            handleTransmitMessage(transcript);
          }
        }
      });
    }
  };

  const handleTransmitMessage = async (textOverride) => {
    const text = textOverride || inputText;
    if (!text.trim() || loading) return;

    if (!textOverride) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: 'user', text }
      ]);
      setInputText('');
    }

    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender === 'user' ? 'user' : 'ai',
        text: m.rawText || m.text
      }));

      const response = await axios.post('/api/chat/extract', {
        message: text,
        current_state: currentState,
        conversation_history: historyPayload
      });

      const data = response.data;
      if (data.extracted_parameters) {
        setCurrentState(data.extracted_parameters);
        offlineStorage.saveDraft(data.extracted_parameters);
        if (data.extracted_parameters.ui_translation_language) {
          setLanguage(data.extracted_parameters.ui_translation_language);
        }
      }

      setMissingParams(data.missing_parameters || []);
      if (data.suggested_quick_replies?.length > 0) {
        setQuickOptions(data.suggested_quick_replies);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'system',
          text: data.conversational_reply,
          rawText: data.conversational_reply
        }
      ]);

      if (data.assessment_result) {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
        onAssessmentComplete(data.assessment_result);
      }
    } catch (err) {
      console.error('[Field Verification Error]', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'system',
          text: 'Extraction error encountered. Please check connectivity or specify margin cash and business sector.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetConsole = () => {
    stopSpeaking();
    stopListening();
    setCurrentState({
      beneficiary_name: 'Beneficiary',
      latitude: selectedCoords?.lat || 28.6139,
      longitude: selectedCoords?.lng || 77.2090,
      geographic_location: 'Selected Map Plot',
      margin_capital: null,
      business_category: '',
      social_category: 'General',
      land_asset_status: 'Owned',
      years_in_industry: 0,
      specific_skillsets: []
    });
    setMissingParams(['margin_capital', 'business_category']);
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'system',
        text: 'Console cleared. Please input operational parameters.'
      }
    ]);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-institutional flex flex-col h-[780px] overflow-hidden text-slate-800 text-xs">
      {/* 1. Header Bar */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-slate-900 text-white">
            <FileCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-xs text-slate-900 tracking-tight block">
              Field Verification Console
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              GPS: {currentState.latitude?.toFixed(4)}°N, {currentState.longitude?.toFixed(4)}°E
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              missingParams.length === 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {missingParams.length === 0
              ? 'Profile Complete'
              : `${missingParams.length} Parameters Required`}
          </span>

          <button
            onClick={handleResetConsole}
            title="Reset Console"
            className="p-1.5 rounded hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Structured Key-Value Parameter Ledger */}
      <div className="p-3 bg-slate-50/50 border-b border-slate-200">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="text-[10px] font-semibold uppercase text-slate-500 block">
              Target Enterprise
            </span>
            <span className="font-bold text-slate-900 truncate block mt-0.5">
              {currentState.business_category || 'Pending Specification'}
            </span>
          </div>

          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="text-[10px] font-semibold uppercase text-slate-500 block">
              Margin Equity (10%)
            </span>
            <span className="font-bold font-mono text-slate-900 block mt-0.5">
              {currentState.margin_capital
                ? `₹${Number(currentState.margin_capital).toLocaleString()}`
                : 'Pending Verification'}
            </span>
          </div>

          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="text-[10px] font-semibold uppercase text-slate-500 block">
              MoSJE Demographic Category
            </span>
            <span className="font-bold text-slate-900 block mt-0.5">
              {currentState.social_category || 'General'}
            </span>
          </div>

          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="text-[10px] font-semibold uppercase text-slate-500 block">
              Domain Experience
            </span>
            <span className="font-bold text-slate-900 block mt-0.5">
              {currentState.years_in_industry || 0} Years
            </span>
          </div>
        </div>
      </div>

      {/* 3. Operational Message Stream */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-white">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[90%] rounded-lg p-2.5 text-xs leading-relaxed border ${
                m.sender === 'user'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-900 border-slate-200'
              }`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: (typeof m.text === 'string' ? m.text : m.rawText || '')
                    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                    .replace(/\n/g, '<br/>')
                }}
              />

              {m.sender === 'system' && (
                <div className="mt-2 pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Advisory Pipeline</span>
                  <button
                    type="button"
                    onClick={() => speak(m.rawText || m.text, m.id)}
                    className="p-1 hover:text-slate-900 flex items-center space-x-1"
                  >
                    {speakingMessageId === m.id ? (
                      <>
                        <VolumeX className="w-3 h-3 text-amber-700" />
                        <span className="text-amber-800 font-bold">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 text-slate-600" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-slate-500 text-[11px] p-2 bg-slate-50 border border-slate-200 rounded-lg w-max">
            <span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" />
            <span>Computing 5km telemetry & credit structuring...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Quick Parameter Injectors */}
      {quickOptions.length > 0 && (
        <div className="px-3 py-2 border-t border-slate-100 bg-slate-50 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
            Suggested:
          </span>
          {quickOptions.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleTransmitMessage(opt)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold rounded shrink-0 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* 5. Tactile Audio Recording Bar & Decibel Visualizer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80 space-y-2">
        {isListening && (
          <div className="p-2 bg-slate-900 text-white rounded-lg flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="font-mono text-[11px] font-bold">
                RECORDING AUDIO ({currentLanguage})
              </span>
            </div>

            {/* Waveform Bar */}
            <div className="flex items-center space-x-1 h-3">
              {[40, 70, 90, 60, 80, 45, 95, 30].map((h, idx) => (
                <div
                  key={idx}
                  className="w-1 bg-emerald-400 rounded-full transition-all duration-100"
                  style={{
                    height: `${Math.max(4, Math.min(12, (audioLevel * h) / 100))}px`
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          {/* Audio Bar Trigger */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`p-2 rounded-lg border flex items-center justify-center transition-colors ${
              isListening
                ? 'bg-rose-600 border-rose-600 text-white'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
            }`}
            title={isListening ? 'Stop Voice Recording' : 'Start Audio Input'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input Console */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTransmitMessage()}
            placeholder="Type enterprise name, margin capital (e.g. ₹20,000), or category..."
            className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 transition-colors"
          />

          <button
            type="button"
            onClick={() => handleTransmitMessage()}
            disabled={loading || !inputText.trim()}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold rounded-lg text-xs flex items-center space-x-1 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Process</span>
          </button>
        </div>
      </div>
    </div>
  );
}
