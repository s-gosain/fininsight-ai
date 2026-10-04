import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  X, 
  RefreshCw,
  FileCheck,
  ArrowRight,
  Copy,
  Check,
  Trash2,
  TrendingUp,
  AlertTriangle,
  Scale,
  DollarSign,
  Maximize2
} from 'lucide-react';
import { ChatMessage, FinancialDataset } from '../types';

interface FinancialChatProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: FinancialDataset;
  initialQuery?: string | null;
}

// Lightweight, clean Markdown renderer tailored for financial analysis
function FormattedMessage({ text }: { text: string }) {
  const blocks = useMemo(() => {
    const rawLines = text.split('\n');
    const result: React.ReactNode[] = [];
    let tableLines: string[] = [];
    let inTable = false;
    let listItems: string[] = [];
    let inList = false;

    const flushTable = (keyPrefix: number) => {
      if (tableLines.length === 0) return;
      const rows = tableLines.map((l) =>
        l
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim())
      );
      if (rows.length > 0) {
        const headerRow = rows[0];
        const dataRows = rows.slice(rows.length > 1 && rows[1].every((c) => /^:?-+:?$/.test(c)) ? 2 : 1);
        result.push(
          <div key={`table-${keyPrefix}`} className="my-2.5 overflow-x-auto rounded-lg border border-[#27272a] bg-[#09090b]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#27272a] bg-[#18181b]/80">
                  {headerRow.map((cell, idx) => (
                    <th key={idx} className="p-2 font-mono font-semibold text-indigo-300">
                      {formatInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]/60">
                {dataRows.map((r, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/[0.02]">
                    {r.map((c, cIdx) => (
                      <td key={cIdx} className="p-2 font-mono text-[#d4d4d8]">
                        {formatInline(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableLines = [];
      inTable = false;
    };

    const flushList = (keyPrefix: number) => {
      if (listItems.length === 0) return;
      result.push(
        <ul key={`list-${keyPrefix}`} className="my-1.5 space-y-1 pl-4 list-disc marker:text-indigo-400">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-[#fafafa] leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    };

    const formatInline = (str: string): React.ReactNode => {
      // Split bold **text**
      const parts = str.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
      return parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={pIdx} className="px-1.5 py-0.5 rounded bg-[#27272a] text-indigo-300 font-mono text-[11px]">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <em key={pIdx} className="italic text-[#d4d4d8]">
              {part.slice(1, -1)}
            </em>
          );
        }
        return part;
      });
    };

    rawLines.forEach((line, lineIdx) => {
      const trimmed = line.trim();

      // Table line
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (inList) flushList(lineIdx);
        inTable = true;
        tableLines.push(trimmed);
        return;
      } else if (inTable) {
        flushTable(lineIdx);
      }

      // Bullet list item
      if (/^[-*•]\s+/.test(trimmed)) {
        if (inTable) flushTable(lineIdx);
        inList = true;
        listItems.push(trimmed.replace(/^[-*•]\s+/, ''));
        return;
      } else if (/^\d+\.\s+/.test(trimmed)) {
        if (inTable) flushTable(lineIdx);
        inList = true;
        listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
        return;
      } else if (inList) {
        flushList(lineIdx);
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        result.push(
          <h4 key={`h4-${lineIdx}`} className="text-xs font-bold text-white mt-2.5 mb-1 tracking-wide uppercase font-mono text-indigo-300">
            {formatInline(trimmed.slice(4))}
          </h4>
        );
        return;
      }
      if (trimmed.startsWith('## ')) {
        result.push(
          <h3 key={`h3-${lineIdx}`} className="text-sm font-bold text-white mt-3 mb-1.5 tracking-tight">
            {formatInline(trimmed.slice(3))}
          </h3>
        );
        return;
      }

      // Horizontal rule
      if (trimmed === '---' || trimmed === '***') {
        result.push(<hr key={`hr-${lineIdx}`} className="my-2 border-[#27272a]" />);
        return;
      }

      // Empty line
      if (!trimmed) {
        result.push(<div key={`empty-${lineIdx}`} className="h-1.5" />);
        return;
      }

      // Standard paragraph
      result.push(
        <p key={`p-${lineIdx}`} className="leading-relaxed text-[#fafafa] my-1">
          {formatInline(trimmed)}
        </p>
      );
    });

    if (inTable) flushTable(rawLines.length);
    if (inList) flushList(rawLines.length);

    return result;
  }, [text]);

  return <div className="space-y-0.5 text-xs">{blocks}</div>;
}

export const FinancialChat: React.FC<FinancialChatProps> = ({
  isOpen,
  onClose,
  dataset,
  initialQuery,
}) => {
  const getInitialMessage = useCallback((): ChatMessage => {
    return {
      id: `msg-init-${dataset.companyName}`,
      role: 'assistant',
      content: `Hello! I am your AI Financial Statement Analyst with complete context on **${dataset.companyName}** (${dataset.periods.join(', ')}). \n\nI can compute profitability margins, deconstruct DuPont ROE drivers, analyze debt coverage covenants, audit budget variances, or assess solvency risks based on live financial statements.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'Analyze FY24 Revenue and Gross Profit Margin',
        'Assess Debt-to-Equity and interest coverage ratios',
        'Summarize top red flags for the Audit Committee',
        'What is our Free Cash Flow trajectory and cash burn?',
      ],
    };
  }, [dataset.companyName, dataset.periods]);

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage()]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Handle incoming initial query (auto send if new)
  useEffect(() => {
    if (isOpen && initialQuery) {
      handleSendMessage(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

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
            industry: dataset.industry,
            reportingCurrency: dataset.reportingCurrency,
            periods: dataset.periods,
            activePeriod: dataset.activePeriod,
            incomeStatement: dataset.incomeStatement?.map((i) => ({ name: i.name, values: i.values })) || [],
            balanceSheet: dataset.balanceSheet?.map((i) => ({ name: i.name, values: i.values })) || [],
            cashFlow: dataset.cashFlowStatement?.map((i) => ({ name: i.name, values: i.values })) || [],
            budgetVariances: dataset.budgetVariance || [],
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Financial analysis calculation complete.',
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
          content: 'Unable to reach the financial analysis engine. Please verify the backend service connection and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleResetChat = () => {
    setMessages([getInitialMessage()]);
    setInput('');
  };

  const quickTopicChips = [
    { label: 'Operating Margin', icon: TrendingUp, query: 'Analyze FY24 Operating Margin and profitability drivers' },
    { label: 'Debt & Solvency', icon: Scale, query: 'Evaluate our debt-to-equity ratio and interest coverage safety' },
    { label: 'Red Flags & Risks', icon: AlertTriangle, query: 'What are the top forensic red flags and risk factors in this dataset?' },
    { label: 'Cash Flow vs Income', icon: DollarSign, query: 'Compare Operating Cash Flow against Net Income for quality of earnings' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative z-10 w-full sm:w-[500px] max-w-full bg-[#09090b] border-l border-[#27272a] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">
                  Financial AI Assistant
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active
                </span>
              </div>
              <p className="text-[11px] text-[#71717a] font-mono truncate max-w-[240px] sm:max-w-none">
                {dataset.companyName} • {dataset.activePeriod} • {dataset.reportingCurrency}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              title="Reset conversation"
              className="p-1.5 rounded-md text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close chat"
              className="p-1.5 rounded-md text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 text-xs">
          {messages.map((msg) => {
            const isAI = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-medium border ${
                    isAI
                      ? 'bg-[#18181b] border-[#27272a] text-indigo-400 shadow-xs'
                      : 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                  }`}
                >
                  {isAI ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                <div className={`space-y-1.5 max-w-[85%] ${isAI ? 'text-left' : 'text-right'}`}>
                  <div
                    className={`p-3.5 rounded-xl leading-relaxed text-left relative group ${
                      isAI
                        ? 'bg-[#18181b] border border-[#27272a] text-[#fafafa] shadow-md'
                        : 'bg-indigo-600 text-white shadow-md'
                    }`}
                  >
                    {isAI ? (
                      <FormattedMessage text={msg.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}

                    {/* Copy Button for Assistant responses */}
                    {isAI && (
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        title="Copy analysis"
                        className="absolute top-2 right-2 p-1 rounded bg-[#27272a]/60 hover:bg-[#27272a] text-[#71717a] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
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
                      <span className="text-[10px] font-semibold text-[#71717a] block mb-1 font-mono uppercase tracking-wider">
                        Recommended Deep-Dives:
                      </span>
                      {msg.suggestedFollowUps.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(prompt)}
                          className="w-full text-left p-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[11px] text-[#fafafa] flex items-center justify-between transition-colors cursor-pointer group"
                        >
                          <span className="truncate group-hover:text-indigo-300 transition-colors">{prompt}</span>
                          <ArrowRight className="w-3 h-3 shrink-0 ml-1 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
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
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-indigo-400">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-indigo-300 flex items-center gap-2 shadow-sm">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Computing econometric analysis via Gemini...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Topic Chips */}
        <div className="px-3.5 py-2 border-t border-[#27272a]/60 bg-[#121215] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {quickTopicChips.map((chip, idx) => {
            const Icon = chip.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.query)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-[#18181b] hover:bg-indigo-600/20 text-[#a1a1aa] hover:text-indigo-300 border border-[#27272a] hover:border-indigo-500/40 text-[11px] font-mono whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Icon className="w-3 h-3 text-indigo-400" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Composer */}
        <div className="p-3 sm:p-3.5 border-t border-[#27272a] bg-[#18181b] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              id="financial-chat-input"
              name="financialChatInput"
              rows={1}
              placeholder="Ask about margins, debt, red flags, budget..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              autoComplete="off"
              aria-label="Ask AI about financial statements, margins, debt, and trends"
              className="flex-1 max-h-24 px-3.5 py-2.5 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              title="Send question (Enter)"
              className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all cursor-pointer shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-[#71717a] font-mono mt-1.5 px-0.5">
            <span>Press <kbd className="px-1 py-0.5 rounded bg-[#27272a] text-[#a1a1aa]">Enter</kbd> to send</span>
            <span>Grounded in active statement data</span>
          </div>
        </div>

      </div>
    </div>
  );
};
