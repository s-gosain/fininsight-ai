import React, { useState } from 'react';
import {
  Building2,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  X,
  Server,
  Layers,
  Sparkles,
  RefreshCw,
  Sliders,
  ExternalLink,
  Users
} from 'lucide-react';
import { EnterpriseTenant, UserRole } from '../types';
import { USER_ROLES } from '../utils/encryption';
import { saveEnterpriseTenant } from '../data/enterpriseTenants';

interface EnterpriseCompanySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantCreated: (tenant: EnterpriseTenant) => void;
}

export const EnterpriseCompanySetupModal: React.FC<EnterpriseCompanySetupModalProps> = ({
  isOpen,
  onClose,
  onTenantCreated,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [companyName, setCompanyName] = useState('Meridian Financial Partners');
  const [domain, setDomain] = useState('meridianfp.com');
  const [tenantSlug, setTenantSlug] = useState('meridianfp');
  const [idpProvider, setIdpProvider] = useState<'microsoft_entra' | 'google_workspace' | 'okta_saml'>('microsoft_entra');
  const [azureTenantId, setAzureTenantId] = useState('e4a8b791-62d4-48f1-9b93-84192b951c3a');
  const [enforceSox404, setEnforceSox404] = useState(true);
  const [enableScimSync, setEnableScimSync] = useState(true);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Default directory group bindings configured by IT admin
  const [cfoGroup, setCfoGroup] = useState('SG-Executive-Finance-CFO');
  const [auditorGroup, setAuditorGroup] = useState('SG-Internal-Forensic-Audit');
  const [controllerGroup, setControllerGroup] = useState('SG-Controllership-Operations');
  const [stakeholderGroup, setStakeholderGroup] = useState('All-Domain-Employees (Least Privilege)');

  if (!isOpen) return null;

  const handleCompanyNameChange = (val: string) => {
    setCompanyName(val);
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 16);
    if (!domain.includes('meridianfp.com') || val === 'Meridian Financial Partners') {
      setTenantSlug(slug || 'corp');
    }
  };

  const handleDomainChange = (val: string) => {
    const cleanDomain = val.toLowerCase().replace(/https?:\/\//, '').replace(/\/.*$/, '').trim();
    setDomain(cleanDomain);
    const slug = cleanDomain.split('.')[0] || 'tenant';
    setTenantSlug(slug);
  };

  const handleCompleteSetup = () => {
    if (!companyName.trim() || !domain.trim()) {
      setErrorMessage('Please specify both company name and corporate email domain.');
      return;
    }

    setIsProvisioning(true);
    setErrorMessage(null);

    setTimeout(() => {
      const newTenant: EnterpriseTenant = {
        id: `tenant-${Date.now().toString(36)}`,
        name: companyName.trim(),
        domain: domain.trim().toLowerCase(),
        tenantSlug: tenantSlug.trim().toLowerCase(),
        idpProvider,
        azureTenantId: idpProvider === 'microsoft_entra' ? azureTenantId : undefined,
        enforceSox404,
        status: 'active',
        createdAt: new Date().toISOString(),
        roleMappings: [
          {
            directoryGroupOrDepartment: cfoGroup,
            role: 'ADMIN_CFO',
            description: 'Chief Financial Officer - Full administrative clearance, capital budgeting & signing authority',
          },
          {
            directoryGroupOrDepartment: auditorGroup,
            role: 'AUDITOR',
            description: 'Internal & Forensic Auditor - SOX 404 compliance locked, read-only statements & red flags',
          },
          {
            directoryGroupOrDepartment: controllerGroup,
            role: 'SENIOR_ANALYST',
            description: 'Senior Financial Controller - General ledger reconciliation & statement write authority',
          },
          {
            directoryGroupOrDepartment: stakeholderGroup,
            role: 'STAKEHOLDER',
            description: 'Corporate Stakeholder - Principle of least privilege, high-level summaries',
          },
        ],
      };

      saveEnterpriseTenant(newTenant);
      setIsProvisioning(false);
      onTenantCreated(newTenant);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#141418] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-[#27272a] bg-[#18181b]/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/40">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Enterprise Company Setup</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  TENANT PROVISIONING
                </span>
              </div>
              <p className="text-[11px] text-[#71717a]">
                Microsoft Entra ID & Enterprise Directory Job-Role Integration
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

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-[#09090b] border-b border-[#27272a] flex items-center justify-between text-xs">
          {[
            { step: 1, label: '1. Company & Domain' },
            { step: 2, label: '2. Microsoft Entra SSO' },
            { step: 3, label: '3. Auto Job-Role Rules' },
            { step: 4, label: '4. Governance & Deploy' },
          ].map((item) => (
            <div
              key={item.step}
              className={`flex items-center gap-1.5 font-medium ${
                currentStep === item.step
                  ? 'text-indigo-400 font-bold'
                  : currentStep > item.step
                  ? 'text-emerald-400'
                  : 'text-[#71717a]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === item.step
                    ? 'bg-indigo-600 text-white'
                    : currentStep > item.step
                    ? 'bg-emerald-500 text-black'
                    : 'bg-[#27272a] text-[#71717a]'
                }`}
              >
                {currentStep > item.step ? '✓' : item.step}
              </span>
              <span className="hidden sm:inline text-[11px]">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Company Profile & Domain */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Company Profile & Primary Corporate Domain</h4>
                <p className="text-xs text-[#a1a1aa]">
                  Configure your organization's legal identity. Employees logging in with this domain will be routed to your company's dedicated portal.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-1">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => handleCompanyNameChange(e.target.value)}
                    placeholder="e.g. Vance Capital Holdings"
                    className="w-full px-3.5 py-2.5 bg-[#09090b] border border-[#27272a] focus:border-indigo-500 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-1">
                      Corporate Email Domain (@)
                    </label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-3" />
                      <input
                        type="text"
                        value={domain}
                        onChange={(e) => handleDomainChange(e.target.value)}
                        placeholder="e.g. vancecapital.com"
                        className="w-full pl-9 pr-3 py-2 bg-[#09090b] border border-[#27272a] focus:border-indigo-500 rounded-xl text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-1">
                      Dedicated Tenant Vanity Slug
                    </label>
                    <div className="relative">
                      <span className="text-[10px] text-[#71717a] absolute left-3 top-2.5 font-mono">/tenant/</span>
                      <input
                        type="text"
                        value={tenantSlug}
                        onChange={(e) => setTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="vancecapital"
                        className="w-full pl-17 pr-3 py-2 bg-[#09090b] border border-[#27272a] focus:border-indigo-500 rounded-xl text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/25 space-y-1.5">
                  <div className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dedicated Employee Login Portal:</span>
                  </div>
                  <div className="text-[11px] font-mono text-indigo-300 break-all bg-[#09090b] px-3 py-2 rounded-lg border border-indigo-500/30">
                    https://fininsight.ai/tenant/{tenantSlug || 'company'}
                  </div>
                  <p className="text-[10px] text-[#a1a1aa]">
                    Employees typing <span className="text-white font-mono font-bold">@{domain || 'company.com'}</span> in the universal login are automatically directed to your company's Microsoft Entra ID single sign-on.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Identity Provider & SSO */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Identity Provider (IdP) & SSO Protocol</h4>
                <p className="text-xs text-[#a1a1aa]">
                  Select your enterprise authentication authority. This handles SAML 2.0 / OpenID Connect tokens and passes directory attributes to FinInsight AI.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  {
                    id: 'microsoft_entra' as const,
                    title: 'Microsoft Entra ID',
                    subtitle: 'Azure Active Directory (OIDC/SAML)',
                    badge: 'Recommended',
                    activeColor: 'border-indigo-500 bg-indigo-950/20',
                  },
                  {
                    id: 'google_workspace' as const,
                    title: 'Google Workspace',
                    subtitle: 'Enterprise SAML Directory',
                    badge: 'Enterprise',
                    activeColor: 'border-emerald-500 bg-emerald-950/20',
                  },
                  {
                    id: 'okta_saml' as const,
                    title: 'Okta / Ping Identity',
                    subtitle: 'SAML 2.0 Identity Cloud',
                    badge: 'Standard',
                    activeColor: 'border-blue-500 bg-blue-950/20',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIdpProvider(item.id)}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      idpProvider === item.id
                        ? `${item.activeColor} ring-1 ring-indigo-400`
                        : 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{item.title}</span>
                        {idpProvider === item.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <p className="text-[10px] text-[#71717a]">{item.subtitle}</p>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[#d4d4d8] w-fit mt-3">
                      {item.badge}
                    </span>
                  </button>
                ))}
              </div>

              {idpProvider === 'microsoft_entra' && (
                <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-1">
                      Microsoft Azure Tenant ID (Directory GUID)
                    </label>
                    <input
                      type="text"
                      value={azureTenantId}
                      onChange={(e) => setAzureTenantId(e.target.value)}
                      placeholder="e.g. 0b2a7582-7f39-4d64-8711-9f939e24a89a"
                      className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded-lg text-white font-mono text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="text-xs font-semibold text-white">Automated SCIM Directory Sync</div>
                      <div className="text-[10px] text-[#71717a]">
                        Automatically revoke access and rotate encryption keys when employees depart in Azure AD
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableScimSync}
                      onChange={(e) => setEnableScimSync(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Automated Job-Role Directory Mappings */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Automated Job-Role Directory Mappings</h4>
                <p className="text-xs text-[#a1a1aa]">
                  Configure your company's Active Directory security group rules. When employees log in via Microsoft Entra, their job role is assigned automatically without manual input.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {/* Rule 1: CFO */}
                <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="font-bold text-white text-xs">Chief Financial Officer (Admin)</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      ADMIN_CFO
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#71717a] shrink-0">Map Entra Group:</span>
                    <input
                      type="text"
                      value={cfoGroup}
                      onChange={(e) => setCfoGroup(e.target.value)}
                      placeholder="e.g. SG-Finance-C-Suite"
                      className="flex-1 px-2.5 py-1 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Rule 2: Auditor */}
                <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span className="font-bold text-white text-xs">Forensic & Internal Auditor</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      AUDITOR
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#71717a] shrink-0">Map Entra Group:</span>
                    <input
                      type="text"
                      value={auditorGroup}
                      onChange={(e) => setAuditorGroup(e.target.value)}
                      placeholder="e.g. SG-Internal-Audit"
                      className="flex-1 px-2.5 py-1 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Rule 3: Senior Controller */}
                <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                      <span className="font-bold text-white text-xs">Senior Financial Controller</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                      SENIOR_ANALYST
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#71717a] shrink-0">Map Entra Group:</span>
                    <input
                      type="text"
                      value={controllerGroup}
                      onChange={(e) => setControllerGroup(e.target.value)}
                      placeholder="e.g. SG-Controllership"
                      className="flex-1 px-2.5 py-1 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Rule 4: Default Organization User */}
                <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      <span className="font-bold text-white text-xs">Corporate Stakeholder (Read-Only)</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-500/20 text-slate-300 font-bold border border-slate-500/30">
                      STAKEHOLDER
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#71717a] shrink-0">Default Policy:</span>
                    <input
                      type="text"
                      value={stakeholderGroup}
                      onChange={(e) => setStakeholderGroup(e.target.value)}
                      placeholder="All Domain Users"
                      className="flex-1 px-2.5 py-1 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  Anti-Tamper Active: Employees cannot self-assign or upgrade their roles; authorization is strictly derived from the IdP token assertion.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: Governance & Deploy */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Review & Deploy Enterprise Tenant</h4>
                <p className="text-xs text-[#a1a1aa]">
                  Verify your tenant configuration. Once deployed, company employees can immediately log in via your dedicated vanity URL.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] space-y-3">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#27272a] text-[11px]">
                  <div>
                    <span className="text-[#71717a] block">Organization:</span>
                    <span className="font-bold text-white text-xs">{companyName}</span>
                  </div>
                  <div>
                    <span className="text-[#71717a] block">Verified Domain:</span>
                    <span className="font-bold text-indigo-300 font-mono text-xs">@{domain}</span>
                  </div>
                  <div>
                    <span className="text-[#71717a] block">SSO Provider:</span>
                    <span className="font-semibold text-white">{idpProvider === 'microsoft_entra' ? 'Microsoft Entra ID (Azure AD)' : 'Enterprise SAML'}</span>
                  </div>
                  <div>
                    <span className="text-[#71717a] block">Tenant Slug:</span>
                    <span className="font-mono text-white">/tenant/{tenantSlug}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-[11px]">
                  <div className="flex items-center justify-between text-[#a1a1aa]">
                    <span>SOX-404 Segregation of Duties:</span>
                    <span className="text-emerald-400 font-semibold font-mono">ENFORCED (ROLE LOCK ACTIVE)</span>
                  </div>
                  <div className="flex items-center justify-between text-[#a1a1aa]">
                    <span>SCIM Auto-Deprovisioning:</span>
                    <span className="text-emerald-400 font-semibold font-mono">{enableScimSync ? 'ENABLED' : 'DISABLED'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#a1a1aa]">
                    <span>In-App Mode Switching:</span>
                    <span className="text-amber-400 font-semibold font-mono">DISABLED</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-[#a1a1aa] space-y-1">
                <strong className="text-white">Ready for Organization Rollout:</strong>
                <p>
                  Deploying will generate the dedicated company login screen and initialize automated job-role token resolution for all users under <span className="text-white font-mono font-bold">@{domain}</span>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-4 bg-[#18181b] border-t border-[#27272a] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              className="px-3 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#d4d4d8] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#71717a] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-900/40"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isProvisioning}
              onClick={handleCompleteSetup}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/50 disabled:opacity-50"
            >
              {isProvisioning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Provisioning Enterprise Tenant...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Deploy Enterprise Tenant</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
