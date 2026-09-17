import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useNavigation } from '../../context/NavigationContext';
import { queryRayluxAgent, getAIAgentConfig } from '../../services/aiAgent';
import { X, Send, Sparkles, Bot, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export const AIAgentWidget: React.FC = () => {
  const { orders } = useStore();
  const { currency, exchangeRate } = useCurrency();
  const { navigateTo } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [aiConfig] = useState(() => getAIAgentConfig());

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'agent',
      text: aiConfig.welcomeMessage || 'RAYLUX INTELLIGENCE ONLINE // Inquire about sizing specs, GORE-TEX care, order dispatch waybills, or USD/GBP currencies.',
      timestamp: 'Now',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!aiConfig.enabled) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputValue).trim();
    if (!textToSend || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputValue('');
    setIsTyping(true);

    try {
      const response = await queryRayluxAgent(textToSend, orders, currency, exchangeRate, aiConfig);
      const agentMsg: ChatMessage = {
        id: `msg-agent-${Date.now()}`,
        sender: 'agent',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'agent',
        text: 'RAYLUX INTELLIGENCE telemetry offline. Please try again or open an administrative support ticket.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    { label: 'Track Order', prompt: 'Where is my order?' },
    { label: 'Sizing Guide', prompt: 'What is the sizing difference between S/M and L/XL?' },
    { label: 'GORE-TEX Specs', prompt: 'What are the waterproof specs of the Apex Storm GORE-TEX?' },
    { label: 'USD / GBP Rates', prompt: 'How do USD and GBP currency conversions work?' },
  ];

  return (
    <>
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="ai-agent-trigger-pill"
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 bg-black text-white px-4 py-3 rounded-full shadow-2xl border border-neutral-800 hover:scale-105 active:scale-95 transition-all"
          aria-label="Open Raylux Intelligence Agent"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center">
              {/* Branded Raylux geometric lens / AI icon */}
              <Sparkles size={16} className="text-white animate-pulse" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black"></span>
          </div>

          <div className="text-left hidden sm:block">
            <span className="text-[11px] font-nike font-black uppercase tracking-wider block text-white leading-none">
              RAYLUX AGENT
            </span>
            <span className="text-[10px] font-sans font-semibold text-neutral-400 block tracking-wide leading-none mt-1">
              GEMINI 3.8 AI
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2.5rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden animate-fadeIn font-sans">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-black text-white flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center relative">
                <Bot size={18} className="text-white" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-nike text-lg font-black uppercase tracking-tight text-white leading-none">
                    RAYLUX INTELLIGENCE
                  </h3>
                  <span className="bg-neutral-800 text-neutral-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                    GEMINI 3.8
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-sans tracking-wide mt-1">
                  Online • Autonomous Customer Care & Telemetry
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              id="ai-agent-close-btn"
              className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
              aria-label="Close Agent"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Prompts Strip */}
          <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.prompt)}
                className="text-[11px] font-sans font-semibold bg-white border border-neutral-200 hover:border-black text-neutral-700 hover:text-black px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shadow-2xs"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-neutral-50/50">
            {messages.map((msg) => {
              const isAgent = msg.sender === 'agent';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-baseline gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {isAgent ? 'Raylux Agent' : 'You'}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-2xs ${
                      isAgent
                        ? 'bg-white text-neutral-800 border border-neutral-200 rounded-tl-sm'
                        : 'bg-black text-white rounded-tr-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 px-1">
                  Raylux Agent
                </span>
                <div className="bg-white border border-neutral-200 p-3 rounded-2xl rounded-tl-sm shadow-2xs flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Ticket Portal Quick Link Banner */}
          <div className="px-4 py-2 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between text-[11px]">
            <span className="text-neutral-600 font-medium">Need human escalation?</span>
            <button
              onClick={() => {
                setIsOpen(false);
                navigateTo('dashboard');
              }}
              className="text-black font-bold uppercase tracking-wider flex items-center gap-1 hover:underline"
            >
              <span>Open Support Ticket</span>
              <ArrowRight size={11} />
            </button>
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about orders, sizing, GORE-TEX..."
              className="flex-1 text-xs border border-neutral-300 rounded-full px-4 py-2.5 focus:outline-none focus:border-black bg-neutral-50 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
              aria-label="Send Message"
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
