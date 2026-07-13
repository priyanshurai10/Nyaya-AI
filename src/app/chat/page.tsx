'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/context/LocationContext';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/lib/api-client';
import { translations } from '@/lib/translations';
import { getMockResponse, getGreeting } from '@/lib/mock-responses';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Paperclip,
  ArrowLeft,
  Sparkles,
  Bot,
  User,
  Heart,
  Loader2,
  FileText,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  nextSteps?: string[];
  requiresApproval?: boolean;
  approved?: boolean;
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const formatTime = (d: Date) =>
  d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/_(.*?)_/g, '<em>$1</em>');
    if (/^[\s]*•/.test(processed)) {
      return (
        <p
          key={i}
          className="pl-4 py-0.5 text-slate-800 dark:text-gray-200"
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      );
    }
    if (/^\d+\./.test(processed.trim())) {
      return (
        <p
          key={i}
          className="pl-4 py-0.5 text-slate-800 dark:text-gray-200"
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      );
    }
    if (processed.trim() === '') return <div key={i} className="h-2" />;
    return (
      <p
        key={i}
        className="py-0.5 text-slate-800 dark:text-gray-200"
        dangerouslySetInnerHTML={{ __html: processed }}
      />
    );
  });
}

export default function ChatPage() {
  const router = useRouter();
  const { selectedLang, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [motherMode, setMotherMode] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const { location } = useLocation();

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync theme & load greeting
  useEffect(() => {
    const greetingMsg: Message = {
      id: 'greeting',
      role: 'ai',
      content: getGreeting(motherMode),
      timestamp: new Date(),
    };
    setMessages([greetingMsg]);
  }, [motherMode]);

  // Auto Scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const suggestedQuestions = [
    { emoji: '📋', text: t('fir') || 'FIR kaise file kare?' },
    { emoji: '🏠', text: t('rent') || 'Rent agreement me kya check kare?' },
    { emoji: '✍️', text: t('notice') || 'Legal notice ka reply kaise dein?' },
    { emoji: '⚖️', text: t('bail') || 'Arrest hone par bail kaise milti hai?' },
  ];

  const handlePincodeResolve = useCallback(() => {
    // When location changes, update greeting or context
  }, []);

  const speakText = useCallback(
    (text: string, messageId: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      if (currentlySpeakingId === messageId) {
        window.speechSynthesis.cancel();
        setCurrentlySpeakingId(null);
        return;
      }

      window.speechSynthesis.cancel();
      // Strip markdown for speech synthesis
      let cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/###/g, '')
        .replace(/##/g, '')
        .replace(/#/g, '')
        .replace(/•/g, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      
      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        bn: 'bn-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        pa: 'pa-IN',
      };
      
      const targetLangCode = langMap[selectedLang] || 'en-IN';
      const selectedVoice =
        voices.find((v) => v.lang.startsWith(targetLangCode)) ||
        voices.find((v) => v.lang.startsWith(selectedLang)) ||
        voices.find((v) => v.lang.startsWith('en'));

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.lang = targetLangCode;
      
      utterance.onend = () => setCurrentlySpeakingId(null);
      utterance.onerror = () => setCurrentlySpeakingId(null);

      setCurrentlySpeakingId(messageId);
      window.speechSynthesis.speak(utterance);
    },
    [currentlySpeakingId, selectedLang]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      setShowSuggestions(false);
      const userMsg: Message = {
        id: uid(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
      setIsTyping(true);

      // Call API
      try {
        const payload: any = { message: trimmed, language: selectedLang };
        if (location) {
          payload.pincode = location.pincode;
          payload.city = location.city;
        }
        if (sessionId) {
          payload.session_id = sessionId;
        }

        const data = await apiClient.post<any>('/chat/message', payload);
        if (data.session_id) {
          setSessionId(data.session_id);
        }

        const aiMsg: Message = {
          id: uid(),
          role: 'ai',
          content: data.response,
          timestamp: new Date(),
          nextSteps: data.next_steps || [],
          requiresApproval: data.requires_approval || false,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err: any) {
        console.warn('Backend chat failed, falling back to mock response', err);
        // Fallback
        const mock = getMockResponse(trimmed, motherMode);
        const aiMsg: Message = {
          id: uid(),
          role: 'ai',
          content: mock.response,
          timestamp: new Date(),
          nextSteps: mock.nextSteps || [],
        };
        setMessages((prev) => [...prev, aiMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, selectedLang, location, sessionId, motherMode]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTyping(true);
    const scanMsgId = uid();
    const scanMsg: Message = {
      id: scanMsgId,
      role: 'ai',
      content: `📄 **Analyzing** \`${file.name}\` (${(file.size / 1024).toFixed(1)} KB)...`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, scanMsg]);

    const formData = new FormData();
    formData.append('file', file);
    if (sessionId) {
      formData.append('session_id', sessionId);
    }

    try {
      const data = await apiClient.upload<any>('/documents/upload', formData);
      setSessionId(data.session_id);
      
      const summaryContent = `
📄 **Document Scan Complete**

* **File Name:** \`${data.filename}\`
* **Classification:** **${(data.document_type || 'General').toUpperCase()}**

### 📋 Summary:
${data.analysis.summary}

### 🔑 Key Points:
${data.analysis.key_points.map((p: string) => `• ${p}`).join('\n')}

### ⚠️ Risk Score:
* **Risk Score:** \`${data.analysis.risk_score}/100\`
* **Level:** **${data.analysis.risk_level}**
      `.trim();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === scanMsgId
            ? {
                ...m,
                content: summaryContent,
                nextSteps: data.analysis.recommended_steps,
              }
            : m
        )
      );
    } catch (err: any) {
      console.warn('Backend file upload failed', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === scanMsgId
            ? {
                ...m,
                content: `📄 **Document Scanned:** \`${file.name}\` (${(file.size / 1024).toFixed(1)} KB)\n\nI have successfully scanned this file.\n\n⚠️ *System running in Offline Mock Mode.*`,
              }
            : m
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleApproveDraft = async (msgId: string) => {
    try {
      const msg = messages.find((m) => m.id === msgId);
      await apiClient.post('/chat/approve-draft', {
        session_id: sessionId,
        document_type: 'Legal Draft / Notice',
        draft_content: msg?.content || '',
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, approved: true } : m))
      );
    } catch (err) {
      console.error('Failed to approve draft', err);
    }
  };

  // Web Speech Recognition
  const toggleSpeech = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (voiceActive) {
      recognitionRef.current?.stop();
      setVoiceActive(false);
      return;
    }

    const rec = new SpeechRecognition();
    recognitionRef.current = rec;
    rec.lang = selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setVoiceActive(true);
    rec.onend = () => setVoiceActive(false);
    rec.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      sendMessage(speechToText);
    };

    rec.start();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0B1220] transition-colors duration-200">
      {/* Top action bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm relative z-15 select-none">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-white/60 dark:hover:text-white transition-all text-xs font-bold">
          <ArrowLeft size={16} />
          <span>Exit Assistant</span>
        </Link>

        {/* Mother Mode toggle */}
        <button
          onClick={() => setMotherMode(!motherMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 shadow-sm ${ motherMode ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 border-slate-200 text-slate-600 dark:bg-[#111827]/5 dark:hover:bg-slate-800 dark:border-white/10 dark:text-white/80' }`}
        >
          <Heart size={14} className={motherMode ? 'fill-rose-500' : ''} />
          <span>Mother Mode™</span>
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3.5 max-w-3xl ${ m.role === 'user' ? 'ml-auto flex-row-reverse' : '' }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm shadow-md shrink-0 select-none ${ m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-[#FF9933]' }`}
            >
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Message bubble */}
            <div className="space-y-2">
              <div
                className={`rounded-2xl p-4 shadow-sm border text-sm relative group ${ m.role === 'user' ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 dark:text-slate-100 rounded-tl-none' }`}
              >
                {/* Speech read-aloud button for AI responses */}
                {m.role === 'ai' && (
                  <button
                    onClick={() => speakText(m.content, m.id)}
                    className="absolute -right-9 top-1 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#111827]/5 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all"
                    title="Read Aloud"
                  >
                    {currentlySpeakingId === m.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                )}

                {renderMarkdown(m.content)}
              </div>

              {/* Timestamp */}
              <div
                className={`text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest ${ m.role === 'user' ? 'text-right' : '' }`}
              >
                {formatTime(m.timestamp)}
              </div>

              {/* Specialist actions */}
              {m.role === 'ai' && m.requiresApproval && !m.approved && (
                <div className="flex gap-2 animate-in fade-in duration-300">
                  <button
                    onClick={() => handleApproveDraft(m.id)}
                    className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <CheckCircle size={14} />
                    Approve Draft
                  </button>
                </div>
              )}

              {/* Bookmarked / Approved Success */}
              {m.role === 'ai' && m.approved && (
                <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-extrabold bg-green-50 dark:bg-green-500/10 p-3 rounded-xl border border-green-200 dark:border-green-500/20">
                  <CheckCircle size={14} />
                  Draft approved and saved to Case Folders!
                </div>
              )}

              {/* Suggested actions list */}
              {m.role === 'ai' && m.nextSteps && m.nextSteps.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {m.nextSteps.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(step)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 border border-indigo-150 dark:border-blue-500/20 text-indigo-650 dark:text-blue-400 rounded-xl text-[10px] font-extrabold transition-all duration-200 uppercase tracking-wider"
                    >
                      {step}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 max-w-sm text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 p-3 rounded-2xl animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-[#FF9933]" />
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts on new chat */}
      {showSuggestions && (
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 relative z-10 select-none">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q.text)}
              className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl text-left hover:scale-[1.02] hover:border-indigo-600 dark:hover:border-indigo-500 transition-all group"
            >
              <div className="text-xl mb-1.5 group-hover:scale-110 transition-transform duration-300">{q.emoji}</div>
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-snug">
                {q.text}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 p-4 relative z-10 select-none">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {/* File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all shadow-sm border border-slate-200 dark:border-white/5"
            title="Attach Document"
          >
            <Paperclip size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            className="hidden"
          />

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              disabled={isTyping}
              placeholder={
                motherMode
                  ? 'Aapki pareshani simple words mein bataein...'
                  : t('chatPlaceholder') || 'Ask your legal question...'
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputValue)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Voice Input Button */}
          <button
            onClick={toggleSpeech}
            className={`p-3 rounded-xl transition-all shadow-sm border ${ voiceActive ? 'bg-rose-600 text-white animate-pulse border-rose-500' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5' }`}
            title="Voice Search"
          >
            {voiceActive ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Send Button */}
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            className="p-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-xl transition-all flex items-center justify-center shadow-md shadow-indigo-500/10"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
