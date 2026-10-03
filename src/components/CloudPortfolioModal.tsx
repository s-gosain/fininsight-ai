import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Save, 
  Trash2, 
  ExternalLink, 
  X, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Plus,
  Database,
  Lock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  saveAnalysisToCloud, 
  fetchUserAnalyses, 
  deleteAnalysisFromCloud, 
  SavedCloudAnalysis,
  auth
} from '../lib/firebase';
import { FinancialDataset, AuthUser } from '../types';

interface CloudPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDataset: FinancialDataset;
  onLoadDataset?: (dataset: FinancialDataset) => void;
  authUser: AuthUser | null;
  onPromptSignIn: () => void;
}

export const CloudPortfolioModal: React.FC<CloudPortfolioModalProps> = ({
  isOpen,
  onClose,
  currentDataset,
  onLoadDataset,
  authUser,
  onPromptSignIn,
}) => {
  const [analyses, setAnalyses] = useState<SavedCloudAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotes, setSaveNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load saved analyses whenever modal opens and user is signed in
  useEffect(() => {
    if (isOpen && auth.currentUser) {
      loadAnalyses();
    }
  }, [isOpen, auth.currentUser]);

  const loadAnalyses = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      const data = await fetchUserAnalyses(auth.currentUser.uid);
      setAnalyses(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } catch (err) {
      console.error('Failed to load analyses from Firestore:', err);
      setStatusMessage({ text: 'Failed to retrieve saved models from Firestore.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCurrent = async () => {
    if (!auth.currentUser) {
      onPromptSignIn();
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    const modelId = `model_${currentDataset.ticker.toLowerCase()}_${Date.now().toString(36)}`;
    const newAnalysis: Omit<SavedCloudAnalysis, 'userId'> = {
      id: modelId,
      companyName: currentDataset.companyName,
      ticker: currentDataset.ticker,
      industry: currentDataset.industry || 'Technology & Enterprise Software',
      notes: saveNotes.trim() || `Saved financial valuation for ${currentDataset.companyName} (${currentDataset.activePeriod}).`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveAnalysisToCloud(auth.currentUser.uid, newAnalysis);
      setStatusMessage({ text: `Saved "${currentDataset.companyName}" model to your Cloud Portfolio!`, type: 'success' });
      setSaveNotes('');
      await loadAnalyses();
    } catch (err) {
      console.error('Error saving model to Firestore:', err);
      setStatusMessage({ text: 'Error saving model to Firestore. Please verify network permissions.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!auth.currentUser) return;
    if (!confirm(`Delete saved model for ${name}?`)) return;

    try {
      await deleteAnalysisFromCloud(auth.currentUser.uid, id);
      setAnalyses(prev => prev.filter(item => item.id !== id));
      setStatusMessage({ text: `Deleted "${name}" from Cloud Portfolio.`, type: 'success' });
    } catch (err) {
      console.error('Failed to delete from Firestore:', err);
      setStatusMessage({ text: 'Failed to delete item from Firestore.', type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-[#18181b] border border-[#27272a] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#27272a] bg-[#09090b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Cloud Data Persistence</h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-semibold">
                  FIRESTORE
                </span>
              </div>
              <p className="text-xs text-[#71717a]">
                Securely store and retrieve financial models across sessions & devices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Not Signed In Warning */}
          {!authUser && (
            <div className="p-5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Sign In Required for Cloud Persistence</h4>
                  <p className="text-xs text-[#a1a1aa] mt-0.5">
                    Connect your Google account with Firebase Auth to save models and sync preferences to Firestore.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPromptSignIn();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-all cursor-pointer shadow-md shadow-indigo-900/40"
              >
                Sign In with Google
              </button>
            </div>
          )}

          {/* Save Active Model Section */}
          <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Save Current Financial Model</span>
              </div>
              <span className="text-[11px] font-mono text-[#71717a]">
                Active: <strong className="text-indigo-300 font-semibold">{currentDataset.companyName} ({currentDataset.ticker})</strong>
              </span>
            </div>

            <p className="text-xs text-[#a1a1aa] mb-3">
              Store a persistent snapshot of {currentDataset.companyName} with active period ({currentDataset.activePeriod}) and financial ratios to your Firestore cloud profile.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={saveNotes}
                onChange={(e) => setSaveNotes(e.target.value)}
                placeholder="Optional notes: e.g. FY2024 EBITDA margin expansion thesis..."
                className="flex-1 px-3 py-2 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded-lg text-xs text-white focus:outline-none transition-colors"
                disabled={!authUser || isSaving}
              />
              <button
                type="button"
                onClick={handleSaveCurrent}
                disabled={!authUser || isSaving}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Save to Cloud</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Saved Models List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#71717a]" />
                <h4 className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">Your Saved Financial Models</h4>
              </div>
              {authUser && (
                <button
                  onClick={loadAnalyses}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  title="Refresh from Firestore"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-[#71717a]">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mb-2" />
                <p className="text-xs">Querying Firestore collection...</p>
              </div>
            ) : analyses.length === 0 ? (
              <div className="py-10 text-center rounded-xl bg-[#09090b]/50 border border-[#27272a] text-[#71717a]">
                <Database className="w-8 h-8 mx-auto mb-2 text-[#3f3f46]" />
                <p className="text-xs font-medium text-[#a1a1aa]">No saved models found in your Firestore cloud store.</p>
                <p className="text-[11px] text-[#71717a] mt-1">
                  Save your current analysis above to access it from any device.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {analyses.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">{item.companyName}</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#27272a] text-[#a1a1aa] text-[10px] font-mono">
                          {item.ticker}
                        </span>
                        <span className="text-[10px] text-[#71717a] hidden sm:inline">
                          {item.industry}
                        </span>
                      </div>
                      <p className="text-xs text-[#a1a1aa] mt-1 line-clamp-1">
                        {item.notes}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-[#71717a]">
                        <Clock className="w-3 h-3" />
                        <span>Saved {new Date(item.updatedAt).toLocaleDateString()} at {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.companyName)}
                        title="Delete from Firestore"
                        className="p-1.5 rounded-lg text-[#71717a] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#27272a] bg-[#09090b] flex items-center justify-between text-xs text-[#71717a]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Firestore Enterprise • Real-Time Cloud Sync</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
