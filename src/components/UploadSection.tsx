import React, { useRef, useState, useMemo } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  FileText, 
  Building, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  Database,
  Tag,
  ShieldCheck,
  Calendar,
  Layers,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { FinancialDataset, DocumentSummaryData, DeepAIAnalysisResponse, DocumentCategoryTag, UserRole, WorkspaceType } from '../types';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';
import { parseFinancialFile } from '../utils/fileParsers';
import { classifyDocument, TAG_METADATA } from '../utils/documentTagging';
import { USER_ROLES } from '../utils/encryption';

interface UploadSectionProps {
  currentDataset: FinancialDataset;
  uploadedFileName?: string;
  documentSummary?: DocumentSummaryData | null;
  aiAnalysis?: DeepAIAnalysisResponse | null;
  onSelectDataset: (dataset: FinancialDataset) => void;
  onUploadSuccess: (dataset: FinancialDataset, fileName?: string, detectedFormat?: string) => void;
  onActivePeriodChange: (period: string) => void;
  onRunDeepAI: () => void;
  isAnalyzing: boolean;
  userRole?: UserRole;
  onOpenRoleMatrix?: () => void;
  isDemoMode?: boolean;
  workspaceType?: WorkspaceType;
  onOpenSecEdgar?: () => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  currentDataset,
  uploadedFileName,
  documentSummary,
  aiAnalysis,
  onSelectDataset,
  onUploadSuccess,
  onActivePeriodChange,
  onRunDeepAI,
  isAnalyzing,
  userRole = 'ADMIN_CFO',
  onOpenRoleMatrix,
  isDemoMode = false,
  workspaceType = 'SOLO_ANALYST',
  onOpenSecEdgar,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<{ text: string; tag: DocumentCategoryTag } | null>(null);

  const roleConfig = USER_ROLES[userRole];
  const canUpload = workspaceType === 'SOLO_ANALYST' ? true : (roleConfig?.canUploadDataset ?? true);
  const canRunAI = workspaceType === 'SOLO_ANALYST' ? true : (roleConfig?.canRunDeepAI ?? true);

  const activeFileName = uploadedFileName || `${currentDataset.companyName.toLowerCase().replace(/\s+/g, '_')}_annual_report.pdf`;

  // Automated AI Classification Tagging for current active file
  const activeClassification = useMemo(() => {
    return classifyDocument({
      fileName: activeFileName,
      documentSummary,
      aiAnalysis,
      dataset: currentDataset,
    });
  }, [activeFileName, documentSummary, aiAnalysis, currentDataset]);

  // Filter out placeholder/empty workspaces ("New Company") in demo mode
  const displayedDatasets = useMemo(() => {
    return isDemoMode
      ? SAMPLE_DATASETS.filter((s) => s.id !== 'sample-empty-workspace' && !s.companyName.toLowerCase().includes('new company'))
      : SAMPLE_DATASETS;
  }, [isDemoMode]);

