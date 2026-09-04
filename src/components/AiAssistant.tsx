import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User as UserIcon, 
  RefreshCw, 
  Clock, 
  ShoppingBag,
  Flame,
  Zap
} from 'lucide-react';
import { QueueMetrics } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  queueMetrics: QueueMetrics | null;
  onNavigateToPreOrder: () => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  isOpen,
  onClose,
  queueMetrics,
  onNavigateToPreOrder,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! 👋 I am your **Canteen AI Assistant** powered by Gemini. \n\nI can tell you current queue wait times, suggest quick meals, or tell you when to place orders before the lunch rush! How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    'What should I order?',
    'How long is the current queue?',
    'When is the best time to order?',
    "What is today's popular food?",
    'Suggest a quick meal.',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      if (!res.ok) throw new Error('API failed');

      const data = await res.json();
      const botMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: data.reply || 'I am ready to help with recommendations or queue status!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: `Currently the queue has **${queueMetrics?.queue_length ?? 15} people** (~${queueMetrics?.estimated_wait_time ?? 14} min wait). I recommend ordering **Vada Pav** or **Masala Chai** for a speedy bite!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg h-[620px] max-h-[92vh] rounded-3xl shadow-2xl border border-violet-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-600 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base leading-tight">Canteen AI Assistant</h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 font-bold">
                  Gemini
                </span>
              </div>
              <p className="text-[11px] text-white/80">
                Queue: {queueMetrics?.queue_length ?? 15} waiting • Est. {queueMetrics?.estimated_wait_time ?? 14}m
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] whitespace-nowrap font-medium px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 transition-all cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isBot
                      ? 'bg-white border border-gray-200 text-gray-800 shadow-2xs'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xs font-medium'
                  }`}
                >
                  <div className="whitespace-pre-line">
                    {msg.text.split('**').map((part, i) => (
                      i % 2 === 1 ? <strong key={i} className={isBot ? "text-gray-950 font-bold" : "font-black underline"}>{part}</strong> : part
                    ))}
                  </div>
                  <span className={`block text-[9px] mt-1.5 text-right ${isBot ? 'text-gray-400' : 'text-white/70'}`}>
                    {msg.timestamp}
                  </span>
                </div>
                {!isBot && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-xs text-gray-400 italic">
              <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>Canteen AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI about menu, wait time, or quick snacks..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className={`p-2.5 rounded-xl text-white transition-all cursor-pointer ${
              !inputText.trim() || isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-700 shadow-xs'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
