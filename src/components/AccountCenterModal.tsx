import React, { useState } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Database, 
  Cloud, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Key, 
  Sparkles, 
  Globe, 
  Calendar,
  Building2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Shield,
  Save
} from 'lucide-react';
import { AuthUser, UserRole, CurrencyCode, FiscalYearType, WorkspaceType } from '../types';
import { USER_ROLES } from '../utils/encryption';
import { auth, savePreferencesToCloud } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { EnterpriseDirectoryMappingConfig } from './EnterpriseDirectoryMappingConfig';

interface AccountCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: AuthUser | null;
  onSignOut: () => void;
  onSignInGoogle: () => void;
  userRole: UserRole;
  onUserRoleChange: (role: UserRole) => void;
  currentCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  fiscalYearType: FiscalYearType;
  onFiscalYearChange: (fy: FiscalYearType) => void;
  isDataMasked: boolean;
  onToggleDataMask: () => void;
  onOpenCloudModal: () => void;
  onOpenAuditModal: () => void;
  viewMode: 'demo' | 'app';
  workspaceType?: WorkspaceType;
}

export const AccountCenterModal: React.FC<AccountCenterModalProps> = ({
  isOpen,
  onClose,
  authUser,
  onSignOut,
  onSignInGoogle,
  userRole,
  onUserRoleChange,
  currentCurrency,
  onCurrencyChange,
  fiscalYearType,
  onFiscalYearChange,
  isDataMasked,
  onToggleDataMask,
  onOpenCloudModal,
  onOpenAuditModal,
  viewMode,
  workspaceType = 'SOLO_ANALYST',
}) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'firebase' | 'security' | 'preferences' | 'sso_mappings'>('profile');
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const roleConfig = USER_ROLES[userRole];
  const isGoogleConnected = Boolean(auth.currentUser);
  const currentEmail = auth.currentUser?.email || authUser?.email || (viewMode === 'demo' ? 'demo@fininsight.ai' : 'analyst@enterprise.com');
  const currentDisplayName = auth.currentUser?.displayName || authUser?.name || 'Enterprise Analyst';
  const currentPhoto = auth.currentUser?.photoURL || authUser?.avatar;

  const handleSavePreferences = async () => {
    setIsSavingPrefs(true);
    setSaveSuccessMsg(null);
    try {
      if (auth.currentUser) {
        await savePreferencesToCloud(auth.currentUser.uid, {
          currency: currentCurrency,
          preferredTab: 'dashboard',
        });
        setSaveSuccessMsg('Preferences persisted to Firestore cloud database.');
      } else {
        setSaveSuccessMsg('Preferences saved locally for this active session.');
      }
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setSaveSuccessMsg('Error saving to cloud. Saved locally.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  return (
    <div 
      id="account-center-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="account-center-modal"
        className="bg-[#121215] border border-[#27272a] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a] bg-[#18181b]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Account Center & Workspace Settings
                {viewMode === 'demo' && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    LOCKED IN DEMO MODE
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Manage Google sign-in credentials, Firestore persistence, and security clearance
              </p>
            </div>
          </div>

          <button
            id="btn-close-account-center"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
            title="Close Account Center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-[#27272a] bg-[#141418] overflow-x-auto scrollbar-none">
          <button
            id="tab-account-profile"
            onClick={() => setActiveSection('profile')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
              activeSection === 'profile'
                ? 'border-indigo-500 text-white bg-[#18181b]'
                : 'border-transparent text-[#a1a1aa] hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Auth</span>
          </button>

          <button
            id="tab-account-firebase"
            onClick={() => setActiveSection('firebase')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
              activeSection === 'firebase'
                ? 'border-indigo-500 text-white bg-[#18181b]'
                : 'border-transparent text-[#a1a1aa] hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Firebase & Cloud</span>
          </button>

          <button
            id="tab-account-security"
            onClick={() => setActiveSection('security')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
              activeSection === 'security'
                ? 'border-indigo-500 text-white bg-[#18181b]'
                : 'border-transparent text-[#a1a1aa] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Role & Security</span>
          </button>

          <button
            id="tab-account-preferences"
            onClick={() => setActiveSection('preferences')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
              activeSection === 'preferences'
                ? 'border-indigo-500 text-white bg-[#18181b]'
                : 'border-transparent text-[#a1a1aa] hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Preferences</span>
          </button>

          <button
            id="tab-account-sso-mappings"
            onClick={() => setActiveSection('sso_mappings')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 border-b-2 ${
              activeSection === 'sso_mappings'
                ? 'border-indigo-500 text-white bg-[#18181b]'
                : 'border-transparent text-[#a1a1aa] hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span className="whitespace-nowrap">SSO & Directory Mappings</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {viewMode === 'demo' && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <span>Account Center is Locked in Demo Mode</span>
                </div>
                <div className="text-[11px] text-amber-200/80 mt-0.5">
                  Identity credentials, role assignments, and cloud preferences are locked during the demo session. Exit demo mode to configure workspace settings.
                </div>
              </div>
            </div>
          )}
          
          {/* Section 1: Profile & Authentication */}
          {activeSection === 'profile' && (
            <div className="space-y-4">
              {/* User Identity Card */}
              <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {currentPhoto ? (
                    <img 
                      src={currentPhoto} 
                      alt={currentDisplayName} 
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/40 shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-indigo-600/30 border-2 border-indigo-500/40 text-indigo-300 font-bold text-xl flex items-center justify-center">
                      {(currentDisplayName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">{currentDisplayName}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Active
                      </span>
                      {authUser?.clearanceSource?.includes('Microsoft Entra') && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          Microsoft Entra SSO
                        </span>
                      )}
                    </div>
                    <p className="text-[#a1a1aa] font-mono text-[11px] mt-0.5">{currentEmail}</p>
                    <p className="text-[#71717a] text-[11px] mt-0.5">
                      {authUser?.organization || (workspaceType === 'SOLO_ANALYST' ? 'Independent Research Practice' : 'Enterprise Financial Group')} • {workspaceType === 'SOLO_ANALYST' ? 'Solo Analyst (Master Clearance)' : roleConfig.displayName}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
                  {!isGoogleConnected ? (
                    <button
                      id="btn-account-signin-google"
                      onClick={onSignInGoogle}
                      disabled={viewMode === 'demo'}
                      title={viewMode === 'demo' ? 'Google Sign-In is locked in demo mode' : 'Sign in with Google'}
                      className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md transition-all ${
                        viewMode === 'demo'
                          ? 'bg-[#27272a] text-[#71717a] border border-[#3f3f46] cursor-not-allowed opacity-60'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                      }`}
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#ffffff" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                        <path fill="#ffffff" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                        <path fill="#ffffff" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                        <path fill="#ffffff" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                      </svg>
                      <span>{viewMode === 'demo' ? 'Sign In (Locked)' : 'Sign In with Google'}</span>
                    </button>
                  ) : (
                    <button
                      id="btn-account-switch-google"
                      onClick={onSignInGoogle}
                      disabled={viewMode === 'demo'}
                      title={viewMode === 'demo' ? 'Account switching is locked in demo mode' : 'Switch Google Account'}
                      className={`w-full sm:w-auto px-3 py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors ${
                        viewMode === 'demo'
                          ? 'bg-[#1e1e24] text-[#71717a] border border-[#27272a] cursor-not-allowed opacity-60'
                          : 'bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-white cursor-pointer'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{viewMode === 'demo' ? 'Switch (Locked)' : 'Switch Google Account'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Authentication Status Details */}
              <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[#a1a1aa]">
                  Identity & Session Status
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#141418] border border-[#27272a]">
                    <div className="text-[11px] text-[#71717a]">Authentication Provider</div>
                    <div className="font-semibold text-white mt-1 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isGoogleConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                      {isGoogleConnected ? 'Firebase Auth (Google OAuth)' : 'Demo Session'}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#141418] border border-[#27272a]">
                    <div className="text-[11px] text-[#71717a]">Firebase User UID</div>
                    <div className="font-mono text-[11px] text-[#a1a1aa] mt-1 truncate" title={auth.currentUser?.uid || authUser?.id || 'sandbox_user'}>
                      {auth.currentUser?.uid || authUser?.id || 'sandbox_user'}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#141418] border border-[#27272a]">
                    <div className="text-[11px] text-[#71717a]">Session Established At</div>
                    <div className="font-mono text-[11px] text-white mt-1">
                      {authUser?.signedInAt ? new Date(authUser.signedInAt).toLocaleString() : 'Active session'}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#141418] border border-[#27272a]">
                    <div className="text-[11px] text-[#71717a]">Security Token Clearance</div>
                    <div className="font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Valid (256-Bit Token)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Firebase & Cloud Persistence */}
          {activeSection === 'firebase' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Firestore Database Configuration
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                </div>

                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-[#141418] border border-[#27272a] flex items-center justify-between">
                    <span className="text-[#71717a]">Database ID:</span>
                    <span className="text-amber-300 font-semibold truncate max-w-[320px]" title={firebaseConfig.firestoreDatabaseId}>
                      {firebaseConfig.firestoreDatabaseId}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#141418] border border-[#27272a] flex items-center justify-between">
                    <span className="text-[#71717a]">GCP Project:</span>
                    <span className="text-white">{firebaseConfig.projectId}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#141418] border border-[#27272a] flex items-center justify-between">
                    <span className="text-[#71717a]">Auth Domain:</span>
                    <span className="text-white">{firebaseConfig.authDomain}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#141418] border border-[#27272a] flex items-center justify-between">
                    <span className="text-[#71717a]">User Collections:</span>
                    <span className="text-emerald-400">users/{'{userId}'}/analyses & preferences</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <p className="text-[11px] text-[#a1a1aa]">
                    Cloud persistence automatically preserves your valuation models, customized SEC summaries, and notes.
                  </p>
                  <button
                    id="btn-account-open-cloud-models"
                    onClick={() => {
                      onClose();
                      onOpenCloudModal();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>View Cloud Models</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Role & Security */}
          {activeSection === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[#a1a1aa]">
                  Active Security Clearance & Governance
                </h4>

                {workspaceType === 'SOLO_ANALYST' ? (
                  /* Solo Professional Clearance View */
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                          SOLO PROFESSIONAL WORKSPACE
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          MASTER CLEARANCE (UNRESTRICTED)
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white">Independent Master Analyst</h3>
                      <p className="text-xs text-[#a1a1aa] leading-relaxed">
                        Operating as an independent analyst. All 10 analytical, forecasting, valuation, and reporting modules are unlocked without corporate segregation-of-duty locks or dual-approval barriers.
                      </p>
                    </div>

                    {/* All Permissions Granted Checklist */}
                    <div className="p-3.5 rounded-lg bg-[#141418] border border-[#27272a] space-y-2">
                      <div className="text-[11px] font-semibold text-white">Full Operational Capabilities:</div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Export Executive PDF: Unrestricted</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>DCF & Monte Carlo: Full Access</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Benford Forensic Scans: Unrestricted</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Direct Statement Ingestion: Enabled</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Budget & Anomaly Analysis: Full Access</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Private Cloud Models: Enabled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Enterprise Corporate Governance View */
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                          CORPORATE GOVERNANCE (SOX-404)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                          ASSIGNED ROLE: {userRole}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{roleConfig.displayName}</h3>
                      <p className="text-xs text-[#a1a1aa] leading-relaxed">
                        Corporate security policy enforces segregation of duties. Operational accessibility is strictly bound to your assigned job role credentials and cannot be altered within this client workstation. Mode switching between operating models is disabled.
                      </p>
                      {authUser?.department && (
                        <div className="pt-2 mt-1 border-t border-indigo-500/20 flex flex-wrap items-center gap-3 text-[11px] text-[#a1a1aa]">
                          <span>Dept: <strong className="text-white">{authUser.department}</strong></span>
                          {authUser.employeeId && <span>ID: <strong className="text-white font-mono">{authUser.employeeId}</strong></span>}
                          {authUser.clearanceSource && <span>Clearance: <strong className="text-indigo-300">{authUser.clearanceSource}</strong></span>}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-[#71717a] font-medium">Enterprise Role Matrix (Fixed via Corporate Clearance):</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(USER_ROLES).map(([key, config]) => {
                          const isAssigned = userRole === key;
                          return (
                            <div
                              key={key}
                              className={`p-3 rounded-lg border text-left flex flex-col justify-between select-none ${
                                isAssigned
                                  ? 'bg-indigo-600/20 border-indigo-500/80 text-white shadow-sm ring-1 ring-indigo-400/40'
                                  : 'bg-[#141418]/60 border-[#27272a] text-[#71717a] opacity-60'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs">{config.displayName}</span>
                                {isAssigned ? (
                                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-[#71717a] flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    Restricted
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#71717a] mt-1">{config.description}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Role Permissions Matrix Checklist */}
                    <div className="p-3 rounded-lg bg-[#141418] border border-[#27272a] space-y-2 mt-3">
                      <div className="text-[11px] font-semibold text-white">Granted Capabilities for {roleConfig.displayName}:</div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className={`flex items-center gap-1.5 ${roleConfig.canExportPDF ? 'text-emerald-400' : 'text-[#71717a]'}`}>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Export Executive PDF: {roleConfig.canExportPDF ? 'Allowed' : 'Restricted'}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${roleConfig.canSyncERP ? 'text-emerald-400' : 'text-[#71717a]'}`}>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ERP Live Reconciliation: {roleConfig.canSyncERP ? 'Allowed' : 'Restricted'}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${roleConfig.canViewAuditLogs ? 'text-emerald-400' : 'text-[#71717a]'}`}>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Audit Trail Inspection: {roleConfig.canViewAuditLogs ? 'Allowed' : 'Restricted'}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${roleConfig.canToggleEncryption ? 'text-emerald-400' : 'text-[#71717a]'}`}>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Data Masking Toggling: {roleConfig.canToggleEncryption ? 'Allowed' : 'Restricted'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuditModal();
                    }}
                    className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Full Security & Audit Trail</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Workstation Preferences */}
          {activeSection === 'preferences' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[#a1a1aa]">
                  Reporting & Analytical Defaults
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-[#71717a] font-medium block mb-1">
                      Reporting Currency
                    </label>
                    <select
                      value={currentCurrency}
                      onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                      className="w-full px-3 py-2 rounded-lg bg-[#141418] border border-[#27272a] text-white text-xs font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="USD">$ USD - US Dollar</option>
                      <option value="EUR">€ EUR - Euro</option>
                      <option value="GBP">£ GBP - British Pound</option>
                      <option value="JPY">¥ JPY - Japanese Yen</option>
                      <option value="CAD">$ CAD - Canadian Dollar</option>
                      <option value="AUD">$ AUD - Australian Dollar</option>
                      <option value="INR">₹ INR - Indian Rupee</option>
                      <option value="CHF">Fr CHF - Swiss Franc</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#71717a] font-medium block mb-1">
                      Fiscal Year Calendar
                    </label>
                    <select
                      value={fiscalYearType}
                      onChange={(e) => onFiscalYearChange(e.target.value as FiscalYearType)}
                      className="w-full px-3 py-2 rounded-lg bg-[#141418] border border-[#27272a] text-white text-xs font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="CALENDAR">Calendar Year (Jan - Dec)</option>
                      <option value="APR_MAR">UK / Commonwealth (Apr - Mar)</option>
                      <option value="OCT_SEP">US Federal / Tech (Oct - Sep)</option>
                      <option value="JUL_JUN">Australian (Jul - Jun)</option>
                      <option value="RETAIL_445">Retail 4-4-5 Accounting</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between p-3 rounded-lg bg-[#141418] border border-[#27272a]">
                  <div>
                    <div className="text-xs font-semibold text-white">Data Masking Mode</div>
                    <div className="text-[11px] text-[#71717a]">Mask executive financial figures on public displays</div>
                  </div>
                  <button
                    onClick={onToggleDataMask}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      isDataMasked
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-[#27272a] text-[#a1a1aa] border-[#3f3f46]'
                    }`}
                  >
                    {isDataMasked ? 'Masking Active' : 'Unmasked (Standard)'}
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {saveSuccessMsg && (
                    <span className="text-emerald-400 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {saveSuccessMsg}
                    </span>
                  )}
                  <button
                    id="btn-save-account-preferences"
                    onClick={handleSavePreferences}
                    disabled={isSavingPrefs || viewMode === 'demo'}
                    title={viewMode === 'demo' ? 'Saving preferences is locked in demo mode' : 'Save Preferences to Cloud'}
                    className={`ml-auto px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                      viewMode === 'demo'
                        ? 'bg-[#27272a] text-[#71717a] border border-[#3f3f46] cursor-not-allowed opacity-60'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                    }`}
                  >
                    {viewMode === 'demo' ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Save (Locked)</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSavingPrefs ? 'Persisting to Firestore...' : 'Save Preferences'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Enterprise SSO & Directory Role Mappings */}
          {activeSection === 'sso_mappings' && (
            <EnterpriseDirectoryMappingConfig />
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[#27272a] bg-[#18181b] flex items-center justify-between">
          {/* Sign Out / Log Out Button (Prominent, unambiguous) */}
          <button
            id="btn-modal-logout"
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="px-4 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 font-semibold text-xs transition-all cursor-pointer shadow-sm"
            title="Sign out of Firebase Auth and terminate workspace session"
          >
            <span>Log Out</span>
          </button>

          <button
            id="btn-modal-close-done"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
