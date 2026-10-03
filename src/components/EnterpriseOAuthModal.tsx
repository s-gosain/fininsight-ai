import React, { useState } from 'react';
import {
  Building2,
  Lock,
  ArrowRight,
  X,
  CheckCircle2,
  RefreshCw,
  BadgeCheck,
  ShieldCheck,
  Key,
  Layers,
  ChevronRight,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import { USER_ROLES } from '../utils/encryption';
import {
  getEnterpriseSsoConfig,
  evaluateDirectoryRules,
  DEMO_ENTERPRISE_ACCOUNTS,
  DemoEnterpriseAccount,
  DEMO_INDIVIDUAL_ACCOUNTS,
  DemoIndividualAccount,
  resolveIndividualRoleAssertion
} from '../data/enterpriseTenants';

interface EnterpriseOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSsoSuccess: (authUser: AuthUser) => void;
  initialProvider?: 'microsoft_entra' | 'okta' | 'google';
  contextMode?: 'enterprise' | 'individual';
  defaultEmail?: string;
  defaultPracticeName?: string;
}

export const EnterpriseOAuthModal: React.FC<EnterpriseOAuthModalProps> = ({
  isOpen,
  onClose,
  onSsoSuccess,
  initialProvider = 'microsoft_entra',
  contextMode = 'enterprise',
  defaultEmail,
  defaultPracticeName,
}) => {
  const [provider, setProvider] = useState<'microsoft_entra' | 'okta' | 'google'>(initialProvider);
  const [flowStage, setFlowStage] = useState<'prompt' | 'authorizing' | 'claims_eval' | 'complete'>('prompt');
  
  // Selected account for evaluation
  const [selectedEntAccount, setSelectedEntAccount] = useState<DemoEnterpriseAccount>(DEMO_ENTERPRISE_ACCOUNTS[0]);
  const [selectedIndAccount, setSelectedIndAccount] = useState<DemoIndividualAccount>(DEMO_INDIVIDUAL_ACCOUNTS[0]);
  
  const [customEmail, setCustomEmail] = useState(defaultEmail || '');
  const [customOrg, setCustomOrg] = useState(defaultPracticeName || '');
  const [customAdGroup, setCustomAdGroup] = useState('SG-Finance-C-Suite');
  const [evaluatedResult, setEvaluatedResult] = useState<{
    role: UserRole;
    reason: string;
    matchedPattern: string;
  } | null>(null);

  if (!isOpen) return null;

  const isIndividual = contextMode === 'individual';
  const config = getEnterpriseSsoConfig();

  const handleStartOAuthFlow = () => {
    setFlowStage('authorizing');

    let emailToUse = '';
    let userName = '';
    let organizationName = '';
    let department = '';
    let expectedRole: UserRole = 'ADMIN_CFO';

    if (isIndividual) {
      emailToUse = customEmail.trim() || selectedIndAccount.email;
      userName = customEmail.trim() ? (customEmail.split('@')[0].replace(/[._]/g, ' ')) : selectedIndAccount.name;
      organizationName = customOrg.trim() || selectedIndAccount.practiceName;
      department = selectedIndAccount.department;
      expectedRole = selectedIndAccount.expectedRole;
    } else {
      emailToUse = customEmail.trim() || selectedEntAccount.email;
      userName = customEmail.trim() ? (customEmail.split('@')[0].replace(/[._]/g, ' ')) : selectedEntAccount.name;
      organizationName = 'Vance Capital Holdings';
      department = selectedEntAccount.department;
      expectedRole = selectedEntAccount.expectedRole;
    }

    const groupsToUse = [
      customAdGroup.trim() ||
        (expectedRole === 'ADMIN_CFO'
          ? 'SG-Finance-C-Suite'
          : expectedRole === 'AUDITOR'
          ? 'SG-Internal-Audit'
          : expectedRole === 'SENIOR_ANALYST'
          ? 'SG-Controllership'
          : 'All-Domain-Users'),
    ];

    // Stage 1: Simulating OAuth 2.0 PKCE Code Request & Federated Consent
    setTimeout(() => {
      setFlowStage('claims_eval');

      // Stage 2: Simulating Token Exchange & Claim Extraction
      let finalRole: UserRole;
      let reason: string;
      let matchedPattern: string;

      if (isIndividual) {
        finalRole = 'ADMIN_CFO';
        reason = 'Unrestricted Master Clearance (Zero RBAC Restrictions)';
        matchedPattern = 'Individual Practitioner Baseline [Full Access Unlocked - No RBAC]';
      } else {
        const evaluation = evaluateDirectoryRules(emailToUse, groupsToUse, selectedEntAccount.roleDisplayName);
        finalRole = evaluation.role;
        reason = evaluation.reason;
        matchedPattern = evaluation.matchedRule?.patternOrGroup || 'Default Rule';
      }

      setEvaluatedResult({
        role: finalRole,
        reason,
        matchedPattern,
      });

      // Stage 3: Complete & Dispatch Auth User
      setTimeout(() => {
        setFlowStage('complete');
        setTimeout(() => {
          const providerDisplayName = provider === 'microsoft_entra' 
            ? 'Microsoft Entra ID' 
            : provider === 'google' 
            ? 'Google Workspace OIDC' 
            : 'Okta Identity Cloud';

          const authUser: AuthUser = {
            id: `oauth_${provider}_${Date.now().toString(36)}`,
            name: userName,
            email: emailToUse,
            role: finalRole,
            organization: organizationName,
            signedInAt: new Date().toISOString(),
            workspaceType: isIndividual ? 'SOLO_ANALYST' : 'ENTERPRISE',
            department: isIndividual ? 'Independent Valuation & Research Practice' : department,
            employeeId: isIndividual ? 'SOLO-MASTER-01' : `EMP-${provider === 'microsoft_entra' ? 'ENTRA' : 'OKTA'}-${Math.floor(100 + Math.random() * 900)}`,
            clearanceSource: isIndividual
              ? `${providerDisplayName} (Unrestricted Master Clearance - No RBAC)`
              : `${providerDisplayName} OAuth 2.0 (${reason})`,
            isRoleVerified: true,
            idpProvider: provider === 'google' ? 'google_workspace' : provider,
          };
          onSsoSuccess(authUser);
          onClose();
        }, 1000);
      }, 900);
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#141418] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md ${
              isIndividual ? 'bg-emerald-600 shadow-emerald-900/40' : 'bg-indigo-600 shadow-indigo-900/40'
            }`}>
              {isIndividual ? <UserCheck className="w-4 h-4 text-white" /> : <Key className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {isIndividual ? 'Individual Professional SSO & OAuth Gateway' : 'Enterprise SSO OAuth Gateway'}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  isIndividual ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                  OIDC / SAML 2.0
                </span>
              </div>
              <p className="text-[11px] text-[#a1a1aa]">
                {isIndividual 
                  ? 'Federated single sign-on with automated job-role resolution for independent analysts & advisors'
                  : 'Direct federated identity token authentication & automated enterprise role assignment'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* IdP Protocol Selector Tabs */}
        <div className="grid grid-cols-3 p-1.5 bg-[#09090b] border-b border-[#27272a] gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setProvider('microsoft_entra')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              provider === 'microsoft_entra'
                ? 'bg-indigo-600/30 text-white border border-indigo-500/50 shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            {/* Official Microsoft 4-square */}
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            <span className="truncate">Microsoft Entra</span>
          </button>

          <button
            type="button"
            onClick={() => setProvider('google')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              provider === 'google'
                ? 'bg-emerald-600/30 text-white border border-emerald-500/50 shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
            </svg>
            <span className="truncate">Google OIDC</span>
          </button>

          <button
            type="button"
            onClick={() => setProvider('okta')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              provider === 'okta'
                ? 'bg-blue-600/30 text-white border border-blue-500/50 shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400 shrink-0"></div>
            <span className="truncate">Okta SSO</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {flowStage === 'prompt' && (
            <div className="space-y-4">
              {/* OIDC Config Summary */}
              <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                    OAUTH 2.0 / OPENID CONNECT SPECIFICATION
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">PKCE ACTIVE • STATE VALIDATED</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-[#a1a1aa]">
                  <p>Endpoint: <span className="text-white">
                    {provider === 'microsoft_entra' 
                      ? 'https://login.microsoftonline.com/oauth2/v2.0/authorize' 
                      : provider === 'google'
                      ? 'https://accounts.google.com/o/oauth2/v2/auth'
                      : 'https://identity.okta.com/oauth2/v1/authorize'}
                  </span></p>
                  <p>Client ID: <span className="text-indigo-300">{config.clientId}</span></p>
                  <p>Scopes: <span className="text-white">openid profile email Directory.Read.All</span></p>
                  <p>Mode: <span className={isIndividual ? 'text-emerald-400 font-bold' : 'text-indigo-400 font-bold'}>
                    {isIndividual ? 'Individual Practitioner (Full Master Access • Zero RBAC Restrictions)' : 'Corporate Dedicated Tenant'}
                  </span></p>
                </div>
              </div>

              {/* Identity Account Selection */}
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
                  {isIndividual ? 'Select Practice Profile for Testing (Full Master Clearance):' : 'Select Corporate Identity to Authenticate:'}
                </label>

                {isIndividual ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        name: 'Dr. Elena Rostova',
                        email: 'elena@rostovapartners.com',
                        practiceName: 'Rostova Capital Advisory',
                        specialty: 'M&A Valuation, Capital Strategy, DCF Models'
                      },
                      {
                        name: 'Liam Vance',
                        email: 'liam@alpharesearch.io',
                        practiceName: 'Alpha Horizon Research',
                        specialty: 'Financial Statement Modeling, DuPont 5-Step, WACC'
                      }
                    ].map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => {
                          setCustomEmail(acc.email);
                          setCustomOrg(acc.practiceName);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          customEmail === acc.email
                            ? 'bg-emerald-600/20 border-emerald-500 ring-2 ring-emerald-400 text-white'
                            : 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-white">{acc.name}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              FULL MASTER ACCESS
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-300 block truncate">{acc.email}</span>
                          <span className="text-[10px] text-[#a1a1aa] block mt-0.5">{acc.practiceName}</span>
                        </div>
                        <p className="text-[10px] text-emerald-400/80 mt-1.5 line-clamp-1">{acc.specialty} • Zero RBAC</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {DEMO_ENTERPRISE_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => {
                          setSelectedEntAccount(acc);
                          setCustomEmail(acc.email);
                          setCustomAdGroup(
                            acc.expectedRole === 'ADMIN_CFO'
                              ? 'SG-Finance-C-Suite'
                              : acc.expectedRole === 'AUDITOR'
                              ? 'SG-Internal-Audit'
                              : acc.expectedRole === 'SENIOR_ANALYST'
                              ? 'SG-Controllership'
                              : 'All-Domain-Users'
                          );
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selectedEntAccount.email === acc.email
                            ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-400 text-white'
                            : 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-white">{acc.name}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                              {acc.expectedRole}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-indigo-300 block truncate">{acc.email}</span>
                        </div>
                        <p className="text-[10px] text-[#71717a] mt-1.5 line-clamp-1">{acc.roleDisplayName}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct Input Customization */}
              <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2.5">
                <span className="text-[11px] font-bold text-white block">
                  {isIndividual ? 'Or Test Custom Professional Email (Real-Time Auto-Resolution):' : 'Or Test Custom Email & AD Group Assertion:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#71717a] block mb-1">Professional Email:</label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder={isIndividual ? "e.g. cfo.elena@rostovapartners.com" : "e.g. cfo.alex@vancecapital.com"}
                      className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#71717a] block mb-1">
                      {isIndividual ? 'Practice / Firm Name:' : 'Active Directory Group Claim:'}
                    </label>
                    <input
                      type="text"
                      value={isIndividual ? customOrg : customAdGroup}
                      onChange={(e) => isIndividual ? setCustomOrg(e.target.value) : setCustomAdGroup(e.target.value)}
                      placeholder={isIndividual ? "e.g. Rostova Capital Advisory" : "e.g. SG-Finance-C-Suite"}
                      className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[#71717a]">
                  {isIndividual 
                    ? 'Direct federated authentication with zero RBAC restrictions'
                    : 'Auto-evaluates against active Directory Mapping Rules'}
                </span>
                <button
                  type="button"
                  id="btn-launch-oauth-flow"
                  onClick={handleStartOAuthFlow}
                  className={`px-5 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                    isIndividual 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/50' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-950/50'
                  }`}
                >
                  <span>{isIndividual ? 'Authorize & Launch (Zero RBAC)' : 'Authorize & Auto-Resolve Role'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {flowStage === 'authorizing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
              <div>
                <h4 className="text-sm font-bold text-white">Contacting Identity Provider...</h4>
                <p className="text-xs text-[#a1a1aa] mt-1">
                  Exchanging PKCE code challenge with {provider === 'microsoft_entra' ? 'Microsoft Entra ID' : provider === 'google' ? 'Google Workspace' : 'Okta'} OIDC endpoint
                </p>
              </div>
            </div>
          )}

          {flowStage === 'claims_eval' && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
              <BadgeCheck className="w-10 h-10 text-emerald-400 animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  {isIndividual 
                    ? 'Extracting Identity Claims & Unlocking Master Clearance...' 
                    : 'Extracting Claims & Evaluating Directory Rules...'}
                </h4>
                <p className="text-xs text-[#a1a1aa] mt-1">
                  {isIndividual
                    ? 'Granting unrestricted analytical authorization (RBAC disabled for independent practice)'
                    : 'Matching email domain, AD group claims & professional credentials against RBAC policy'}
                </p>
              </div>
            </div>
          )}

          {flowStage === 'complete' && evaluatedResult && (
            <div className="py-6 space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    {isIndividual ? 'Identity Verified • Master Access Unlocked!' : 'OAuth 2.0 Identity & Role Verified!'}
                  </h4>
                  <p className="text-xs text-emerald-300/90 leading-relaxed">
                    {isIndividual 
                      ? 'Successfully authenticated identity. Master Clearance granted with zero RBAC locks.' 
                      : 'Successfully verified token claims. Operational clearance automatically resolved and locked.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2.5">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold block">
                  {isIndividual ? 'INDEPENDENT AUTHORIZATION RESULT:' : 'DIRECTORY ASSERTION RESULT:'}
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#71717a] block text-[10px]">{isIndividual ? 'Access Tier:' : 'Allocated Role:'}</span>
                    <strong className="text-emerald-400">{isIndividual ? 'Master Clearance (Full Access)' : USER_ROLES[evaluatedResult.role].displayName}</strong>
                  </div>
                  <div>
                    <span className="text-[#71717a] block text-[10px]">Evaluation Reason:</span>
                    <span className="text-white font-mono text-[11px]">{evaluatedResult.reason}</span>
                  </div>
                  <div>
                    <span className="text-[#71717a] block text-[10px]">Operating Policy:</span>
                    <span className="text-indigo-300 font-mono text-[11px]">{evaluatedResult.matchedPattern}</span>
                  </div>
                  <div>
                    <span className="text-[#71717a] block text-[10px]">{isIndividual ? 'RBAC Access Tier:' : 'SOX-404 Anti-Tamper:'}</span>
                    <span className="text-emerald-400 font-mono text-[11px]">
                      {isIndividual ? 'Full Master Access (Zero RBAC Locks)' : 'Enforced & Locked'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-[#71717a] animate-pulse">
                Launching verified workspace...
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#27272a] bg-[#18181b] flex items-center justify-between text-[11px] text-[#71717a]">
          <span>Security Protocol: TLS 1.3 • OAuth 2.0 PKCE • RFC 7636</span>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
