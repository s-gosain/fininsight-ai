import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Globe, 
  Calendar, 
  Layers, 
  FileSpreadsheet, 
  Terminal, 
  Play, 
  KeyRound, 
  Mail, 
  User, 
  Check, 
  RefreshCw, 
  Briefcase,
  ShieldAlert,
  BadgeCheck,
  Key,
  AlertCircle
} from 'lucide-react';
import { UserRole, CurrencyCode, FiscalYearType, AuthUser, WorkspaceType, EnterpriseTenant } from '../types';
import { CURRENCIES, FISCAL_YEAR_TYPES } from '../data/currenciesAndFiscal';
import { USER_ROLES } from '../utils/encryption';
import { signInWithGoogle } from '../lib/firebase';
import {
  getEnterpriseTenants,
  findTenantByDomain,
  resolveDirectoryAssertion,
  DEMO_ENTERPRISE_ACCOUNTS,
  DemoEnterpriseAccount,
  DEMO_INDIVIDUAL_ACCOUNTS,
  DemoIndividualAccount,
  resolveIndividualRoleAssertion,
  IndividualRoleAssertion
} from '../data/enterpriseTenants';
import { EnterpriseCompanySetupModal } from './EnterpriseCompanySetupModal';
import { EnterpriseOAuthModal } from './EnterpriseOAuthModal';

interface OnboardingAuthPageProps {
  onCompleteAuth: (
    user: AuthUser,
    preferences?: {
      currency?: CurrencyCode;
      fiscalYear?: FiscalYearType;
      dataMasking?: boolean;
      erp?: string;
    }
  ) => void;
  onBackToLanding: () => void;
  onLaunchDemo: () => void;
  initialRole?: UserRole;
  isEmbedded?: boolean;
}