  const handleFile = async (file: File) => {
    setUploadError(null);
    setUploadSuccessMsg(null);

    const result = await parseFinancialFile(file);
    if (result.success && result.dataset) {
      onUploadSuccess(result.dataset, file.name, result.detectedFormat);
      // Pre-classify immediate upload
      const immediateTag = classifyDocument({
        fileName: file.name,
        detectedFormat: result.detectedFormat,
        dataset: result.dataset,
      });
      setUploadSuccessMsg({
        text: `Successfully parsed ${file.name} (${result.detectedFormat || 'Statement'}). Extracted ${result.dataset.incomeStatement.length} income metrics and ${result.dataset.balanceSheet.length} balance sheet entries.`,
        tag: immediateTag.primaryTag,
      });
      setTimeout(() => setUploadSuccessMsg(null), 7000);
    } else {
      setUploadError(result.error || 'Could not parse the provided financial statement.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-[#09090b]/75 backdrop-blur-xs border-b border-[#27272a] py-4 relative z-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Top row: Active Company & Benchmark Switcher + Period Chips */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Active Company Banner */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-indigo-400 shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-semibold text-white tracking-tight">{currentDataset.companyName}</h1>
                {currentDataset.ticker && (
                  <span className="text-xs px-2 py-0.5 rounded bg-[#18181b] text-indigo-400 font-mono border border-[#27272a] font-medium">
                    {currentDataset.ticker}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded bg-[#18181b] text-[#a1a1aa] border border-[#27272a]">
                  {currentDataset.industry}
                </span>
              </div>

              {/* Active Ingested File Name with Automated AI Category Tags */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-[#71717a] mt-1.5">
                <div className="flex items-center gap-1.5 font-mono text-[#d4d4d8] bg-[#18181b] px-2 py-0.5 rounded-md border border-[#27272a]">
                  <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{activeFileName}</span>
                </div>

                {/* Automated Tagging System: Displaying Category Labels next to file name */}
                <div className="flex items-center gap-1.5 flex-wrap" id="file-category-tags">
                  {activeClassification.allTags.map((tag) => {
                    const meta = TAG_METADATA[tag];
                    return (
                      <span
                        key={tag}
                        id={`tag-badge-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                        className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold font-mono px-2 py-0.5 rounded-md border shadow-xs transition-all ${meta.badgeStyle}`}
                        title={`AI Auto-Categorized as ${tag}: ${activeClassification.reasoning} (${activeClassification.confidence}% confidence)`}
                      >
                        <Tag className={`w-3 h-3 shrink-0 ${meta.iconColor}`} />
                        <span>{tag}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              <p className="text-[11px] text-[#71717a] mt-1">
                Fiscal Closing: <span className="text-[#a1a1aa]">{currentDataset.fiscalYearEnding}</span> • Reporting Base: <span className="text-[#a1a1aa] font-medium">{currentDataset.reportingCurrency}</span>
              </p>
            </div>
          </div>

          {/* Action & Period Selection */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Period Selector Tabs */}
            <div className="flex items-center bg-[#18181b] p-1 rounded-lg border border-[#27272a] overflow-x-auto scrollbar-none max-w-full">
              <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest px-2 shrink-0">Period</span>
              {currentDataset.periods.map((period) => (
                <button
                  key={period}
                  id={`btn-period-${period}`}
                  onClick={() => onActivePeriodChange(period)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all shrink-0 ${
                    currentDataset.activePeriod === period
                      ? 'bg-[#27272a] text-[#fafafa] border border-indigo-500/40 shadow-sm'
                      : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a]/50'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Run Deep AI Analysis Trigger */}
            {canRunAI ? (
              <button
                id="btn-run-deep-ai"
                onClick={onRunDeepAI}
                disabled={isAnalyzing}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-indigo-900/30 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Analyzing 10-K...' : 'Gemini AI Audit'}</span>
              </button>
            ) : (
              <button
                id="btn-run-deep-ai-locked"
                disabled
                className="px-3.5 py-1.5 rounded-lg bg-[#27272a] text-[#71717a] border border-[#3f3f46] text-xs font-medium flex items-center gap-1.5 cursor-not-allowed opacity-80"
                title={`AI Deep Audit is locked for ${roleConfig.displayName} clearance`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Audit (Locked)</span>
              </button>
            )}
          </div>

        </div>

        {/* Locked Role Notification Banner (if upload is restricted, hidden in demo mode) */}
        {!canUpload && !isDemoMode && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Financial statement ingestion and dataset mutation are <strong>locked</strong> for <strong>{roleConfig.displayName}</strong> under SOX-404 segregation of duties.
              </span>
            </div>
            {onOpenRoleMatrix && (
              <button
                onClick={onOpenRoleMatrix}
                className="text-[11px] font-mono text-amber-400 hover:text-amber-200 underline cursor-pointer shrink-0 self-start sm:self-auto"
              >
                View RBAC Governance Policy →
              </button>
            )}
          </div>
        )}

        {/* Second Row: Benchmark Datasets (Demo Mode only) & Drag-Drop Upload Area */}
        <div className={`grid grid-cols-1 ${isDemoMode ? 'lg:grid-cols-12' : ''} gap-3 items-center`}>
          
          {/* Sample Selectors (8 cols) - Only visible in Demo Mode */}
          {isDemoMode && (
            <div className="lg:col-span-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest whitespace-nowrap">Benchmark Scenarios:</span>
              <div className={`grid grid-cols-1 ${displayedDatasets.length <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-2 flex-1`}>
                {displayedDatasets.map((sample) => {
                  const isSelected = sample.id === currentDataset.id;
                  const sampleTag: DocumentCategoryTag = sample.periods.some((p) => /q[1-4]/i.test(p))
                    ? 'Quarterly'
                    : 'Annual';
                  const tagMeta = TAG_METADATA[sampleTag];
                  const isSampleLocked = !canUpload && !isDemoMode;

                  return (
                    <button
                      key={sample.id}
                      id={`btn-sample-${sample.id}`}
                      data-tilt-card="true"
                      data-tilt-max="6"
                      data-tilt-scale="1.02"
                      onClick={() => !isSampleLocked ? onSelectDataset(sample) : onOpenRoleMatrix?.()}
                      className={`relative text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#18181b] border-indigo-500/60 ring-1 ring-indigo-500/30 text-[#fafafa] shadow-sm'
                          : 'bg-[#18181b]/70 border-[#27272a] hover:bg-[#18181b] text-[#a1a1aa] hover:border-[#3f3f46]'
                      } ${isSampleLocked ? 'cursor-pointer hover:border-amber-500/30' : 'cursor-pointer'}`}
                      title={isSampleLocked ? 'Dataset mutation locked under current role. Click to view RBAC rules.' : undefined}
                    >
                      <div className="font-medium truncate text-white flex items-center justify-between">
                        <span>{sample.companyName.split(' ')[0]} {sample.companyName.split(' ')[1] || ''}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${tagMeta.badgeStyle}`}>
                            {sampleTag}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-[#71717a] truncate mt-0.5">{sample.industry.split('&')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Drag & Drop Upload trigger (4 cols in Demo Mode, full width in Main App) */}
          <div className={isDemoMode ? "lg:col-span-4" : "w-full"}>
            {canUpload ? (
              <div
                data-tilt-card="true"
                data-tilt-max="5"
                data-tilt-scale="1.012"
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative p-2.5 rounded-xl border border-dashed flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-500/10 text-indigo-200'
                    : 'border-[#3f3f46] hover:border-[#71717a] bg-[#18181b] hover:bg-[#1c1c20] text-[#a1a1aa]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  id="file-upload-input"
                  name="fileUpload"
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt,.json"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                  aria-label="Upload financial statement or SEC 10-K filing"
                />
                
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-[#27272a] text-[#a1a1aa] flex items-center justify-center shrink-0">
                    <UploadCloud className="w-3.5 h-3.5" />
                  </div>
                  
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {uploadedFileName ? (
                        <>
                          <span className="text-xs font-medium text-white truncate max-w-[140px]">{uploadedFileName}</span>
                          <span className={`text-[9px] font-mono font-medium px-1.5 py-0.2 rounded border ${TAG_METADATA[activeClassification.primaryTag].badgeStyle}`}>
                            {activeClassification.primaryTag}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-[#e4e4e7]">
                          Upload Statement
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#71717a] truncate">
                      {uploadedFileName ? 'Filing loaded • Click to replace' : 'Drop Excel, CSV, or SEC 10-K'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onOpenSecEdgar && (
                    <button
                      type="button"
                      id="btn-trigger-sec-edgar-upload"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSecEdgar();
                      }}
                      className="text-[10px] font-mono px-2 py-1 rounded-lg bg-cyan-950/40 text-cyan-300 hover:text-white border border-cyan-500/40 hover:bg-cyan-900/40 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Search SEC EDGAR for public company Form 10-K filings"
                    >
                      <Building className="w-3 h-3 text-cyan-400" />
                      <span>SEC EDGAR</span>
                    </button>
                  )}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] border border-[#3f3f46] transition-colors flex items-center gap-1">
                    <UploadCloud className="w-3 h-3" />
                    <span>Browse</span>
                  </span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => onOpenRoleMatrix?.()}
                className="p-2.5 rounded-xl border border-dashed border-[#3f3f46] bg-[#18181b] flex items-center justify-between gap-2.5 cursor-pointer hover:border-amber-500/50 transition-all opacity-85"
                title="Financial statement ingestion is locked for this role. Click to view RBAC matrix."
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-white">Ingestion Locked</span>
                      <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        SOX-404
                      </span>
                    </div>
                    <div className="text-[10px] text-[#71717a] truncate">
                      Restricted to CFO / Senior Analyst
                    </div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#27272a] text-amber-400/80 font-mono border border-[#3f3f46] shrink-0">
                  LOCKED
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Feedback alerts */}
        {uploadSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{uploadSuccessMsg.text}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-emerald-400 font-mono">Categorized as:</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${TAG_METADATA[uploadSuccessMsg.tag].badgeStyle}`}>
                {uploadSuccessMsg.tag}
              </span>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

      </div>
    </div>
  );
};
