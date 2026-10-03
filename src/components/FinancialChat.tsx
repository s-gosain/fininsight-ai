import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  X, 
  HelpCircle, 
  BookOpen, 
  RefreshCw,
  FileCheck,
  Building,
  ArrowRight
} from 'lucide-react';
import { ChatMessage, FinancialDataset } from '../types';

interface FinancialChatProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: FinancialDataset;
  initialQuery?: string | null;
}

export const FinancialChat: React.FC<FinancialChatProps> = ({
  isOpen,
  onClose,
  dataset,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `Hello! I am your AI Financial Statement Analyst. I have full context on **${dataset.companyName}** (${dataset.periods.join(', ')}). Ask me any question regarding revenue growth, margin compression, debt covenants, budget discrepancies, or specific line items.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'Why did operating margin compress in FY24?',
        'Assess our debt-to-equity and interest coverage',
        'Summarize the top red flags for the audit committee',
        'What is our Free Cash Flow trajectory and burn risk?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && initialQuery) {
      setInput(initialQuery);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          companyName: dataset.companyName,
          financialContext: {
            company: dataset.companyName,
            periods: dataset.periods,
            activePeriod: dataset.activePeriod,
            incomeStatement: dataset.incomeStatement.map((i) => ({ name: i.name, values: i.values })),
            balanceSheet: dataset.balanceSheet.map((i) => ({ name: i.name, values: i.values })),
            cashFlow: dataset.cashFlowStatement.map((i) => ({ name: i.name, values: i.values })),
            budgetVariances: dataset.budgetVariance,
          },
        }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Analysis complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations || ['Consolidated Financial Statements', 'Form 10-K Notes'],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: 'Unable to connect to the analysis engine. Please verify the server connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative z-10 w-full sm:w-[460px] max-w-full bg-[#09090b] border-l border-[#27272a] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-3 sm:p-4 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Financial AI Assistant
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] font-mono border border-[#10b981]/30">
                  Live
                </span>
              </h3>
              <p className="text-[11px] text-[#71717a] font-mono truncate max-w-[220px] sm:max-w-none">Context: {dataset.companyName} ({dataset.activePeriod})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 text-xs">
        {messages.map((msg) => {
          const isAI = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-medium border ${
                  isAI
                    ? 'bg-[#18181b] border-[#27272a] text-indigo-400'
                    : 'bg-indigo-600 border-indigo-500 text-white'
                }`}
              >
                {isAI ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>

              <div className={`space-y-1.5 max-w-[82%] ${isAI ? 'text-left' : 'text-right'}`}>
                <div
                  className={`p-3.5 rounded-xl leading-relaxed text-left ${
                    isAI
                      ? 'bg-[#18181b] border border-[#27272a] text-[#fafafa] shadow-sm'
                      : 'bg-indigo-600 text-white shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Citations if available */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-[#71717a] pl-1 font-mono">
                    <FileCheck className="w-3 h-3 text-indigo-400" />
                    <span>Citations: </span>
                    {msg.citations.map((c, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-[#18181b] text-[#a1a1aa] border border-[#27272a]">
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested followups */}
                {msg.suggestedFollowUps && (
                  <div className="pt-2 space-y-1">
                    <span className="text-[10px] font-semibold text-[#71717a] block mb-1 font-mono uppercase">Suggested inquiries:</span>
                    {msg.suggestedFollowUps.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="w-full text-left p-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[11px] text-[#fafafa] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="truncate">{prompt}</span>
                        <ArrowRight className="w-3 h-3 flex-shrink-0 ml-1 text-indigo-400" />
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-[#71717a] block px-1 font-mono">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-indigo-400">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-indigo-300 flex items-center gap-2">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Analyzing financial models & filings...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <div className="p-3 border-t border-[#27272a] bg-[#18181b]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="financial-chat-input"
            name="financialChatInput"
            type="text"
            placeholder="Ask about margins, debt, red flags, budget..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            aria-label="Ask AI about financial statements, margins, debt, and trends"
            className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      </div>
    </div>
  );
};