export const OnboardingAuthPage: React.FC<OnboardingAuthPageProps> = ({
  onCompleteAuth,
  onBackToLanding,
  onLaunchDemo,
  initialRole = 'ADMIN_CFO',
  isEmbedded = false,
}) => {
  // Step state (1: Auth, 2: Workspace & Role, 3: Security & Governance, 4: Launch)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<1 | 2 | 3 | 4>(1);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [identityVerified, setIdentityVerified] = useState(false);

  // Form State
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('user@vancecapital.com');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('User');
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>('SOLO_ANALYST');
  const [organization, setOrganization] = useState('Apex Research Partners');
  const [practiceFocus, setPracticeFocus] = useState('Comprehensive Valuation & M&A');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [fiscalYear, setFiscalYear] = useState<FiscalYearType>('CALENDAR');
  const [enableDataMasking, setEnableDataMasking] = useState(false);
  const [enableAuditLogging, setEnableAuditLogging] = useState(true);
  const [preferredErp, setPreferredErp] = useState<'netsuite' | 'sap' | 'qbo' | 'sec_direct'>('netsuite');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Enterprise Multi-Tenant & Microsoft Login Track State
  const [loginTrack, setLoginTrack] = useState<'enterprise_sso' | 'solo_professional'>('enterprise_sso');
  const [isCompanySetupModalOpen, setIsCompanySetupModalOpen] = useState(false);
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);
  const [oauthProviderTarget, setOauthProviderTarget] = useState<'microsoft_entra' | 'okta' | 'google'>('microsoft_entra');
  const [customTenants, setCustomTenants] = useState<EnterpriseTenant[]>(() => getEnterpriseTenants());

  // Enterprise Role Verification & Clearance Key State
  const [clearanceCodeInput, setClearanceCodeInput] = useState('');
  const [clearanceError, setClearanceError] = useState<string | null>(null);
  const [clearanceSuccess, setClearanceSuccess] = useState<string | null>(null);
  const [unlockedRoles, setUnlockedRoles] = useState<Record<UserRole, boolean>>({
    ADMIN_CFO: false,
    AUDITOR: false,
    SENIOR_ANALYST: true,
    STAKEHOLDER: true,
  });

  // Extract domain from email
  const userDomain = useMemo(() => {
    if (!email || !email.includes('@')) return 'vancecapital.com';
    return email.split('@')[1]?.toLowerCase().trim() || 'vancecapital.com';
  }, [email]);

  // Match registered enterprise tenant (e.g. Vance Capital, Apex Global, or custom created)
  const matchedTenant = useMemo(() => {
    return findTenantByDomain(userDomain) || customTenants.find((t) => t.domain.toLowerCase() === userDomain);
  }, [userDomain, customTenants]);

  // Automated Directory Profile Resolution via Microsoft Entra / SAML Directory Mappings
  const directoryProfile = useMemo(() => {
    const activeTenant = matchedTenant || customTenants[0];
    const assertion = resolveDirectoryAssertion(activeTenant, email, fullName !== 'User' ? fullName : undefined);
    return assertion;
  }, [matchedTenant, customTenants, email, fullName]);

  // Automated Individual Role Resolution based on email, domain heuristics, and mapping rules
  const individualProfile = useMemo(() => {
    return resolveIndividualRoleAssertion(email, fullName !== 'User' ? fullName : undefined, organization);
  }, [email, fullName, organization]);

  // Microsoft Entra ID One-Click Automated Job-Role Login
  const handleMicrosoftSignIn = () => {
    setIsMicrosoftLoading(true);
    setAuthError(null);
    setTimeout(() => {
      setIsMicrosoftLoading(false);
      const activeTenant = matchedTenant || customTenants[0];
      const assertion = resolveDirectoryAssertion(activeTenant, email, fullName !== 'User' ? fullName : undefined);

      setIdentityVerified(true);
      setWorkspaceType('ENTERPRISE');
      setFullName(assertion.name);
      setEmail(assertion.email);
      setOrganization(assertion.organization);
      setRole(assertion.role);
      setUnlockedRoles((prev) => ({ ...prev, [assertion.role]: true }));

      // Automatically advance to Step 2
      goToStep(2);
    }, 600);
  };

  const handleOAuthSuccess = (ssoUser: AuthUser) => {
    setIdentityVerified(true);
    const targetWorkspace = ssoUser.workspaceType || (loginTrack === 'solo_professional' ? 'SOLO_ANALYST' : 'ENTERPRISE');
    setWorkspaceType(targetWorkspace);
    setFullName(ssoUser.name);
    setEmail(ssoUser.email);
    setOrganization(ssoUser.organization);
    if (targetWorkspace === 'SOLO_ANALYST') {
      setRole('ADMIN_CFO');
      setUnlockedRoles({ ADMIN_CFO: true, SENIOR_ANALYST: true, AUDITOR: true, STAKEHOLDER: true });
      setClearanceSuccess(`SSO Authorized: ${ssoUser.name} authenticated with Unrestricted Master Clearance (Zero RBAC)`);
    } else {
      setRole(ssoUser.role);
      setUnlockedRoles((prev) => ({ ...prev, [ssoUser.role]: true }));
      setClearanceSuccess(`SSO Authorized: ${ssoUser.name} authenticated with auto-resolved role (${USER_ROLES[ssoUser.role].displayName})`);
    }
    goToStep(2);
  };

  const handleSelectDemoAccount = (demo: DemoEnterpriseAccount) => {
    setEmail(demo.email);
    setFullName(demo.name);
    const activeTenant = findTenantByDomain(demo.email) || customTenants[0];
    const assertion = resolveDirectoryAssertion(activeTenant, demo.email, demo.name);
    setRole(assertion.role);
    setUnlockedRoles((prev) => ({ ...prev, [assertion.role]: true }));
    setOrganization(activeTenant.name);
    setAuthError(null);
  };

  const handleSelectDemoIndividualAccount = (demo: DemoIndividualAccount) => {
    setEmail(demo.email);
    setFullName(demo.name);
    setOrganization(demo.practiceName);
    setRole('ADMIN_CFO');
    setUnlockedRoles({ ADMIN_CFO: true, SENIOR_ANALYST: true, AUDITOR: true, STAKEHOLDER: true });
    setClearanceSuccess(`Individual Practice Loaded: ${demo.name} (Unrestricted Master Clearance • Zero RBAC)`);
    setAuthError(null);
    goToStep(2);
  };

  const handleInstantLaunchSolo = (demo: DemoIndividualAccount) => {
    setIsSubmitting(true);
    const authUser: AuthUser = {
      id: `usr_demo_${Date.now().toString(36)}`,
      name: demo.name,
      email: demo.email,
      role: 'ADMIN_CFO',
      organization: demo.practiceName,
      signedInAt: new Date().toISOString(),
      workspaceType: 'SOLO_ANALYST',
      department: 'Independent Practice (Full Analytical Clearance)',
      employeeId: 'SOLO-MASTER-01',
      clearanceSource: 'Independent Practitioner Clearance (Unrestricted • Zero RBAC)',
      isRoleVerified: true,
    };
    onCompleteAuth(authUser, {
      currency: 'USD',
      fiscalYear: 'CALENDAR_DEC',
      dataMasking: false,
      erp: 'sec_direct',
    });
  };

  const handleInstantLaunchEnterprise = (demo: DemoEnterpriseAccount) => {
    setIsSubmitting(true);
    const activeTenant = findTenantByDomain(demo.email) || customTenants[0];
    const assertion = resolveDirectoryAssertion(activeTenant, demo.email, demo.name);
    const authUser: AuthUser = {
      id: `usr_demo_${Date.now().toString(36)}`,
      name: demo.name,
      email: demo.email,
      role: assertion.role,
      organization: activeTenant.name,
      signedInAt: new Date().toISOString(),
      workspaceType: 'ENTERPRISE',
      department: demo.department,
      employeeId: assertion.employeeId || 'EMP-VC-001',
      clearanceSource: 'Corporate Enterprise Directory (Microsoft Entra Verified)',
      isRoleVerified: true,
    };
    onCompleteAuth(authUser, {
      currency: 'USD',
      fiscalYear: 'CALENDAR_DEC',
      dataMasking: false,
      erp: 'netsuite',
    });
  };

  const handleTenantCreated = (newTenant: EnterpriseTenant) => {
    const updated = getEnterpriseTenants();
    setCustomTenants(updated);
    setEmail(`cfo@${newTenant.domain}`);
    setFullName('Executive Administrator');
    setOrganization(newTenant.name);
    setWorkspaceType('ENTERPRISE');
    setRole('ADMIN_CFO');
    setUnlockedRoles((prev) => ({ ...prev, ADMIN_CFO: true }));
    setClearanceSuccess(`Tenant Provisioned: ${newTenant.name} (@${newTenant.domain}) deployed with Microsoft Entra ID.`);
  };

  // Synchronize initial role based on directory match when switching to enterprise
  useEffect(() => {
    if (workspaceType === 'ENTERPRISE') {
      if (directoryProfile.matched) {
        setRole(directoryProfile.assignedRole);
        setUnlockedRoles((prev) => ({ ...prev, [directoryProfile.assignedRole]: true }));
      }
    }
  }, [workspaceType, directoryProfile]);

  // Synchronize initial role based on individual role resolution in solo track (Zero RBAC restrictions)
  useEffect(() => {
    if (workspaceType === 'SOLO_ANALYST' || loginTrack === 'solo_professional') {
      setRole('ADMIN_CFO');
      setUnlockedRoles({ ADMIN_CFO: true, SENIOR_ANALYST: true, AUDITOR: true, STAKEHOLDER: true });
    }
  }, [workspaceType, loginTrack]);

  const handleVerifyClearanceCode = (codeToVerify?: string) => {
    const code = (codeToVerify || clearanceCodeInput).trim().toUpperCase();
    setClearanceError(null);
    setClearanceSuccess(null);

    if (!code) {
      setClearanceError('Please enter a department security clearance token.');
      return;
    }

    if (code === 'CFO-AUTH-2026' || code === 'CFO-AUTH' || code === 'EXEC-CFO') {
      setRole('ADMIN_CFO');
      setUnlockedRoles((prev) => ({ ...prev, ADMIN_CFO: true }));
      setClearanceSuccess('Clearance Validated: Chief Financial Officer (Admin) authority verified by corporate token.');
      setClearanceCodeInput('');
      return;
    }

    if (code === 'SOX-AUDIT-404' || code === 'AUDIT-404' || code === 'SOX-AUDITOR') {
      setRole('AUDITOR');
      setUnlockedRoles((prev) => ({ ...prev, AUDITOR: true }));
      setClearanceSuccess('Clearance Validated: Forensic & Internal Auditor clearance authorized by Audit Committee.');
      setClearanceCodeInput('');
      return;
    }

    if (code === 'FIN-CTRL-88' || code === 'CTRL-88') {
      setRole('SENIOR_ANALYST');
      setUnlockedRoles((prev) => ({ ...prev, SENIOR_ANALYST: true }));
      setClearanceSuccess('Clearance Validated: Financial Controller & Senior Analyst authorized.');
      setClearanceCodeInput('');
      return;
    }

    setClearanceError('Invalid clearance token. Tokens must be issued by Corporate IT/Compliance (e.g. CFO-AUTH-2026 or SOX-AUDIT-404).');
  };

  // Sequential Step Navigation
  const goToStep = (step: 1 | 2 | 3 | 4) => {
    setCurrentStep(step);
    setMaxReachedStep((prev) => (step > prev ? step : prev) as 1 | 2 | 3 | 4);
  };

  // Step 1: Handle Google Sign In in sequence
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        setGoogleUser(user);
        const resolvedName = user.displayName || 'Independent Analyst';
        const resolvedEmail = user.email || '';
        setFullName(resolvedName);
        setEmail(resolvedEmail);
        setIdentityVerified(true);

        if (loginTrack === 'solo_professional') {
          const assertion = resolveIndividualRoleAssertion(resolvedEmail, resolvedName);
          setRole('ADMIN_CFO');
          setUnlockedRoles({ ADMIN_CFO: true, SENIOR_ANALYST: true, AUDITOR: true, STAKEHOLDER: true });
          setOrganization(assertion.practiceName);
          setClearanceSuccess(`Google Workspace Identity Verified: Unrestricted Master Clearance (Zero RBAC Restrictions)`);
        } else {
          setClearanceSuccess(`Identity Verified: ${resolvedName} (${resolvedEmail})`);
        }
        // Automatically advance to Step 2 in sequence
        goToStep(2);
      }
    } catch (error: any) {
      if (
        error?.code !== 'auth/popup-closed-by-user' &&
        error?.code !== 'auth/cancelled-popup-request' &&
        !error?.message?.includes('popup-closed-by-user')
      ) {
        console.error('Google Sign In failed:', error);
        setAuthError(error?.message || 'Google sign-in could not be completed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Step 1: Handle Credentials in sequence
  const handleContinueFromStep1 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setAuthError(
        loginTrack === 'solo_professional'
          ? 'Please enter your professional email address to verify identity.'
          : 'Please enter your corporate email address to verify identity.'
      );
      return;
    }
    setAuthError(null);
    setIdentityVerified(true);

    if (loginTrack === 'solo_professional') {
      setRole('ADMIN_CFO');
      setUnlockedRoles({ ADMIN_CFO: true, SENIOR_ANALYST: true, AUDITOR: true, STAKEHOLDER: true });
      setClearanceSuccess(`Identity Verified: Unrestricted Master Clearance Unlocked (Zero RBAC Restrictions)`);
    }
    // Advance to Step 2 in sequence
    goToStep(2);
  };

  // Step 4: Final Launch
  const handleFinishOnboarding = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const isSolo = workspaceType === 'SOLO_ANALYST';
      const authUser: AuthUser = {
        id: googleUser?.uid || `usr_${Date.now().toString(36)}`,
        name: fullName || googleUser?.displayName || (isSolo ? 'Solo Analyst' : 'User'),
        email: email || googleUser?.email || (isSolo ? 'analyst@fininsight.ai' : 'cfo@fininsight.ai'),
        role: isSolo ? 'ADMIN_CFO' : role,
        organization: organization || (isSolo ? 'Independent Valuation & Research Practice' : 'Enterprise Financial Group'),
        avatar: googleUser?.photoURL || undefined,
        signedInAt: new Date().toISOString(),
        workspaceType: workspaceType,
        department: isSolo 
          ? 'Independent Practice (Full Analytical Clearance)'
          : (directoryProfile.department || 'Corporate Finance'),
        employeeId: isSolo 
          ? (individualProfile.employeeId || 'SOLO-MASTER-01') 
          : (directoryProfile.employeeId || 'EMP-VC-001'),
        clearanceSource: isSolo 
          ? (googleUser ? 'Google Workspace OIDC (Master Clearance • Zero RBAC)' : 'Independent Practitioner Clearance (Unrestricted • Zero RBAC)')
          : (directoryProfile.matched ? directoryProfile.idpProvider : 'Corporate Department Token (Verified)'),
        isRoleVerified: true,
      };
      onCompleteAuth(authUser, {
        currency,
        fiscalYear,
        dataMasking: enableDataMasking,
        erp: isSolo ? 'sec_direct' : preferredErp,
      });
    }, 600);
  };

  return (
    <div className={`${isEmbedded ? 'w-full py-2' : 'min-h-screen'} bg-[#09090b] text-[#fafafa] flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200`}>
      
      {/* Top Header (Only if not embedded) */}
      {!isEmbedded && (
        <header className="px-4 sm:px-8 py-4 border-b border-[#27272a] bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg italic text-white shadow-md shadow-indigo-900/40">
              F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">FinInsight AI</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  SIGN IN TO APP
                </span>
              </div>
              <p className="text-[11px] text-[#71717a] hidden sm:block">
                Dedicated Enterprise Authentication & Clearance Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onLaunchDemo}
              className="px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a] hover:border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">3-D Demo</span>
              <span className="sm:hidden">Demo</span>
            </button>

            <button
              onClick={onBackToLanding}
              className="px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#71717a] hover:text-white border border-[#27272a] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 max-w-5xl w-full mx-auto px-2 sm:px-6 lg:px-8 ${isEmbedded ? 'py-4' : 'py-8 sm:py-12'}`}>
        
        {/* Step Progress Tracker */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="flex flex-col items-center group cursor-pointer focus:outline-none"
              title="Step 1: Identity Verification & Authentication"
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                currentStep === 1 
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-900/40' 
                  : identityVerified || maxReachedStep > 1 
                  ? 'bg-emerald-600 text-white group-hover:bg-emerald-500' 
                  : 'bg-[#18181b] text-[#71717a] border border-[#27272a]'
              }`}>
                {identityVerified || maxReachedStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className={`text-[11px] font-semibold mt-2 ${currentStep >= 1 ? 'text-white' : 'text-[#71717a]'}`}>
                1. Identity
              </span>
            </button>

            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${maxReachedStep > 1 ? 'bg-emerald-500' : 'bg-[#27272a]'}`} />

            {/* Step 2 */}
            <button
              type="button"
              disabled={maxReachedStep < 2 && !identityVerified}
              onClick={() => { if (maxReachedStep >= 2 || identityVerified) goToStep(2); }}
              className={`flex flex-col items-center group focus:outline-none ${maxReachedStep >= 2 || identityVerified ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              title="Step 2: Role Permissions & Governance"
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                currentStep === 2 
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-900/40' 
                  : maxReachedStep > 2 
                  ? 'bg-emerald-600 text-white group-hover:bg-emerald-500' 
                  : 'bg-[#18181b] text-[#71717a] border border-[#27272a]'
              }`}>
                {maxReachedStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className={`text-[11px] font-semibold mt-2 ${currentStep >= 2 ? 'text-white' : 'text-[#71717a]'}`}>
                2. Workspace
              </span>
            </button>

            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${maxReachedStep > 2 ? 'bg-emerald-500' : 'bg-[#27272a]'}`} />

            {/* Step 3 */}
            <button
              type="button"
              disabled={maxReachedStep < 3}
              onClick={() => { if (maxReachedStep >= 3) goToStep(3); }}
              className={`flex flex-col items-center group focus:outline-none ${maxReachedStep >= 3 ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              title="Step 3: Confidentiality & ERP Connectors"
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                currentStep === 3 
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-900/40' 
                  : maxReachedStep > 3 
                  ? 'bg-emerald-600 text-white group-hover:bg-emerald-500' 
                  : 'bg-[#18181b] text-[#71717a] border border-[#27272a]'
              }`}>
                {maxReachedStep > 3 ? <Check className="w-4 h-4" /> : '3'}
              </div>
              <span className={`text-[11px] font-semibold mt-2 ${currentStep >= 3 ? 'text-white' : 'text-[#71717a]'}`}>
                3. Security & ERP
              </span>
            </button>

            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${maxReachedStep > 3 ? 'bg-emerald-500' : 'bg-[#27272a]'}`} />

            {/* Step 4 */}
            <button
              type="button"
              disabled={maxReachedStep < 4}
              onClick={() => { if (maxReachedStep >= 4) goToStep(4); }}
              className={`flex flex-col items-center group focus:outline-none ${maxReachedStep >= 4 ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              title="Step 4: Clearance Review & Launch"
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                currentStep === 4 
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-900/40' 
                  : 'bg-[#18181b] text-[#71717a] border border-[#27272a]'
              }`}>
                4
              </div>
              <span className={`text-[11px] font-semibold mt-2 ${currentStep === 4 ? 'text-white' : 'text-[#71717a]'}`}>
                4. Launch
              </span>
            </button>

          </div>
        </div>

        {/* Wizard Form Card */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 sm:p-10 shadow-2xl">
          
          {/* STEP 1: AUTHENTICATION */}
          {currentStep === 1 && (
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Step 1 of 4 • Identity Verification & Gateway</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Sign In to FinInsight AI
                </h2>
                <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1">
                  Choose your gateway: authenticate via your dedicated company Microsoft Entra SSO for automated job-role access, or sign in as an independent analyst.
                </p>
              </div>

              {/* Login Gateway Selector Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 rounded-xl bg-[#09090b] border border-[#27272a] mb-6">
                <button
                  type="button"
                  id="tab-login-enterprise"
                  onClick={() => {
                    setLoginTrack('enterprise_sso');
                    setWorkspaceType('ENTERPRISE');
                  }}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    loginTrack === 'enterprise_sso'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40 ring-1 ring-indigo-400/40'
                      : 'text-[#a1a1aa] hover:text-white hover:bg-[#18181b]'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-indigo-200 shrink-0" />
                  <span className="truncate">Dedicated Company Login (Microsoft Entra SSO)</span>
                </button>

                <button
                  type="button"
                  id="tab-login-solo"
                  onClick={() => {
                    setLoginTrack('solo_professional');
                    setWorkspaceType('SOLO_ANALYST');
                  }}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    loginTrack === 'solo_professional'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 ring-1 ring-emerald-400/40'
                      : 'text-[#a1a1aa] hover:text-white hover:bg-[#18181b]'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-200 shrink-0" />
                  <span className="truncate">Individual / Solo Professional</span>
                </button>
              </div>

              {/* Error Banner */}
              {authError && (
                <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Clearances Success Banner */}
              {clearanceSuccess && (
                <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{clearanceSuccess}</span>
                </div>
              )}

              {/* Already Verified Banner if returning to Step 1 */}
              {identityVerified && (
                <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Identity Verified: <strong>{fullName}</strong> ({email})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Proceed to Step 2</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* TRACK 1: DEDICATED COMPANY LOGIN (MICROSOFT ENTRA ID & AUTOMATED JOB-ROLES) */}
              {loginTrack === 'enterprise_sso' && (
                <div className="space-y-5">
                  {/* Verified Company Tenant Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-[#18181b] to-indigo-950/20 border border-indigo-500/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27272a]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-900/40 shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">
                              {matchedTenant ? matchedTenant.name : 'Enterprise Corporate Gateway'}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              MICROSOFT ENTRA VERIFIED
                            </span>
                          </div>
                          <p className="text-[11px] text-[#a1a1aa] font-mono">
                            Domain: <strong className="text-indigo-300">@{userDomain}</strong> • Tenant: {matchedTenant?.tenantSlug || 'vancecapital'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsCompanySetupModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-[#09090b] hover:bg-[#27272a] border border-indigo-500/40 text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-sm"
                      >
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Set Up New Company Tenant</span>
                      </button>
                    </div>

                    {/* Email Input Field with Home Realm Discovery */}
                    <div>
                      <label htmlFor="enterprise-work-email" className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                        Work Email Address (Microsoft 365 Account)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#71717a] absolute left-3.5 top-3" />
                        <input
                          id="enterprise-work-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. cfo@vancecapital.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-[#27272a] focus:border-indigo-500 rounded-xl text-sm font-mono text-white focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Automated Job-Role Directory Assertion Card */}
                    <div className="p-3.5 rounded-xl bg-[#09090b] border border-indigo-500/25 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs font-bold text-white">Automated Job-Role Directory Assertion</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                          ZERO MANUAL SELECTION
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-[#71717a] block">Asserted Identity:</span>
                          <strong className="text-white">{directoryProfile.name}</strong> ({directoryProfile.email})
                        </div>
                        <div>
                          <span className="text-[#71717a] block">Auto-Allocated Job Role:</span>
                          <strong className="text-emerald-400">{directoryProfile.roleTitle}</strong>
                        </div>
                        <div>
                          <span className="text-[#71717a] block">Department / Unit:</span>
                          <span className="text-white">{directoryProfile.department}</span>
                        </div>
                        <div>
                          <span className="text-[#71717a] block">Directory Policy Rule:</span>
                          <span className="text-indigo-300 font-mono text-[10px]">{directoryProfile.matchRule}</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-[#71717a] pt-1.5 border-t border-[#27272a]">
                        🔒 <strong>Zero Misrepresentation:</strong> In-app mode switching is disabled. When you log in with Microsoft Entra, your operational accessibility is permanently locked to <strong className="text-white">{directoryProfile.roleTitle}</strong>.
                      </p>
                    </div>

                    {/* Enterprise SSO Login Button */}
                    <div className="space-y-2 pt-1">
                      <div>
                        {/* Primary Enterprise SSO Login Button */}
                        <button
                          type="button"
                          id="btn-enterprise-sso-login"
                          onClick={() => {
                            setOauthProviderTarget('microsoft_entra');
                            setIsOAuthModalOpen(true);
                          }}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-indigo-950/50 cursor-pointer"
                          title="Trigger OAuth flow with common corporate identity providers like Okta or Azure AD"
                        >
                          <Key className="w-4 h-4 shrink-0 text-white" />
                          <span>Enterprise SSO Login</span>
                          <ArrowRight className="w-4 h-4 ml-0.5" />
                        </button>
                      </div>

                      {/* Okta and OIDC protocol footer trigger */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 text-[11px] text-[#71717a]">
                        <span>OAuth 2.0 / OIDC supported: Microsoft Entra, Okta, PingFederate</span>
                        <button
                          type="button"
                          id="btn-trigger-okta-oauth"
                          onClick={() => {
                            setOauthProviderTarget('okta');
                            setIsOAuthModalOpen(true);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer self-start sm:self-auto"
                        >
                          Trigger Okta OAuth Flow →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick One-Click Test Accounts for Evaluators */}
                  <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#a1a1aa] uppercase tracking-wider text-[10px]">
                        Test Dedicated Corporate Accounts (Auto Job-Role Allocation):
                      </span>
                      <span className="text-[10px] font-mono text-indigo-400">1-Click Auto-Fill</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {DEMO_ENTERPRISE_ACCOUNTS.map((acc) => (
                        <div
                          key={acc.email}
                          className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                            email === acc.email
                              ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-400 text-white'
                              : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white">{acc.name}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                                {acc.expectedRole}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-indigo-300 mt-0.5 truncate block">{acc.email}</span>
                            <p className="text-[10px] text-[#71717a] mt-1">{acc.roleDisplayName}</p>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-[#27272a] flex items-center justify-between gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSelectDemoAccount(acc)}
                              className="text-[10px] text-[#a1a1aa] hover:text-white underline cursor-pointer"
                            >
                              Step-by-Step →
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInstantLaunchEnterprise(acc)}
                              className="px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs shadow-indigo-950/40"
                            >
                              <span>1-Click Launch</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TRACK 2: INDIVIDUAL / SOLO PROFESSIONAL LOGIN */}
              {loginTrack === 'solo_professional' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#18181b] to-emerald-950/20 border border-emerald-500/30 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27272a]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-900/40 shrink-0">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">Independent Professional Gateway</h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              ZERO RBAC RESTRICTIONS
                            </span>
                          </div>
                          <p className="text-[11px] text-[#a1a1aa]">
                            For independent valuation consultants, equity research analysts, advisors, and fractional executives
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded bg-[#09090b] self-start sm:self-auto shrink-0">
                        Full Master Access
                      </span>
                    </div>

                    {/* Email Input Field */}
                    <div>
                      <label htmlFor="individual-work-email" className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                        Professional Work Email (Independent Account)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-emerald-500/70 absolute left-3.5 top-3" />
                        <input
                          id="individual-work-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. elena@rostovapartners.com or liam@equityresearch.io"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-emerald-500/30 focus:border-emerald-400 rounded-xl text-sm font-mono text-white focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Unrestricted Independent Practice Architecture Card */}
                    <div className="p-3.5 rounded-xl bg-[#09090b] border border-emerald-500/25 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs font-bold text-white">Unrestricted Independent Practice Architecture</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          MASTER CLEARANCE • NO RBAC
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-[#71717a] block">Asserted Identity:</span>
                          <strong className="text-white">{fullName !== 'User' ? fullName : 'Independent Practitioner'}</strong> ({email})
                        </div>
                        <div>
                          <span className="text-[#71717a] block">Access Architecture:</span>
                          <strong className="text-emerald-400">Master Clearance (Zero RBAC Locks)</strong>
                        </div>
                        <div>
                          <span className="text-[#71717a] block">Core Analytical Modules:</span>
                          <span className="text-white">All 10 Valuation & Forensic Engines Unlocked</span>
                        </div>
                        <div>
                          <span className="text-[#71717a] block">Operating Authorization:</span>
                          <span className="text-emerald-300 font-mono text-[10px] truncate block">Autonomous Signing & Reporting Authority</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-[#71717a] pt-1.5 border-t border-[#27272a]">
                        🔒 <strong>Zero RBAC Restrictions:</strong> Independent practitioners are provisioned with complete analytical, modeling, forensic, and report generation authority without corporate role segregation or clearance barriers.
                      </p>

                      {/* Corporate Domain Detection Callout */}
                      {individualProfile.isDomainRecognized && individualProfile.corporateTenantMatched && (
                        <div className="mt-2 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-2 text-xs">
                          <span className="text-indigo-300 text-[11px]">
                            🏢 <strong>Corporate Tenant Detected:</strong> This email domain belongs to <strong>{individualProfile.corporateTenantMatched.name}</strong>.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setLoginTrack('enterprise_sso');
                              setWorkspaceType('ENTERPRISE');
                            }}
                            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] shrink-0 cursor-pointer"
                          >
                            Switch to Corporate SSO →
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Individual SSO / OAuth & Google Sign-In Action Buttons */}
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Individual SSO Login Button */}
                        <button
                          type="button"
                          id="btn-individual-sso-login"
                          onClick={() => {
                            setOauthProviderTarget('microsoft_entra');
                            setIsOAuthModalOpen(true);
                          }}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
                          title="Trigger OAuth flow for individual practitioners (Microsoft Entra, Google, Okta) with zero RBAC"
                        >
                          <Key className="w-4 h-4 shrink-0 text-white" />
                          <span>Individual SSO Login (Full Access)</span>
                          <ArrowRight className="w-4 h-4 ml-0.5" />
                        </button>

                        {/* Direct Google Workspace Sign-In */}
                        <button
                          type="button"
                          id="btn-signin-google-solo"
                          disabled={isGoogleLoading}
                          onClick={handleGoogleSignIn}
                          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer"
                        >
                          {isGoogleLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                              <span>Authenticating with Google...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                              </svg>
                              <span>Google Workspace OIDC</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 text-[11px] text-[#71717a]">
                        <span>Identity providers: Google Workspace, Microsoft 365 / Entra, Okta</span>
                        <button
                          type="button"
                          id="btn-trigger-solo-okta"
                          onClick={() => {
                            setOauthProviderTarget('okta');
                            setIsOAuthModalOpen(true);
                          }}
                          className="text-emerald-400 hover:text-emerald-300 font-medium underline cursor-pointer self-start sm:self-auto"
                        >
                          Trigger Okta SSO Flow →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick One-Click Demo Profiles for Individual Practitioners */}
                  <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#a1a1aa] uppercase tracking-wider text-[10px]">
                        Test Independent Professional Profiles (Zero RBAC Locks):
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">1-Click Auto-Fill</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {DEMO_INDIVIDUAL_ACCOUNTS.map((acc) => (
                        <div
                          key={acc.email}
                          className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                            email === acc.email
                              ? 'bg-emerald-600/20 border-emerald-500 ring-1 ring-emerald-400 text-white'
                              : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white">{acc.name}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                                FULL ACCESS
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-emerald-300 mt-0.5 truncate block">{acc.email}</span>
                            <span className="text-[10px] text-[#a1a1aa] block mt-0.5 truncate">{acc.practiceName}</span>
                            <p className="text-[10px] text-[#71717a] mt-1">{acc.specialization} • Zero RBAC</p>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-[#27272a] flex items-center justify-between gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSelectDemoIndividualAccount(acc)}
                              className="text-[10px] text-[#a1a1aa] hover:text-white underline cursor-pointer"
                            >
                              Configure Setup →
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInstantLaunchSolo(acc)}
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs shadow-emerald-950/40"
                            >
                              <span>1-Click Launch</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: WORKSPACE OPERATING MODEL & ROLE */}
          {currentStep === 2 && (
            <div>
              {workspaceType === 'SOLO_ANALYST' ? (
                /* INDIVIDUAL / SOLO PROFESSIONAL VIEW - ZERO RBAC */
                <div>
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Step 2 of 4 • Independent Practice Configuration</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">
                      Configure Your Independent Valuation Practice
                    </h2>
                    <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1">
                      Identity verified: <strong className="text-white">{fullName}</strong> ({email}). Operating with <strong className="text-emerald-400">Full Master Clearance</strong> — Role-Based Access Control (RBAC) restrictions are removed for independent professionals.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Solo Professional Status & Master Clearance Banner */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-[#18181b] to-emerald-950/20 border border-emerald-500/35 space-y-4 shadow-lg shadow-emerald-950/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27272a]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-black font-bold shadow-md shrink-0">
                            <UserCheck className="w-5 h-5 text-black" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white">Independent Practice Operating Model</h3>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                ZERO RBAC RESTRICTIONS • MASTER CLEARANCE
                              </span>
                            </div>
                            <p className="text-[11px] text-[#a1a1aa]">
                              Zero corporate approval holds • All 10 analytical engines and forensic scanners fully unlocked
                            </p>
                          </div>
                        </div>
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-xs shrink-0 self-start sm:self-auto">
                          ✓
                        </span>
                      </div>

                      {/* Practice Name Input */}
                      <div>
                        <label htmlFor="onboarding-practice-name" className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                          Practice / Advisory Firm Name
                        </label>
                        <div className="relative">
                          <Briefcase className="w-4 h-4 text-emerald-500/70 absolute left-3.5 top-3" />
                          <input
                            id="onboarding-practice-name"
                            name="organization"
                            type="text"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            placeholder="e.g. Apex Equity Research Partners or Rostova Capital Advisory"
                            className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-emerald-500/30 focus:border-emerald-400 rounded-xl text-sm text-white focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      {/* Primary Advisory / Valuation Specialization Focus (Non-restrictive) */}
                      <div className="space-y-2.5 pt-2">
                        <div className="flex items-center justify-between pb-0.5">
                          <label className="block text-xs font-bold text-white uppercase tracking-wider">
                            Primary Advisory & Valuation Focus:
                          </label>
                          <span className="text-[10px] font-mono text-emerald-400">
                            Customizes Reports • Zero RBAC Locks
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            {
                              id: 'Comprehensive Valuation & M&A',
                              title: 'Comprehensive Valuation & M&A Advisory',
                              desc: 'DCF modeling, intrinsic valuation, multiples analysis & transaction dossiers.',
                            },
                            {
                              id: 'Equity Research & Quantitative Modeling',
                              title: 'Equity Research & Quantitative Modeling',
                              desc: 'DuPont 5-step return on equity, WACC calibration & sensitivity planning.',
                            },
                            {
                              id: 'Forensic Audit & Internal Controls',
                              title: 'Forensic Audit & Internal Controls Assurance',
                              desc: "Benford's Law anomaly scan, audit trails, journal testing & ratio analysis.",
                            },
                            {
                              id: 'Private Wealth & Strategic Advisory',
                              title: 'Private Wealth & Strategic Advisory',
                              desc: 'Executive summaries, portfolio tracking, and strategic asset health briefs.',
                            },
                          ].map((item) => {
                            const isSelected = practiceFocus === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setPracticeFocus(item.id)}
                                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-600/20 border-emerald-500 ring-1 ring-emerald-400 text-white'
                                    : 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-white">{item.title}</span>
                                    {isSelected && (
                                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-[9px]">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#71717a] mt-0.5 leading-relaxed">{item.desc}</p>
                                </div>
                                <div className="mt-2 pt-1.5 border-t border-[#27272a]/60 text-[10px] font-mono text-emerald-400">
                                  <span>All 10 Modules 100% Unlocked</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Unrestricted Master Capabilities Matrix */}
                      <div className="pt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Master Clearance Modules (No Role Gatekeeping):
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            100% PLATFORM UNLOCKED
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          <div className="p-3 rounded-xl bg-[#09090b]/80 border border-emerald-500/20 flex items-start gap-2.5 text-[#d4d4d8]">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-white block text-[11px]">Unrestricted Valuation Models</strong>
                              <span className="text-[11px] text-[#a1a1aa]">DCF models, terminal value, enterprise value, and sensitivity matrix unlocked.</span>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-[#09090b]/80 border border-emerald-500/20 flex items-start gap-2.5 text-[#d4d4d8]">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-white block text-[11px]">DuPont & WACC Engines</strong>
                              <span className="text-[11px] text-[#a1a1aa]">DuPont 5-step decomposition, cost of equity, debt & weighted capital cost calculator.</span>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-[#09090b]/80 border border-emerald-500/20 flex items-start gap-2.5 text-[#d4d4d8]">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-white block text-[11px]">Forensic Benford Anomaly Detection</strong>
                              <span className="text-[11px] text-[#a1a1aa]">First & second digit variance scan with complete cryptographic audit trails.</span>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-[#09090b]/80 border border-emerald-500/20 flex items-start gap-2.5 text-[#d4d4d8]">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-white block text-[11px]">Direct Filing Ingestion & Export</strong>
                              <span className="text-[11px] text-[#a1a1aa]">SEC EDGAR 10-K/10-Q sync, balance sheet parsing & institutional dossier exports.</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Subtle Switch Option */}
                      <div className="pt-2 border-t border-[#27272a] flex items-center justify-between text-[11px] text-[#71717a]">
                        <span>Need corporate team governance with strict RBAC segregation instead?</span>
                        <button
                          type="button"
                          onClick={() => {
                            setWorkspaceType('ENTERPRISE');
                            setOrganization('Vance Capital Holdings');
                          }}
                          className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                        >
                          Switch to Corporate Enterprise Team →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* CORPORATE ENTERPRISE VIEW */
                <div>
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Step 2 of 4 • Corporate Job-Role Verification</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">
                      Corporate Enterprise Governance & Directory Clearance
                    </h2>
                    <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1">
                      Identity verified: <strong className="text-white">{fullName}</strong> ({email}). Operating under corporate governance with assigned job-role clearance.
                    </p>

                    {/* Governance Policy Notice */}
                    <div className="mt-3.5 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-start gap-2.5">
                      <Lock className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-[#d4d4d8] leading-relaxed">
                        <strong className="text-white">Institutional Governance:</strong> Operating mode is established upon authentication. To preserve SOX-404 duty segregation, <strong className="text-indigo-300">in-app mode switching between models is disabled</strong>. Corporate users are granted accessibility strictly based on their job role.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Enterprise Workspace Inputs */}
                    <div className="p-4 rounded-xl bg-indigo-950/10 border border-indigo-500/25 space-y-4">
                      {/* Organization name */}
                      <div>
                        <label htmlFor="onboarding-org-name" className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
                          Enterprise / Company Name
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-indigo-400/70 absolute left-3.5 top-3" />
                          <input
                            id="onboarding-org-name"
                            name="organization"
                            autoComplete="organization"
                            type="text"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            placeholder="e.g. Vance Capital Holdings"
                            className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-indigo-500/30 focus:border-indigo-400 rounded-xl text-sm text-white focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      {/* Enterprise Role Verification & Directory Resolution */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-[#27272a]">
                          <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-wider">
                              Corporate Job Role Verification & Clearance
                            </label>
                            <p className="text-[11px] text-[#a1a1aa]">
                              Domain: <strong className="text-indigo-300 font-mono">{userDomain}</strong> • Enterprise Directory Resolution
                            </p>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold self-start sm:self-auto">
                            SOX-404 Anti-Tamper Guard
                          </span>
                        </div>

                        {/* 1. Directory Match Banner (If IdP Directory Matches) */}
                        {directoryProfile.matched ? (
                          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/35 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="text-xs font-bold text-white">
                                  Authoritative Enterprise Directory Assertion
                                </span>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                MATCHED • {directoryProfile.employeeId}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                              <div className="text-[#a1a1aa]">
                                Department: <strong className="text-white">{directoryProfile.department}</strong>
                              </div>
                              <div className="text-[#a1a1aa]">
                                IdP Source: <strong className="text-indigo-300">{directoryProfile.idpProvider}</strong>
                              </div>
                            </div>

                            <p className="text-[11px] text-emerald-300/90 pt-1 leading-relaxed border-t border-emerald-500/20">
                              ✓ Your corporate identity was verified against the enterprise directory. Operational accessibility is automatically locked to <strong>{USER_ROLES[directoryProfile.assignedRole].displayName}</strong> to ensure you cannot be assigned the wrong role.
                            </p>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                                <span className="text-xs font-bold text-white">
                                  Unverified Executive Clearance (Least Privilege Principle)
                                </span>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                LEAST PRIVILEGE
                              </span>
                            </div>
                            <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                              To ensure corporate users do not brief or falsely claim unauthorized roles, executive clearances (CFO, Auditor) cannot be self-selected without an <strong>Enterprise Security Clearance Token</strong> or pre-registered directory record.
                            </p>
                          </div>
                        )}

                        {/* 2. Department Clearance Token Input / Authorization */}
                        <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                              <Key className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Enterprise Department Clearance Token</span>
                            </label>
                            <span className="text-[10px] font-mono text-[#71717a]">Optional for Stakeholder</span>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              type="text"
                              value={clearanceCodeInput}
                              onChange={(e) => setClearanceCodeInput(e.target.value)}
                              placeholder="Enter clearance token e.g. CFO-AUTH-2026"
                              className="flex-1 px-3 py-2 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded-lg text-xs font-mono text-white focus:outline-none uppercase"
                            />
                            <button
                              type="button"
                              onClick={() => handleVerifyClearanceCode()}
                              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                            >
                              Verify Token
                            </button>
                          </div>

                          {/* Quick Simulation Tokens */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px]">
                            <span className="text-[#71717a]">Test Corporate Tokens:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setClearanceCodeInput('CFO-AUTH-2026');
                                handleVerifyClearanceCode('CFO-AUTH-2026');
                              }}
                              className="px-2 py-0.5 rounded bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46] text-indigo-300 font-mono cursor-pointer"
                            >
                              CFO-AUTH-2026
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setClearanceCodeInput('SOX-AUDIT-404');
                                handleVerifyClearanceCode('SOX-AUDIT-404');
                              }}
                              className="px-2 py-0.5 rounded bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46] text-amber-300 font-mono cursor-pointer"
                            >
                              SOX-AUDIT-404
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setClearanceCodeInput('FIN-CTRL-88');
                                handleVerifyClearanceCode('FIN-CTRL-88');
                              }}
                              className="px-2 py-0.5 rounded bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46] text-emerald-300 font-mono cursor-pointer"
                            >
                              FIN-CTRL-88
                            </button>
                          </div>

                          {clearanceSuccess && (
                            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                              <span>{clearanceSuccess}</span>
                            </div>
                          )}

                          {clearanceError && (
                            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                              <span>{clearanceError}</span>
                            </div>
                          )}
                        </div>

                        {/* 3. Verified Job Role Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(USER_ROLES).map(([key, config]) => {
                            const userRoleKey = key as UserRole;
                            const isDirectoryMatched = directoryProfile.matched && directoryProfile.assignedRole === userRoleKey;
                            const isAuthorized = isDirectoryMatched || unlockedRoles[userRoleKey];
                            const isSelected = role === userRoleKey;

                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  if (isAuthorized) {
                                    setRole(userRoleKey);
                                    setClearanceError(null);
                                  } else {
                                    setClearanceError(`Unauthorized: ${config.displayName} requires directory verification or clearance token (${userRoleKey === 'ADMIN_CFO' ? 'CFO-AUTH-2026' : 'SOX-AUDIT-404'}). Self-assignment is blocked.`);
                                  }
                                }}
                                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between relative group ${
                                  isSelected
                                    ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-400 text-white'
                                    : isAuthorized
                                    ? 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46] cursor-pointer'
                                    : 'bg-[#09090b]/60 border-[#27272a]/60 text-[#71717a] opacity-65 cursor-not-allowed'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                      <span>{config.displayName}</span>
                                      {isDirectoryMatched && (
                                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" title="Directory Verified" />
                                      )}
                                    </h4>
                                    {isSelected ? (
                                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                                        ✓
                                      </span>
                                    ) : isAuthorized ? (
                                      <span className="text-[10px] font-mono text-emerald-400">Verified</span>
                                    ) : (
                                      <span className="text-[10px] font-mono text-amber-500 flex items-center gap-0.5">
                                        <Lock className="w-2.5 h-2.5" />
                                        Token Req.
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#71717a] mt-1 leading-relaxed">
                                    {config.description}
                                  </p>
                                </div>

                                <div className="mt-2.5 pt-2 border-t border-[#27272a]/60 flex items-center justify-between text-[10px] font-mono">
                                  <span className={isAuthorized ? 'text-indigo-300' : 'text-[#71717a]'}>
                                    {isDirectoryMatched ? 'Directory Verified' : isAuthorized ? 'Token Verified' : 'Locked'}
                                  </span>
                                  <span className="text-[#71717a]">
                                    {key === 'ADMIN_CFO' ? 'Full Authority' : key === 'AUDITOR' ? 'SOX Compliance' : key === 'STAKEHOLDER' ? 'Least Privilege' : 'Specialized'}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <p className="text-[11px] text-amber-300/80 mt-2 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Corporate accessibility is strictly bound to your verified job role. Mode switching between Solo and Enterprise models is disabled.</span>
                        </p>
                      </div>

                      {/* Switch link */}
                      <div className="pt-2 border-t border-[#27272a] flex items-center justify-between text-[11px] text-[#71717a]">
                        <span>Operating as an independent analyst instead?</span>
                        <button
                          type="button"
                          onClick={() => {
                            setWorkspaceType('SOLO_ANALYST');
                            setOrganization('Apex Research Partners');
                          }}
                          className="text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
                        >
                          Switch to Independent Solo Practice →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                {/* 3. Base Currency & Fiscal Year selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Default Reporting Currency</span>
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                      className="w-full px-3 py-2.5 bg-[#09090b] border border-[#27272a] focus:border-indigo-500 rounded-xl text-sm text-white focus:outline-none cursor-pointer"
                    >
                      {Object.entries(CURRENCIES).map(([code, c]) => (
                        <option key={code} value={code}>
                          {c.symbol} {code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Fiscal Calendar Basis</span>
                    </label>
                    <select
                      value={fiscalYear}
                      onChange={(e) => setFiscalYear(e.target.value as FiscalYearType)}
                      className="w-full px-3 py-2.5 bg-[#09090b] border border-[#27272a] focus:border-indigo-500 rounded-xl text-sm text-white focus:outline-none cursor-pointer"
                    >
                      {Object.entries(FISCAL_YEAR_TYPES).map(([type, c]) => (
                        <option key={type} value={type}>
                          {c.label} ({c.startMonth} - {c.endMonth})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-[#27272a] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="text-xs text-[#71717a] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Step 1: Identity</span>
                </button>

                <button
                  type="button"
                  id="btn-step2-continue"
                  onClick={() => goToStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-900/30 cursor-pointer"
                >
                  <span>Continue to Step 3: Security & Integrations</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SECURITY & ERP GOVERNANCE */}
          {currentStep === 3 && (
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Step 3 of 4 • Confidentiality & ERP Connectors</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Configure Encryption & General Ledger Connectors
                </h2>
                <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1">
                  Ensure compliance with corporate confidentiality rules for material non-public data.
                </p>
              </div>

              <div className="space-y-6">
                
                {/* Security Toggles */}
                <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span>Client-Side AES-256 Value Masking by Default</span>
                      </h4>
                      <p className="text-xs text-[#71717a] mt-0.5">
                        Automatically masks exact numeric line items on startup (toggled on/off via header icon).
                      </p>
                    </div>
                    <label htmlFor="checkbox-enable-masking" className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="checkbox-enable-masking"
                        name="enableDataMasking"
                        type="checkbox"
                        checked={enableDataMasking}
                        onChange={(e) => setEnableDataMasking(e.target.checked)}
                        className="sr-only peer"
                        aria-label="Enable Default Data Masking"
                      />
                      <div className="w-11 h-6 bg-[#27272a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="pt-3 border-t border-[#27272a] flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-indigo-400" />
                        <span>Cryptographic Immutable Audit Logging</span>
                      </h4>
                      <p className="text-xs text-[#71717a] mt-0.5">
                        Record every file upload, footnote search, and export to the append-only audit trail.
                      </p>
                    </div>
                    <label htmlFor="checkbox-enable-audit" className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="checkbox-enable-audit"
                        name="enableAuditLogging"
                        type="checkbox"
                        checked={enableAuditLogging}
                        onChange={(e) => setEnableAuditLogging(e.target.checked)}
                        className="sr-only peer"
                        aria-label="Enable Cryptographic Immutable Audit Logging"
                      />
                      <div className="w-11 h-6 bg-[#27272a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                {/* Primary ERP Integration Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-2">
                    Primary General Ledger Integration Target
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setPreferredErp('netsuite')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        preferredErp === 'netsuite'
                          ? 'bg-indigo-600/15 border-indigo-500 text-white font-bold'
                          : 'bg-[#09090b] border-[#27272a] text-[#71717a] hover:text-white'
                      }`}
                    >
                      <p className="text-xs">Oracle NetSuite</p>
                      <span className="text-[10px] text-emerald-400 font-mono">REST API Ready</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreferredErp('sap')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        preferredErp === 'sap'
                          ? 'bg-indigo-600/15 border-indigo-500 text-white font-bold'
                          : 'bg-[#09090b] border-[#27272a] text-[#71717a] hover:text-white'
                      }`}
                    >
                      <p className="text-xs">SAP S/4HANA</p>
                      <span className="text-[10px] text-emerald-400 font-mono">OData Ready</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreferredErp('qbo')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        preferredErp === 'qbo'
                          ? 'bg-indigo-600/15 border-indigo-500 text-white font-bold'
                          : 'bg-[#09090b] border-[#27272a] text-[#71717a] hover:text-white'
                      }`}
                    >
                      <p className="text-xs">QuickBooks Online</p>
                      <span className="text-[10px] text-indigo-400 font-mono">OAuth 2.0</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreferredErp('sec_direct')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        preferredErp === 'sec_direct'
                          ? 'bg-indigo-600/15 border-indigo-500 text-white font-bold'
                          : 'bg-[#09090b] border-[#27272a] text-[#71717a] hover:text-white'
                      }`}
                    >
                      <p className="text-xs">Direct SEC 10-K</p>
                      <span className="text-[10px] text-cyan-400 font-mono">EDGAR XBRL</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-[#27272a] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="text-xs text-[#71717a] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Step 2: Role & Org</span>
                </button>

                <button
                  type="button"
                  id="btn-step3-continue"
                  onClick={() => goToStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-900/30 cursor-pointer"
                >
                  <span>Continue to Step 4: Clearance Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & LAUNCH WORKSPACE */}
          {currentStep === 4 && (
            <div>
              <div className="mb-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Step 4 of 4 • Enterprise Clearance Review
                </h2>
                <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1">
                  All 4 identity and governance steps verified in sequence. Review your configuration before entering the financial workspace.
                </p>
              </div>

              {/* Sequential 4-Step Review Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 max-w-4xl mx-auto">
                {/* Step 1 Review */}
                <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">Step 1 • Identity</span>
                      <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className="text-[10px] text-[#71717a] hover:text-white underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-sm font-bold text-white truncate">{fullName}</p>
                    <p className="text-xs text-[#a1a1aa] truncate mt-0.5">{email}</p>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-mono w-fit">
                    <Check className="w-3 h-3" />
                    <span>{googleUser ? 'Google Workspace OIDC' : loginTrack === 'solo_professional' ? 'Professional SSO / Credentials' : 'Corporate Microsoft Entra'}</span>
                  </div>
                </div>

                {/* Step 2 Review */}
                <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">Step 2 • Workspace & Role</span>
                      <button
                        type="button"
                        onClick={() => goToStep(2)}
                        className="text-[10px] text-[#71717a] hover:text-white underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-sm font-bold text-white truncate">
                      {workspaceType === 'SOLO_ANALYST' ? 'Independent Valuation Practitioner' : (USER_ROLES[role]?.displayName || role)}
                    </p>
                    <p className="text-xs text-[#a1a1aa] truncate mt-0.5">
                      {organization} • {workspaceType === 'SOLO_ANALYST' ? `${practiceFocus} (Zero RBAC)` : 'Corporate Enterprise'}
                    </p>
                    {workspaceType === 'SOLO_ANALYST' ? (
                      <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3 shrink-0" />
                        <span>Master Clearance: Full Unrestricted Access (No RBAC)</span>
                      </div>
                    ) : (
                      <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3 shrink-0" />
                        <span>Clearance: {directoryProfile.matched ? `Directory [${directoryProfile.employeeId}]` : 'Clearance Token Verified'}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-[#71717a] font-mono mt-3">
                    Currency: <span className="text-white">{currency}</span> • Fiscal: <span className="text-white">{fiscalYear}</span>
                  </p>
                </div>

                {/* Step 3 Review */}
                <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">Step 3 • Security & ERP</span>
                      <button
                        type="button"
                        onClick={() => goToStep(3)}
                        className="text-[10px] text-[#71717a] hover:text-white underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-sm font-bold text-white uppercase truncate">
                      {preferredErp === 'netsuite' ? 'NetSuite SuiteTalk' : preferredErp === 'sap' ? 'SAP S/4HANA' : preferredErp === 'qbo' ? 'QuickBooks Sync' : 'SEC EDGAR XBRL'}
                    </p>
                  </div>
                  <div className="mt-3 space-y-0.5 text-[10px] font-mono text-[#a1a1aa]">
                    <p>AES-256 Masking: <span className={enableDataMasking ? 'text-emerald-400 font-bold' : 'text-[#71717a]'}>{enableDataMasking ? 'Enabled' : 'Off'}</span></p>
                    <p>Audit Logging: <span className={enableAuditLogging ? 'text-emerald-400 font-bold' : 'text-[#71717a]'}>{enableAuditLogging ? 'Enforced' : 'Off'}</span></p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="text-xs text-[#71717a] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Step 3: Security & ERP</span>
                </button>

                <button
                  id="btn-complete-onboarding-launch"
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinishOnboarding}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-900/40 transition-all cursor-pointer hover:scale-105 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Provisioning Secure Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {workspaceType === 'SOLO_ANALYST'
                          ? 'Launch Solo Professional Workspace'
                          : 'Launch Enterprise Corporate Workspace'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-[11px] text-[#71717a] mt-4 font-mono">
                {workspaceType === 'SOLO_ANALYST'
                  ? 'SESSION KEY GENERATED: SHA-256 • UNRESTRICTED MASTER CLEARANCE'
                  : 'SESSION KEY GENERATED: SHA-256 • SOX-404 AUDIT LOG ENFORCED'}
              </p>
            </div>
          )}

        </div>

      </main>

      {/* Enterprise Company Setup Modal (Tenant Provisioning) */}
      <EnterpriseCompanySetupModal
        isOpen={isCompanySetupModalOpen}
        onClose={() => setIsCompanySetupModalOpen(false)}
        onTenantCreated={handleTenantCreated}
      />

      {/* Enterprise SSO OAuth Modal (Okta / Azure AD Flow) */}
      <EnterpriseOAuthModal
        isOpen={isOAuthModalOpen}
        onClose={() => setIsOAuthModalOpen(false)}
        onSsoSuccess={handleOAuthSuccess}
        initialProvider={oauthProviderTarget}
        contextMode={loginTrack === 'solo_professional' ? 'individual' : 'enterprise'}
        defaultEmail={email}
        defaultPracticeName={organization}
      />

    </div>
  );
};
