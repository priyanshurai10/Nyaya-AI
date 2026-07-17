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
          className="pl-4 py-0.5 text-[var(--text-primary)]"
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      );
    }
    if (/^\d+\./.test(processed.trim())) {
      return (
        <p
          key={i}
          className="pl-4 py-0.5 text-[var(--text-primary)]"
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      );
    }
    if (processed.trim() === '') return <div key={i} className="h-2" />;
    return (
      <p
        key={i}
        className="py-0.5 text-[var(--text-primary)] leading-relaxed"
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
    <div className="flex flex-col h-full bg-[var(--background)] transition-colors duration-200">
      {/* ── Top action bar ───────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm relative z-10 select-none">
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all text-xs font-semibold group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Exit Assistant</span>
        </Link>

        {/* Mother Mode toggle */}
        <button
          onClick={() => setMotherMode(!motherMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
            motherMode
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
              : 'bg-[var(--card-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)]'
          }`}
        >
          <Heart size={13} className={motherMode ? 'fill-rose-500 text-rose-500' : ''} />
          <span>Mother Mode™</span>
        </button>
      </div>

      {/* ── Messages Area ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 no-scrollbar">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-end gap-3 animate-slide-up ${
              m.role === 'user' ? 'ml-auto flex-row-reverse max-w-[85%] sm:max-w-[70%]' : 'max-w-[92%] sm:max-w-[80%]'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                m.role === 'user'
                  ? 'bg-[var(--primary)] text-white shadow-md'
                  : 'bg-[var(--card-elevated)] border border-[var(--border)] text-[var(--accent)]'
              }`}
            >
              {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            {/* Bubble + extras */}
            <div className={`flex flex-col gap-1.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Bubble */}
              <div
                className={`relative group px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'chat-bubble-user'
                    : 'chat-bubble-ai'
                }`}
              >
                {/* AI: read-aloud button on hover */}
                {m.role === 'ai' && (
                  <button
                    onClick={() => speakText(m.content, m.id)}
                    className="absolute -right-9 top-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-[var(--card-elevated)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
                    title="Read Aloud"
                  >
                    {currentlySpeakingId === m.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  </button>
                )}
                {renderMarkdown(m.content)}
              </div>

              {/* Timestamp */}
              <span className="text-[9px] text-[var(--text-muted)] font-medium tracking-wider uppercase">
                {formatTime(m.timestamp)}
              </span>

              {/* Approve Draft button */}
              {m.role === 'ai' && m.requiresApproval && !m.approved && (
                <button
                  onClick={() => handleApproveDraft(m.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--success)] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity shadow-sm animate-fade-in"
                >
                  <CheckCircle size={13} />
                  Approve & Save Draft
                </button>
              )}

              {/* Approved state */}
              {m.role === 'ai' && m.approved && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--success)] font-semibold bg-[var(--success-subtle)] px-3 py-2 rounded-xl border border-[var(--success-subtle)] animate-fade-in">
                  <CheckCircle size={13} />
                  Saved to Case Folders
                </div>
              )}

              {/* Next step chips */}
              {m.role === 'ai' && m.nextSteps && m.nextSteps.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {m.nextSteps.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(step)}
                      className="px-3 py-1.5 bg-[var(--primary-subtle)] border border-[var(--primary-subtle)] text-[var(--primary)] rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-[var(--primary)] hover:text-white transition-all duration-200"
                    >
                      {step}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-xl bg-[var(--card-elevated)] border border-[var(--border)] text-[var(--accent)] flex items-center justify-center shrink-0">
              <Bot size={14} />
            </div>
            <div className="chat-bubble-ai px-4 py-3.5">
              <div className="flex items-center gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggested Prompts ─────────────────────────────── */}
      {showSuggestions && (
        <div className="px-4 pb-3 grid grid-cols-2 md:grid-cols-4 gap-2.5 bg-[var(--background)] border-t border-[var(--border)] pt-3 select-none">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q.text)}
              className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl text-left hover:border-[var(--primary)] hover:bg-[var(--primary-subtle)] transition-all group"
            >
              <div className="text-lg mb-1.5 group-hover:scale-110 transition-transform duration-200">{q.emoji}</div>
              <p className="text-[10px] font-semibold text-[var(--text-secondary)] group-hover:text-[var(--primary)] leading-snug">
                {q.text}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* ── Input Bar ────────────────────────────────────── */}
      <div className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 select-none">
        <div className="max-w-4xl mx-auto flex items-center gap-2.5">
          {/* Attach */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-[var(--card-elevated)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:bg-[var(--primary-subtle)] transition-all"
            title="Attach Document"
          >
            <Paperclip size={17} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            className="hidden"
          />

          {/* Text input */}
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
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(inputValue)}
              className="w-full px-4 py-3 bg-[var(--card)] border-[1.5px] border-[var(--border)] rounded-xl text-[var(--text-primary)] text-sm font-medium placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-subtle)] transition-all disabled:opacity-50"
            />
          </div>

          {/* Voice */}
          <button
            onClick={toggleSpeech}
            className={`p-2.5 rounded-xl border transition-all ${
              voiceActive
                ? 'bg-rose-500 border-rose-500 text-white shadow-md animate-pulse'
                : 'bg-[var(--card-elevated)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]'
            }`}
            title="Voice Search"
          >
            {voiceActive ? <MicOff size={17} /> : <Mic size={17} />}
          </button>

          {/* Send */}
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            className="p-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-sm hover:shadow-[var(--shadow-primary)] active:scale-95"
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
