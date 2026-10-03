import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  DownloadCloud, 
  X, 
  Sparkles, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Hash, 
  AlertCircle,
  Database
} from 'lucide-react';
import { SEC_EDGAR_COMPANIES, SecEdgarFilingMetadata } from '../data/secEdgarData';
import { FinancialDataset } from '../types';

interface SecEdgarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestDataset: (dataset: FinancialDataset, filingMeta: SecEdgarFilingMetadata) => void;
  currentDatasetId?: string;
}

export const SecEdgarModal: React.FC<SecEdgarModalProps> = ({
  isOpen,
  onClose,
  onIngestDataset,
  currentDatasetId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiling, setSelectedFiling] = useState<SecEdgarFilingMetadata>(SEC_EDGAR_COMPANIES[0]);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestedSuccess, setIngestedSuccess] = useState<string | null>(null);

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SEC_EDGAR_COMPANIES;
    return SEC_EDGAR_COMPANIES.filter(
      (c) =>
        c.ticker.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.cik.includes(q) ||
        c.industry.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleIngest = (filing: SecEdgarFilingMetadata) => {
    setIsIngesting(true);
    setIngestedSuccess(null);

    setTimeout(() => {
      onIngestDataset(filing.dataset, filing);
      setIsIngesting(false);
      setIngestedSuccess(`Successfully ingested ${filing.companyName} (${filing.ticker}) Form 10-K into workspace.`);
      setTimeout(() => {
        onClose();
        setIngestedSuccess(null);
      }, 1200);
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-edgar-title"
    >
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-[#121214] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#27272a] bg-[#18181b]/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="modal-edgar-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                  SEC EDGAR Statutory 10-K Ingestion
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  LIVE EDGAR XBRL
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Official U.S. Securities and Exchange Commission Public Database (Form 10-K Annual Filings)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#a1a1aa] hover:text-white rounded-lg hover:bg-[#27272a] transition-colors cursor-pointer"
            aria-label="Close SEC EDGAR modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-[#27272a] bg-[#09090b]/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker (NVDA, MSFT, AAPL, AMZN, TSLA) or company name..."
              className="w-full bg-[#18181b] border border-[#27272a] focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-[#71717a] outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
            <span className="text-[10px] font-mono text-[#71717a] uppercase mr-1">Quick Select:</span>
            {SEC_EDGAR_COMPANIES.slice(0, 5).map((comp) => (
              <button
                key={comp.ticker}
                onClick={() => setSelectedFiling(comp)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
                  selectedFiling.ticker === comp.ticker
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-[#18181b] text-[#a1a1aa] border-[#27272a] hover:text-white hover:border-[#3f3f46]'
                }`}
              >
                ${comp.ticker}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Split View (List on left, Details on right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto divide-y md:divide-y-0 md:divide-x divide-[#27272a]">
          {/* Left Column: Filings List */}
          <div className="md:col-span-5 p-3 sm:p-4 space-y-2 overflow-y-auto max-h-[500px]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] px-1">
              Verified SEC 10-K Filings ({filteredCompanies.length})
            </div>
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-10 px-4 text-[#71717a]">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[#52525b]" />
                <p className="text-xs">No matching company found in active SEC index.</p>
                <p className="text-[11px] mt-1 text-[#a1a1aa]">Try searching NVDA, MSFT, AAPL, AMZN, or TSLA.</p>
              </div>
            ) : (
              filteredCompanies.map((f) => {
                const isSelected = selectedFiling.ticker === f.ticker;
                const isCurrentlyActiveInWorkspace = currentDatasetId === f.dataset.id;

                return (
                  <button
                    key={f.ticker}
                    onClick={() => setSelectedFiling(f)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-500/60 ring-1 ring-cyan-500/30 text-white'
                        : 'bg-[#18181b]/60 border-[#27272a] hover:bg-[#18181b] hover:border-[#3f3f46] text-[#a1a1aa]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs sm:text-sm">{f.companyName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {f.ticker}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#27272a] text-[#a1a1aa]">
                        Form {f.formType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#71717a]">
                      <span>CIK: {f.cik}</span>
                      <span>Filed: {f.filingDate}</span>
                    </div>

                    {isCurrentlyActiveInWorkspace && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Currently Active in Workspace</span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Filing Dossier & Ingestion Trigger */}
          <div className="md:col-span-7 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              {/* Header Box */}
              <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{selectedFiling.companyName}</h3>
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                        {selectedFiling.ticker}
                      </span>
                    </div>
                    <p className="text-xs text-[#a1a1aa] mt-1">{selectedFiling.industry}</p>
                  </div>
                  <a
                    href={selectedFiling.secEdgarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 hover:underline shrink-0"
                    title="Open official SEC EDGAR filing in new tab"
                  >
                    <span>SEC.gov</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#27272a] text-xs">
                  <div>
                    <span className="text-[10px] text-[#71717a] uppercase font-mono block">Central Index Key (CIK)</span>
                    <span className="font-mono text-white font-medium">{selectedFiling.cik}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717a] uppercase font-mono block">Filing Form</span>
                    <span className="font-mono text-white font-medium">{selectedFiling.formType} ({selectedFiling.fiscalYear})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717a] uppercase font-mono block">Filing Date</span>
                    <span className="font-mono text-white font-medium">{selectedFiling.filingDate}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-[#71717a] uppercase font-mono block">SEC Accession Number</span>
                    <span className="font-mono text-[#a1a1aa] text-[11px] truncate block">{selectedFiling.accessionNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717a] uppercase font-mono block">Auditor Opinion</span>
                    <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{selectedFiling.auditorOpinion}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Statement Metrics Snapshot */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] mb-2 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Audited Statement Highlights ({selectedFiling.fiscalYear})</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedFiling.dataset.incomeStatement.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-2.5 rounded-lg bg-[#18181b]/70 border border-[#27272a]">
                      <span className="text-[10px] text-[#71717a] truncate block">{item.name}</span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-white mt-0.5 block">
                        ${(item.values[selectedFiling.fiscalYear] / 1e9).toFixed(1)}B
                      </span>
                    </div>
                  ))}
                  {selectedFiling.dataset.balanceSheet.slice(2, 4).map((item) => (
                    <div key={item.id} className="p-2.5 rounded-lg bg-[#18181b]/70 border border-[#27272a]">
                      <span className="text-[10px] text-[#71717a] truncate block">{item.name}</span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-indigo-300 mt-0.5 block">
                        ${(item.values[selectedFiling.fiscalYear] / 1e9).toFixed(1)}B
                      </span>
                    </div>
                  ))}
                  {selectedFiling.dataset.cashFlowStatement.slice(0, 1).map((item) => (
                    <div key={item.id} className="p-2.5 rounded-lg bg-[#18181b]/70 border border-[#27272a]">
                      <span className="text-[10px] text-[#71717a] truncate block">Operating Cash Flow</span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400 mt-0.5 block">
                        ${(item.values[selectedFiling.fiscalYear] / 1e9).toFixed(1)}B
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MD&A Excerpt preview */}
              <div className="p-3 rounded-lg bg-[#18181b]/40 border border-[#27272a]/60">
                <span className="text-[10px] font-mono text-[#71717a] uppercase block mb-1">
                  Item 7. Management Discussion & Analysis Excerpt:
                </span>
                <p className="text-xs text-[#a1a1aa] italic line-clamp-2">
                  "{selectedFiling.dataset.mdaExcerpts[0]}"
                </p>
              </div>

              {ingestedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{ingestedSuccess}</span>
                </div>
              )}
            </div>

            {/* Ingest Action Button */}
            <div className="pt-4 mt-4 border-t border-[#27272a] flex items-center justify-between gap-3">
              <div className="text-[11px] text-[#71717a] hidden sm:block">
                <span>Direct ingestion recalculates DuPont, Piotroski, and 3D scenes.</span>
              </div>
              <button
                id="btn-ingest-sec-filing"
                onClick={() => handleIngest(selectedFiling)}
                disabled={isIngesting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/40 cursor-pointer disabled:opacity-50"
              >
                {isIngesting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Parsing XBRL Taxonomy...</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-4 h-4" />
                    <span>Ingest {selectedFiling.ticker} 10-K into Workspace</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
