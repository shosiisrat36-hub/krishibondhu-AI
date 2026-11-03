import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  Bot, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Lightbulb,
  Copy,
  Check
} from 'lucide-react';
import { Language, UserRole, ChatMessage } from '../types';
import { translations } from '../translations';

interface AiAssistantProps {
  language: Language;
  userRole: UserRole;
  hasAiApiKey: boolean;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  language,
  userRole,
  hasAiApiKey,
}) => {
  const t = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('krishi_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved chat:', e);
      }
    }
    // Initial welcome message
    const initialText = language === 'bn'
      ? (userRole === 'farmer'
          ? 'নমস্কার / আসসালামু আলাইকুম! আমি কৃষিবন্ধু এআই সহকারী। ধান, গম, ভুট্টা, আলু ও সবজি চাষ, সার প্রয়োগ, পোকামাকড় দমন বা আবহাওয়া ভিত্তিক যে কোনো প্রশ্ন করুন।'
          : 'স্বাগতম! আমি আপনার কৃষিবন্ধু বাগান সহকারী। টবের গাছ, বারান্দার সবজি, পানি দেওয়ার নিয়ম, সূর্যালোক বা জৈব সার সম্পর্কে যে কোনো প্রশ্ন করুন।')
      : (userRole === 'farmer'
          ? 'Welcome! I am KrishiBondhu AI agricultural companion. Ask me anything about commercial crops (Rice, Wheat, Maize, Potato), fertilizer schedules, or IPM pest control.'
          : 'Hello! I am your KrishiBondhu gardening companion. Ask me any question about houseplants, balcony vegetables, potting soil mixes, or watering routines.');

    return [
      {
        id: 'msg-init',
        role: 'model',
        text: initialText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemo: !hasAiApiKey,
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    try {
      localStorage.setItem('krishi_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat to localStorage:', e);
    }
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          language,
          userRole,
        }),
      });

      const data = await response.json();
      
      const aiReplyText = data.text || (data.fallbackText || 'Sorry, could not generate a response.');

      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemo: data.isDemo ?? !hasAiApiKey,
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Failed to fetch from chat API:', error);
      const errorMessage: ChatMessage = {
        id: `model-err-${Date.now()}`,
        role: 'model',
        text: language === 'bn' 
          ? 'সার্ভারে সংযোগ করতে সমস্যা হয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।' 
          : 'Could not connect to the backend server. Please verify your connection or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemo: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    localStorage.removeItem('krishi_chat_history');
    setMessages([
      {
        id: `msg-cleared-${Date.now()}`,
        role: 'model',
        text: language === 'bn' 
          ? 'চ্যাট হিস্ট্রি মুছে ফেলা হয়েছে। আপনার নতুন প্রশ্ন জিজ্ঞাসা করুন!' 
          : 'Chat history cleared. How can I assist your plants today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemo: !hasAiApiKey,
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Chips adapted for role and language
  const suggestedChips = userRole === 'farmer'
    ? [
        t.assistant.sampleQ4,
        language === 'bn' ? 'আলুর নাবি ধসা রোগ হলে কি করব?' : 'What is the prevention for Potato Late Blight?',
        language === 'bn' ? 'ভুট্টায় ফল আর্মিওয়ার্ম দমনের সেরা উপায় কি?' : 'How to manage Fall Armyworm in Maize organically?',
        language === 'bn' ? 'ধানের জমিতে এডব্লিউডি (AWD) সেচ কীভাবে কাজ করে?' : 'How does Alternate Wetting & Drying (AWD) work for rice?',
      ]
    : [
        t.assistant.sampleQ1,
        t.assistant.sampleQ2,
        t.assistant.sampleQ3,
        language === 'bn' ? 'কাঁচা মরিচ গাছের ফুল ঝরা বন্ধ করার উপায়?' : 'How to stop chili flower drop on balconies?',
      ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                {t.assistant.title}
              </h1>
              {hasAiApiKey ? (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{t.assistant.liveBadge}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <AlertCircle className="w-3 h-3 text-amber-700" />
                  <span>{t.assistant.demoBadge}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {t.assistant.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-500 hover:text-red-700 hover:bg-red-50 border border-stone-200 hover:border-red-200 transition-all self-start sm:self-center"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t.assistant.clearChat}</span>
        </button>
      </div>

      {/* Suggested Chips Bar */}
      <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-emerald-700" />
          <span>{t.assistant.suggestedQuestions}:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="text-left text-xs bg-white text-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-100/50 shadow-2xs transition-all cursor-pointer font-medium"
            >
              🌱 {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col h-[520px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-xs ${
                    isUser
                      ? 'bg-stone-800'
                      : 'bg-gradient-to-tr from-emerald-600 to-green-600'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative group max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-700 text-white rounded-tr-none'
                      : 'bg-stone-50 border border-stone-200/80 text-stone-800 rounded-tl-none shadow-2xs'
                  }`}
                >
                  {/* Status Demo / Live Tag for model */}
                  {!isUser && msg.isDemo && (
                    <div className="mb-1.5 flex items-center space-x-1 text-[10px] font-semibold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md w-fit">
                      <AlertCircle className="w-2.5 h-2.5" />
                      <span>{language === 'bn' ? 'নমুনা উত্তর (ডেমো মোড)' : 'Sample Demo Answer'}</span>
                    </div>
                  )}

                  {/* Render content cleanly with line breaks and formatting */}
                  <div className="whitespace-pre-line font-normal space-y-1">
                    {msg.text}
                  </div>

                  {/* Bubble Footer: Timestamp & Copy Button */}
                  <div className={`mt-2 flex items-center justify-between text-[10px] ${isUser ? 'text-emerald-200' : 'text-stone-400'}`}>
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 rounded hover:bg-stone-200/40 text-stone-500 hover:text-stone-800"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-stone-50 border border-stone-200 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-stone-600 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                </div>
                <span>{t.assistant.thinking}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-stone-50/70 border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.assistant.placeholder}
              className="flex-1 bg-white border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all shadow-2xs"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white rounded-xl font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-700/20 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t.assistant.send}</span>
            </button>
          </form>

          {/* Safety Disclaimer */}
          <div className="mt-2 text-center text-[11px] text-stone-500 flex items-center justify-center space-x-1">
            <HelpCircle className="w-3 h-3 text-stone-400 shrink-0" />
            <span>{t.assistant.safetyNotice}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
