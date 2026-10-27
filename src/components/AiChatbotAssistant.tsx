import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Sparkles,
  Phone,
  ArrowRight,
  Minimize2,
  Maximize2,
  Loader2,
  Bot,
  Copy,
  Check,
  RefreshCw,
  PlusCircle,
  Trash2,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { BIZORA_PHONE, getWhatsAppUrl } from '../data/servicesData.ts';
import { submitEnquiryWithFallback } from '../lib/enquiryClient.ts';

interface AiChatbotAssistantProps {
  onOpenConsultation: (serviceId?: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: 'consultation' | 'whatsapp' | 'call' | null;
  serviceId?: string;
  isStreaming?: boolean;
}

const DEFAULT_CHIPS = [
  '🌐 How does BIZORA build business websites?',
  '📱 How does the WhatsApp digital catalogue work?',
  '📅 Can I automate appointment bookings for my clinic/firm?',
  '💰 How is project pricing and scope decided?',
  '⏱️ How long does development take?',
  '📞 How do I talk directly with founder Shashank?',
];

export const AiChatbotAssistant: React.FC<AiChatbotAssistantProps> = ({ onOpenConsultation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [dynamicChips, setDynamicChips] = useState<string[]>(DEFAULT_CHIPS);

  // In-Chat Lead Capture Form State
  const [showInChatLeadForm, setShowInChatLeadForm] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadBusiness, setLeadBusiness] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadCity, setLeadCity] = useState('');
  const [leadConsent, setLeadConsent] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState<{ refId: string; whatsappUrl: string } | null>(null);
  const [leadError, setLeadError] = useState<string | null>(null);

