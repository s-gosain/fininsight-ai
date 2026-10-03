import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  MessageSquarePlus, 
  AlertTriangle, 
  Search, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { FinancialDataset, StatementLineItem, CurrencyCode } from '../types';
import { formatCurrency, formatPercent } from '../data/currenciesAndFiscal';
import { maskSensitiveValue } from '../utils/encryption';
import { motion, AnimatePresence } from 'motion/react';

interface StatementsTableProps {
  dataset: FinancialDataset;
  currency: CurrencyCode;
  isDataMasked: boolean;
  onAddCommentToLine: (lineItem: StatementLineItem) => void;
  commentsCountByLine: Record<string, number>;
}

export const StatementsTable: React.FC<StatementsTableProps> = ({
  dataset,
  currency,
  isDataMasked,
  onAddCommentToLine,
  commentsCountByLine,
}) => {
  const [activeTab, setActiveTab] = useState<'IS' | 'BS' | 'CF'>('IS');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredRow, setHoveredRow] = useState<{
    item: StatementLineItem;
    x: number;
    y: number;
  } | null>(null);

  const currentItems = 
    activeTab === 'IS' 
      ? dataset.incomeStatement 
      : activeTab === 'BS' 
        ? dataset.balanceSheet 
        : dataset.cashFlowStatement;

  const filteredItems = currentItems.filter((item) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const periods = dataset.periods;
  const activePeriod = dataset.activePeriod;
  const prevPeriod = periods[periods.indexOf(activePeriod) - 1] || periods[0];

  const hoveredItem = hoveredRow?.item;
  const hoveredCurrentVal = hoveredItem ? (hoveredItem.values[activePeriod] ?? 0) : 0;
  const hoveredPrevVal = hoveredItem ? (hoveredItem.values[prevPeriod] ?? hoveredCurrentVal) : 0;
  const hoveredVariancePct = hoveredPrevVal !== 0 ? ((hoveredCurrentVal - hoveredPrevVal) / Math.abs(hoveredPrevVal)) * 100 : 0;
  const hoveredDiff = hoveredCurrentVal - hoveredPrevVal;

  const tooltipWidth = 280;
  const tooltipHeight = 150;
  const posX = hoveredRow ? Math.min(typeof window !== 'undefined' ? window.innerWidth - tooltipWidth - 16 : 300, Math.max(16, hoveredRow.x + 16)) : 0;
  const posY = hoveredRow ? (
    typeof window !== 'undefined' && hoveredRow.y + tooltipHeight + 24 > window.innerHeight
      ? Math.max(16, hoveredRow.y - tooltipHeight - 12)
      : hoveredRow.y + 16
  ) : 0;

  return (
    <div className="space-y-4">
      
      {/* Table Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18181b] border border-[#27272a] p-3 rounded-xl">
        
        {/* Statement Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded-lg border border-[#27272a]">
          <button
            id="tab-income-statement"
            onClick={() => setActiveTab('IS')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'IS'
                ? 'bg-[#27272a] text-[#fafafa] border border-[#3f3f46] shadow-sm'
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]/50'
            }`}
          >
            Income Statement
          </button>
          <button
            id="tab-balance-sheet"
            onClick={() => setActiveTab('BS')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'BS'
                ? 'bg-[#27272a] text-[#fafafa] border border-[#3f3f46] shadow-sm'
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]/50'
            }`}
          >
            Balance Sheet
          </button>
          <button
            id="tab-cash-flow"
            onClick={() => setActiveTab('CF')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'CF'
                ? 'bg-[#27272a] text-[#fafafa] border border-[#3f3f46] shadow-sm'
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]/50'
            }`}
          >
            Cash Flow Statement
          </button>
        </div>

        {/* Search & Counter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              id="statement-table-filter-input"
              name="statementTableFilter"
              type="text"
              placeholder="Filter line items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter line items"
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>
          <span className="text-xs text-[#71717a] font-mono hidden md:inline">
            {filteredItems.length} lines
          </span>
        </div>

      </div>

      {/* Interactive Table Container */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden shadow-sm table-responsive-wrapper dashboard-visual-container">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-[#09090b] text-[#71717a] font-semibold border-b border-[#27272a] font-mono text-[11px] uppercase">
                <th className="py-3.5 px-4 w-72">Line Item & Classification</th>
                {periods.map((p) => (
                  <th key={p} className="py-3.5 px-4 text-right whitespace-nowrap">
                    {p} {p === activePeriod && <span className="text-[10px] text-[#10b981] font-bold ml-1 font-mono">(Active)</span>}
                  </th>
                ))}
                <th className="py-3.5 px-4 text-right whitespace-nowrap">YoY Variance (%)</th>
                <th className="py-3.5 px-4 min-w-[200px]">Auditor Observations & Notes</th>
                <th className="py-3.5 px-4 text-center w-24">Annotate</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody 
              onMouseLeave={() => setHoveredRow(null)}
              className="divide-y divide-[#27272a] text-[#a1a1aa]"
            >
              {filteredItems.map((item) => {
                const currentVal = item.values[activePeriod] ?? 0;
                const prevVal = item.values[prevPeriod] ?? currentVal;
                const variancePct = prevVal !== 0 ? ((currentVal - prevVal) / Math.abs(prevVal)) * 100 : 0;
                const commentCount = commentsCountByLine[item.key] || 0;

                return (
                  <tr 
                    key={item.id} 
                    id={`statement-row-${item.id}`}
                    onMouseEnter={(e) => {
                      setHoveredRow({
                        item,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseMove={(e) => {
                      setHoveredRow({
                        item,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={`hover:bg-[#27272a]/40 transition-colors cursor-pointer ${
                      item.isRedFlag ? 'bg-red-500/5' : ''
                    }`}
                  >
                    
                    {/* Line Item Name & Badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {item.isRedFlag && (
                          <span title="Red Flag Alert">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                          </span>
                        )}
                        <div>
                          <div className="font-medium text-white">{item.name}</div>
                          <span className="text-[10px] text-[#71717a]">{item.category}</span>
                        </div>
                      </div>
                    </td>

                    {/* Periods Values */}
                    {periods.map((p) => {
                      const val = item.values[p] ?? 0;
                      const isNegative = val < 0;
                      return (
                        <td key={p} className="py-3 px-4 text-right font-mono font-medium">
                          {isDataMasked ? (
                            <span className="text-[#71717a]">••••••••</span>
                          ) : (
                            <span className={isNegative ? 'text-red-400' : 'text-[#fafafa]'}>
                              {formatCurrency(val, currency)}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* YoY Change */}
                    <td className="py-3 px-4 text-right font-mono font-medium">
                      {periods.length > 1 ? (
                        <span className={`inline-flex items-center gap-0.5 ${
                          variancePct > 0 
                            ? item.key.includes('cogs') || item.key.includes('Expense') || item.key.includes('Debt') 
                              ? 'text-red-400' 
                              : 'text-[#10b981]'
                            : variancePct < 0 
                              ? item.key.includes('cogs') || item.key.includes('Expense') 
                                ? 'text-[#10b981]' 
                                : 'text-red-400'
                              : 'text-[#71717a]'
                        }`}>
                          {variancePct > 0 ? <ArrowUpRight className="w-3 h-3" /> : variancePct < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                          {formatPercent(variancePct, true)}
                        </span>
                      ) : (
                        <span className="text-[#71717a]">-</span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-4 text-xs text-[#a1a1aa]">
                      {item.notes ? (
                        <span className={item.isRedFlag ? 'text-red-300 font-medium' : 'text-[#a1a1aa]'}>
                          {item.notes}
                        </span>
                      ) : (
                        <span className="text-[#71717a] italic">No notes recorded</span>
                      )}
                    </td>

                    {/* Inline Comment Action */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onAddCommentToLine(item)}
                        title="Add or view team comment on this line item"
                        className={`p-1.5 rounded-md border text-xs inline-flex items-center gap-1 transition-all cursor-pointer ${
                          commentCount > 0
                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-mono font-medium'
                            : 'bg-[#09090b] text-[#71717a] border-[#27272a] hover:text-[#fafafa] hover:bg-[#27272a]'
                        }`}
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                        {commentCount > 0 && <span>{commentCount}</span>}
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

      {/* Floating Hover-Preview Tooltip displaying YoY Growth Percentage */}
      <AnimatePresence>
        {hoveredRow && hoveredItem && (
          <motion.div
            id="statement-row-hover-tooltip"
            initial={{ opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 2 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: `${posY}px`,
              left: `${posX}px`,
            }}
            className="pointer-events-none z-50 w-72 rounded-xl bg-[#18181b]/95 backdrop-blur-xl border border-[#3f3f46] p-3 shadow-2xl text-left"
          >
            {/* Header: Line Item & Category */}
            <div className="flex items-start justify-between gap-2 border-b border-[#27272a] pb-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">
                  {hoveredItem.name}
                </div>
                <div className="text-[10px] text-[#71717a] font-mono truncate">
                  {hoveredItem.category}
                </div>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider shrink-0 font-medium">
                YoY Growth
              </span>
            </div>

            {/* YoY Growth Percentage Highlight */}
            <div className="flex items-center justify-between py-1.5 bg-[#09090b]/60 px-2 rounded-lg border border-[#27272a]/60 mb-2">
              <span className="text-[11px] text-[#a1a1aa] font-medium">
                Growth Rate ({prevPeriod} to {activePeriod})
              </span>
              <span
                className={`inline-flex items-center gap-0.5 font-mono font-bold text-xs px-1.5 py-0.5 rounded ${
                  hoveredVariancePct > 0
                    ? hoveredItem.key.includes('cogs') || hoveredItem.key.includes('Expense') || hoveredItem.key.includes('Debt')
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : hoveredVariancePct < 0
                    ? hoveredItem.key.includes('cogs') || hoveredItem.key.includes('Expense')
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}
              >
                {hoveredVariancePct > 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                ) : hoveredVariancePct < 0 ? (
                  <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                ) : null}
                {formatPercent(hoveredVariancePct, true)}
              </span>
            </div>

            {/* Baseline vs Active Comparison */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-[#a1a1aa]">
              <div>
                <span className="text-[#71717a] block">{prevPeriod} Baseline</span>
                <span className="text-[#fafafa] font-medium">
                  {isDataMasked ? '••••••••' : formatCurrency(hoveredPrevVal, currency)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#71717a] block">{activePeriod} Active</span>
                <span className="text-[#fafafa] font-medium">
                  {isDataMasked ? '••••••••' : formatCurrency(hoveredCurrentVal, currency)}
                </span>
              </div>
            </div>

            {/* Net Delta */}
            <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 mt-1.5 border-t border-[#27272a]/60 text-[#71717a]">
              <span>Net Variance</span>
              <span className={`font-medium ${hoveredDiff > 0 ? 'text-emerald-400' : hoveredDiff < 0 ? 'text-red-400' : 'text-[#a1a1aa]'}`}>
                {isDataMasked
                  ? '••••••••'
                  : `${hoveredDiff > 0 ? '+' : ''}${formatCurrency(hoveredDiff, currency)}`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