  // Session & Conversation ID
  const [sessionId, setSessionId] = useState<string>(() => {
    const existing = localStorage.getItem('bizora_chat_session_id');
    if (existing) return existing;
    const newId = `sess_${crypto.randomUUID()}`;
    localStorage.setItem('bizora_chat_session_id', newId);
    return newId;
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **BIZORA AI Assistant**, an intelligent digital business advisor.

I can help you explore solutions for your business:
• **High-speed Business Websites** (7–14 days delivery)
• **Interactive Digital Catalogues** with 1-click WhatsApp orders
• **Smart Booking Systems** for clinics, consultants, and firms
• **WhatsApp Business Automation** & lead pipelines

Tell me about your business or pick a topic below to get started!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Restore session from server on initial mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch(`/api/chat/session/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(data.messages);
            if (data.context?.businessType) {
              setLeadBusiness(data.context.businessType);
            }
          }
        }
      } catch (err) {
        console.warn('[ChatUI] Session restore notice:', err);
      }
    };
    restoreSession();
  }, [sessionId]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized, messages]);

  // Handle SSE streaming chat message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isSubmitting) return;

    // Abort previous stream if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const userMsgId = crypto.randomUUID();
    const assistantMsgId = crypto.randomUUID();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: currentTime,
    };

    // Placeholder assistant message for streaming
    const assistantPlaceholder: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: currentTime,
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setInputValue('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
        }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed, fallback to standard response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let streamSuggestedAction: 'consultation' | 'whatsapp' | 'call' | null = null;
      let streamServiceId: string | undefined = undefined;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawJson = line.substring(6).trim();
            if (!rawJson) continue;

            try {
              const parsed = JSON.parse(rawJson);

              if (parsed.token) {
                accumulatedText += parsed.token;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: accumulatedText, isStreaming: true }
                      : m
                  )
                );
              }

              if (parsed.done) {
                accumulatedText = parsed.reply || accumulatedText;
                streamSuggestedAction = parsed.suggestedAction || null;
                streamServiceId = parsed.serviceId || undefined;

                if (Array.isArray(parsed.suggestedChips) && parsed.suggestedChips.length > 0) {
                  setDynamicChips(parsed.suggestedChips);
                }
              }
            } catch (e) {
              // Ignore partial JSON chunks
            }
          }
        }
      }

      // Finalize assistant message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: accumulatedText || 'Thank you for your question. How else can I assist your business?',
                isStreaming: false,
                suggestedAction: streamSuggestedAction,
                serviceId: streamServiceId,
              }
            : m
        )
      );
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      console.warn('[ChatUI] Streaming error, attempting fallback POST:', err.message);

      // Fallback to standard synchronous endpoint
      try {
        const syncRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, sessionId }),
        });

        const data = await syncRes.json();
        if (data.success && data.reply) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: data.reply,
                    isStreaming: false,
                    suggestedAction: data.suggestedAction,
                    serviceId: data.serviceId,
                  }
                : m
            )
          );
          if (Array.isArray(data.suggestedChips)) {
            setDynamicChips(data.suggestedChips);
          }
          return;
        }
      } catch (syncErr) {
        // Double fallback message
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: `I'm having a brief connection issue. You can chat directly with founder **Shashank** on WhatsApp at **${BIZORA_PHONE}**!`,
                isStreaming: false,
                suggestedAction: 'whatsapp',
              }
            : m
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start New Chat (Creates new session ID)
  const handleNewChat = () => {
    const newSessionId = `sess_${crypto.randomUUID()}`;
    localStorage.setItem('bizora_chat_session_id', newSessionId);
    setSessionId(newSessionId);
    setDynamicChips(DEFAULT_CHIPS);
    setShowInChatLeadForm(false);
    setLeadSuccess(null);

    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `New conversation started! Tell me about your business or pick a question below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Clear Session History (Privacy Control)
  const handleClearHistory = async () => {
    try {
      await fetch(`/api/chat/session/${sessionId}`, { method: 'DELETE' });
    } catch (e) {
      // Ignore
    }
    handleNewChat();
  };

  // Retry latest user message
  const handleRetryLast = () => {
    const lastUserTurn = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserTurn) {
      handleSendMessage(lastUserTurn.content);
    }
  };

  // Copy message text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Submit in-chat lead form
  const handleInChatLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError(null);

    if (!leadName.trim() || leadName.trim().length < 2) {
      setLeadError('Please enter your name.');
      return;
    }
    const digits = leadPhone.replace(/\D/g, '');
    if (!digits || digits.length < 10) {
      setLeadError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!leadConsent) {
      setLeadError('Please check the consent box so BIZORA may contact you.');
      return;
    }

    setLeadSubmitting(true);
    setLeadError(null);

    try {
      const result = await submitEnquiryWithFallback(
        {
          customer_name: leadName.trim(),
          business_name: leadBusiness.trim() || `${leadName.trim()}'s Business`,
          business_type: leadBusiness.trim() || 'General Commercial',
          phone: leadPhone.trim(),
          city: leadCity.trim() || 'India',
          requested_service: 'website_dev',
          project_description: 'Inquiry collected via BIZORA AI Assistant in-chat lead form.',
          consent: leadConsent,
          sessionId,
        },
        { endpoint: '/api/chat/lead' }
      );

      if (!result.success) {
        throw new Error(result.error || result.message || 'Failed to submit requirements.');
      }

      setLeadSuccess({
        refId: result.referenceId,
        whatsappUrl: result.directWhatsAppUrl,
      });

      // Add assistant confirmation message in chat
      const confirmMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `🎉 **Lead Submitted & Saved to Database!**\n\n• **Ref ID:** \`${result.referenceId}\`\n• **Client:** ${leadName.trim()}\n• **Phone:** ${leadPhone.trim()}\n\nOur founder **Shashank** has received your request. You can also click below to confirm immediately on WhatsApp!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: 'whatsapp',
      };
      setMessages((prev) => [...prev, confirmMsg]);
    } catch (err: any) {
      setLeadError(err.message || 'Unable to submit right now. Please message founder on WhatsApp.');
    } finally {
      setLeadSubmitting(false);
    }
  };

  // Simple clean markdown parser for message text
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, lIdx) => {
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const cleanLine = isBullet ? line.trim().replace(/^[•\-]\s*/, '') : line;

      // Parse bold **text**
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={pIdx} className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded text-xs">
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={lIdx} className="ml-4 list-disc text-slate-700 my-0.5 leading-relaxed">
            {renderedParts}
          </li>
        );
      }

      if (!line.trim()) {
        return <div key={lIdx} className="h-2" />;
      }

      return (
        <p key={lIdx} className="leading-relaxed text-slate-700 my-1">
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 animate-fade-in">
          {/* Unboxed Helper Tooltip */}
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-slate-900/90 text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-700 shadow-xl cursor-pointer hover:bg-slate-900 transition-all backdrop-blur-md"
          >
            {/* Google Assistant 4-Color Wave Indicator */}
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse delay-75" />
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse delay-150" />
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse delay-200" />
            </div>
            <span>Chat with BIZORA AI</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="group relative w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400"
            aria-label="Open BIZORA AI Assistant Chat"
          >
            <div className="absolute inset-0 rounded-full bg-blue-500/40 blur-md group-hover:blur-lg transition-all" />

            <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center border border-white/20">
              <img
                src="/images/ai_agent_avatar.jpg"
                alt="BIZORA AI Assistant Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <Bot className="w-6 h-6 text-white absolute" />
              <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-xs" />
            </div>
          </button>
        </div>
      )}

      {/* ChatGPT-Grade Interactive Chat Drawer / Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-out shadow-2xl border border-slate-700/60 rounded-2xl bg-white overflow-hidden flex flex-col ${
            isMinimized
              ? 'bottom-6 right-6 w-80 h-16'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[440px] h-[640px] max-h-[92vh]'
          }`}
        >
          {/* Header Bar */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800 select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-400/40 shadow-xs bg-slate-900 shrink-0">
                <img
                  src="/images/ai_agent_avatar.jpg"
                  alt="AI Assistant"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <Bot className="w-4 h-4 text-cyan-300 absolute inset-0 m-auto" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">BIZORA AI Assistant</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30">
                    Live Memory
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Streaming Active • Context Aware</span>
                </div>
              </div>
            </div>

            {/* Header Control Buttons (New Chat, Clear, Minimize, Close) */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={handleNewChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Start new conversation"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Clear chat history (Privacy)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!isMinimized && (
            <>
              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 text-xs sm:text-sm">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-start gap-2 max-w-[88%]">
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-900 border border-slate-300 shrink-0 mt-0.5 relative">
                          <img
                            src="/images/ai_agent_avatar.jpg"
                            alt="AI"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <Bot className="w-3.5 h-3.5 text-cyan-400 absolute inset-0 m-auto" />
                        </div>
                      )}

                      <div
                        className={`group relative rounded-2xl px-4 py-3 shadow-xs ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div className="space-y-1">
                            {renderFormattedText(msg.content)}
                            {msg.isStreaming && (
                              <span className="inline-block w-1.5 h-3.5 ml-1 bg-blue-600 animate-pulse align-middle" />
                            )}
                          </div>
                        )}

                        {/* Interactive Action CTAs attached to assistant messages */}
                        {msg.role === 'assistant' && !msg.isStreaming && msg.suggestedAction && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-2">
                            {msg.suggestedAction === 'consultation' && (
                              <button
                                onClick={() => setShowInChatLeadForm(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                              >
                                <span>Get Written Quotation</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}

                            <a
                              href={getWhatsAppUrl(`Hello Shashank, I was chatting with the BIZORA AI Assistant about digital solutions for my business.`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs transition-colors"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              <span>WhatsApp Founder</span>
                            </a>

                            <a
                              href="tel:+918147827430"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors"
                            >
                              <Phone className="w-3 h-3 text-slate-600" />
                              <span>Call {BIZORA_PHONE}</span>
                            </a>
                          </div>
                        )}

                        {/* Message Timestamp & Copy Control */}
                        <div className="flex items-center justify-between gap-2 mt-1.5 pt-0.5 text-[10px]">
                          <span className={msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}>
                            {msg.timestamp}
                          </span>

                          {msg.role === 'assistant' && !msg.isStreaming && (
                            <button
                              onClick={() => handleCopy(msg.id, msg.content)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 transition-opacity p-0.5 rounded cursor-pointer"
                              title="Copy response"
                            >
                              {copiedMsgId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Inline In-Chat Lead Form Modal */}
                {showInChatLeadForm && !leadSuccess && (
                  <div className="bg-white border-2 border-blue-500/50 rounded-2xl p-4 shadow-md space-y-3 animate-fade-in my-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>Fast Quotation Form</span>
                      </div>
                      <button
                        onClick={() => setShowInChatLeadForm(false)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600">
                      Enter your details to receive a personalized written proposal from founder Shashank:
                    </p>

                    {leadError && (
                      <div className="p-2 bg-red-50 text-red-700 text-[11px] rounded border border-red-200">
                        {leadError}
                      </div>
                    )}

                    <form onSubmit={handleInChatLeadSubmit} className="space-y-2 text-xs">
                      <input
                        type="text"
                        placeholder="Your Name *"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Business / Shop Name *"
                        value={leadBusiness}
                        onChange={(e) => setLeadBusiness(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="tel"
                          placeholder="Phone / WhatsApp *"
                          value={leadPhone}
                          onChange={(e) => setLeadPhone(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                        />
                        <input
                          type="text"
                          placeholder="City (e.g. Bengaluru) *"
                          value={leadCity}
                          onChange={(e) => setLeadCity(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <label className="flex items-start gap-1.5 text-[11px] text-slate-600 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={leadConsent}
                          onChange={(e) => setLeadConsent(e.target.checked)}
                          className="mt-0.5 rounded text-blue-600"
                        />
                        <span>I consent to BIZORA contacting me on WhatsApp/Phone regarding this quotation.</span>
                      </label>

                      <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowInChatLeadForm(false)}
                          className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={leadSubmitting}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                        >
                          {leadSubmitting ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit Quotation Request</span>
                              <ArrowRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Submitting typing indicator */}
                {isSubmitting && messages[messages.length - 1]?.content === '' && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs bg-white border border-slate-200 px-3 py-2 rounded-2xl w-fit shadow-xs">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce [animation-delay:0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce [animation-delay:0.45s]" />
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium">BIZORA AI is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Dynamic Follow-Up Prompt Chips */}
              {!isSubmitting && dynamicChips.length > 0 && (
                <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200/80 overflow-x-auto flex gap-1.5 scrollbar-none">
                  {dynamicChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip.replace(/^[^\w]+/, ''))}
                      className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] text-slate-700 font-medium transition-colors text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask BIZORA AI a business question..."
                  disabled={isSubmitting}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
                />

                {isSubmitting ? (
                  <button
                    type="button"
                    onClick={() => abortControllerRef.current?.abort()}
                    className="p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
                    title="Stop generation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Micro Status Bar */}
              <div className="px-3 py-1 bg-slate-900 text-slate-400 text-[10px] flex items-center justify-between border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Real-Time SSE Streaming</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRetryLast}
                    className="hover:text-white transition-colors cursor-pointer"
                    title="Retry last query"
                  >
                    Retry
                  </button>
                  <span>·</span>
                  <span className="font-mono text-cyan-300">Shashank: +91 8147827430</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
