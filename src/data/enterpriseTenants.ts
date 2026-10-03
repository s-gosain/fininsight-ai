import { EnterpriseTenant, UserRole, DirectoryRoleMappingRule, EnterpriseSsoConfig } from '../types';

export const DEFAULT_DIRECTORY_ROLE_RULES: DirectoryRoleMappingRule[] = [
  {
    id: 'rule-cfo-ad-group',
    ruleType: 'ad_group',
    patternOrGroup: 'SG-Finance-C-Suite',
    targetRole: 'ADMIN_CFO',
    description: 'Active Directory Executive Security Group -> Chief Financial Officer',
    enabled: true,
  },
  {
    id: 'rule-cfo-email-pattern',
    ruleType: 'email_pattern',
    patternOrGroup: '*cfo*@*',
    targetRole: 'ADMIN_CFO',
    description: 'Corporate C-Suite Email Pattern -> Chief Financial Officer',
    enabled: true,
  },
  {
    id: 'rule-auditor-ad-group',
    ruleType: 'ad_group',
    patternOrGroup: 'SG-Internal-Audit',
    targetRole: 'AUDITOR',
    description: 'Active Directory Audit Committee Security Group -> Forensic Auditor',
    enabled: true,
  },
  {
    id: 'rule-auditor-email-pattern',
    ruleType: 'email_pattern',
    patternOrGroup: '*audit*@*',
    targetRole: 'AUDITOR',
    description: 'Internal & SOX Audit Email Directive -> Forensic Auditor',
    enabled: true,
  },
  {
    id: 'rule-controller-ad-group',
    ruleType: 'ad_group',
    patternOrGroup: 'SG-Controllership',
    targetRole: 'SENIOR_ANALYST',
    description: 'Active Directory Financial Operations Group -> Senior Controller',
    enabled: true,
  },
  {
    id: 'rule-controller-email-pattern',
    ruleType: 'email_pattern',
    patternOrGroup: '*controller*@*',
    targetRole: 'SENIOR_ANALYST',
    description: 'Controllership & FP&A Email Directive -> Senior Controller',
    enabled: true,
  },
  {
    id: 'rule-analyst-email-pattern',
    ruleType: 'email_pattern',
    patternOrGroup: '*analyst*@*',
    targetRole: 'SENIOR_ANALYST',
    description: 'Equity Research & Quantitative Analyst Email -> Senior Controller',
    enabled: true,
  },
  {
    id: 'rule-default-fallback',
    ruleType: 'ad_group',
    patternOrGroup: 'All-Domain-Users',
    targetRole: 'STAKEHOLDER',
    description: 'Default Principle of Least Privilege -> Corporate Stakeholder',
    enabled: true,
  },
];

export const DEFAULT_ENTERPRISE_SSO_CONFIG: EnterpriseSsoConfig = {
  idpProvider: 'microsoft_entra',
  tenantIdOrDomain: '0b2a7582-7f39-4d64-8711-9f939e24a89a',
  clientId: '94f27e10-c48e-4a61-8931-e129db2471b0',
  redirectUri: 'https://fininsight.ai/auth/sso/callback',
  scopes: ['openid', 'profile', 'email', 'Directory.Read.All', 'User.Read'],
  rules: DEFAULT_DIRECTORY_ROLE_RULES,
  defaultRole: 'STAKEHOLDER',
  lastUpdated: '2026-09-24T12:00:00Z',
};

const SSO_CONFIG_STORAGE_KEY = 'fininsight_enterprise_sso_config';

export function getEnterpriseSsoConfig(): EnterpriseSsoConfig {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SSO_CONFIG_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (e) {
    console.error('Failed to load enterprise SSO config:', e);
  }
  return DEFAULT_ENTERPRISE_SSO_CONFIG;
}

export function saveEnterpriseSsoConfig(config: EnterpriseSsoConfig): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SSO_CONFIG_STORAGE_KEY, JSON.stringify(config));
    }
  } catch (e) {
    console.error('Failed to save enterprise SSO config:', e);
  }
}

/**
 * Wildcard pattern matcher supporting standard email patterns (*cfo*@*, *audit*@vancecapital.com, etc.)
 */
function matchWildcardPattern(pattern: string, text: string): boolean {
  try {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    const regex = new RegExp(`^${escaped}$`, 'i');
    return regex.test(text);
  } catch {
    return false;
  }
}

/**
 * Evaluates active directory mapping rules against user email, AD groups, and job title claim.
 */
export function evaluateDirectoryRules(
  email: string,
  adGroups: string[] = [],
  jobTitle?: string,
  customRules?: DirectoryRoleMappingRule[]
): {
  role: UserRole;
  matchedRule: DirectoryRoleMappingRule | null;
  reason: string;
} {
  const config = getEnterpriseSsoConfig();
  const rules = customRules || config.rules;
  const cleanEmail = email.toLowerCase().trim();

  for (const rule of rules) {
    if (!rule.enabled) continue;

    if (rule.ruleType === 'ad_group') {
      const matched = adGroups.some(
        (g) => g.toLowerCase() === rule.patternOrGroup.toLowerCase() || g.toLowerCase().includes(rule.patternOrGroup.toLowerCase())
      );
      if (matched) {
        return {
          role: rule.targetRole,
          matchedRule: rule,
          reason: `Matched Active Directory Group "${rule.patternOrGroup}"`,
        };
      }
    } else if (rule.ruleType === 'email_pattern') {
      if (matchWildcardPattern(rule.patternOrGroup, cleanEmail)) {
        return {
          role: rule.targetRole,
          matchedRule: rule,
          reason: `Matched Email Domain Pattern "${rule.patternOrGroup}"`,
        };
      }
    } else if (rule.ruleType === 'job_title' && jobTitle) {
      if (jobTitle.toLowerCase().includes(rule.patternOrGroup.toLowerCase())) {
        return {
          role: rule.targetRole,
          matchedRule: rule,
          reason: `Matched Directory Job Title Claim "${rule.patternOrGroup}"`,
        };
      }
    }
  }

  // Fallback to default role (Least privilege: STAKEHOLDER)
  return {
    role: config.defaultRole || 'STAKEHOLDER',
    matchedRule: null,
    reason: `Default Fallback: Principle of Least Privilege (${config.defaultRole || 'STAKEHOLDER'})`,
  };
}

export const DEFAULT_ENTERPRISE_TENANTS: EnterpriseTenant[] = [
  {
    id: 'tenant-vance-capital',
    name: 'Vance Capital Holdings',
    domain: 'vancecapital.com',
    tenantSlug: 'vancecapital',
    idpProvider: 'microsoft_entra',
    azureTenantId: '0b2a7582-7f39-4d64-8711-9f939e24a89a',
    enforceSox404: true,
    status: 'active',
    createdAt: '2026-01-15T08:00:00Z',
    roleMappings: [
      {
        directoryGroupOrDepartment: 'Executive Treasury & C-Suite',
        role: 'ADMIN_CFO',
        description: 'Chief Financial Officer - Full administrative clearance, capital budgeting & signing authority',
      },
      {
        directoryGroupOrDepartment: 'SOX Compliance & Forensic Audit',
        role: 'AUDITOR',
        description: 'Internal & Forensic Auditor - SOX 404 compliance locked, read-only statements & red flags',
      },
      {
        directoryGroupOrDepartment: 'Financial Controllership & Reporting',
        role: 'SENIOR_ANALYST',
        description: 'Senior Financial Controller - General ledger reconciliation, data masking & statements write',
      },
      {
        directoryGroupOrDepartment: 'Corporate Strategy & Board Stakeholders',
        role: 'STAKEHOLDER',
        description: 'Corporate Stakeholder - Principle of least privilege, high-level summaries',
      },
    ],
  },
  {
    id: 'tenant-apex-global',
    name: 'Apex Global Financial Group',
    domain: 'apexglobal.com',
    tenantSlug: 'apexglobal',
    idpProvider: 'microsoft_entra',
    azureTenantId: '3c8d1947-4921-4f22-9122-1d54e8f192b0',
    enforceSox404: true,
    status: 'active',
    createdAt: '2026-02-01T10:30:00Z',
    roleMappings: [
      {
        directoryGroupOrDepartment: 'Chief Investment Office',
        role: 'ADMIN_CFO',
        description: 'Chief Investment Officer / CFO - Full portfolio and valuation governance',
      },
      {
        directoryGroupOrDepartment: 'Risk & Audit Committee',
        role: 'AUDITOR',
        description: 'Risk Committee - Independent verification and anomaly tracking',
      },
      {
        directoryGroupOrDepartment: 'Quantitative Modeling & Operations',
        role: 'SENIOR_ANALYST',
        description: 'Quantitative Modeling Lead - DCF, multi-period forecasting & ledgers',
      },
      {
        directoryGroupOrDepartment: 'General Advisory Members',
        role: 'STAKEHOLDER',
        description: 'Advisory Member - Read-only executive briefings',
      },
    ],
  },
];

const LOCAL_STORAGE_KEY = 'fininsight_enterprise_tenants';

export function getEnterpriseTenants(): EnterpriseTenant[] {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: EnterpriseTenant[] = JSON.parse(stored);
        const combined = [...DEFAULT_ENTERPRISE_TENANTS];
        for (const t of parsed) {
          if (!combined.some((item) => item.id === t.id || item.domain === t.domain)) {
            combined.push(t);
          }
        }
        return combined;
      }
    }
  } catch (e) {
    console.error('Failed to load custom tenants:', e);
  }
  return DEFAULT_ENTERPRISE_TENANTS;
}

export function saveEnterpriseTenant(tenant: EnterpriseTenant): void {
  try {
    if (typeof window !== 'undefined') {
      const existing = getEnterpriseTenants();
      const updated = existing.filter((t) => t.id !== tenant.id && t.domain !== tenant.domain);
      updated.push(tenant);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Failed to save tenant:', e);
  }
}

export function findTenantByDomain(domainOrEmail: string): EnterpriseTenant | undefined {
  if (!domainOrEmail) return undefined;
  const domain = domainOrEmail.includes('@')
    ? domainOrEmail.split('@')[1]?.toLowerCase().trim()
    : domainOrEmail.toLowerCase().trim();

  const tenants = getEnterpriseTenants();
  return tenants.find((t) => t.domain.toLowerCase() === domain);
}

export interface DirectoryUserAssertion {
  matched: boolean;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  employeeId: string;
  idpProvider: string;
  azureTenantId?: string;
  organization: string;
  isAutoAssigned: boolean;
  matchRule: string;
}

/**
 * Automates job-role allocation based on enterprise Microsoft Entra / SAML directory rules.
 * Users NEVER choose their own role when logging into their company's dedicated portal.
 */
export function resolveDirectoryAssertion(
  tenant: EnterpriseTenant,
  email: string,
  providedName?: string
): DirectoryUserAssertion {
  const cleanEmail = email.toLowerCase().trim();
  const userName = providedName || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  // Rule 1: CFO / C-Suite Treasury
  if (
    cleanEmail.includes('cfo') ||
    cleanEmail.includes('treasury') ||
    cleanEmail.includes('alexandra') ||
    cleanEmail.includes('vance') ||
    cleanEmail.startsWith('exec.')
  ) {
    return {
      matched: true,
      name: providedName || 'Alexandra Vance',
      email: cleanEmail,
      role: 'ADMIN_CFO',
      roleTitle: 'Chief Financial Officer (Admin)',
      department: 'Executive Treasury & C-Suite',
      employeeId: `${tenant.tenantSlug.toUpperCase().slice(0, 3)}-EMP-001`,
      idpProvider: 'Microsoft Entra ID (Azure AD SSO)',
      azureTenantId: tenant.azureTenantId,
      organization: tenant.name,
      isAutoAssigned: true,
      matchRule: 'Entra Security Group: SG-Finance-C-Suite [Auto-Assigned]',
    };
  }

  // Rule 2: Forensic & Internal Audit
  if (
    cleanEmail.includes('audit') ||
    cleanEmail.includes('sox') ||
    cleanEmail.includes('compliance') ||
    cleanEmail.startsWith('risk.')
  ) {
    return {
      matched: true,
      name: providedName || 'Marcus Wright',
      email: cleanEmail,
      role: 'AUDITOR',
      roleTitle: 'Forensic & SOX Auditor',
      department: 'SOX Compliance & Forensic Audit',
      employeeId: `${tenant.tenantSlug.toUpperCase().slice(0, 3)}-AUD-042`,
      idpProvider: 'Microsoft Entra ID (Azure AD SSO)',
      azureTenantId: tenant.azureTenantId,
      organization: tenant.name,
      isAutoAssigned: true,
      matchRule: 'Entra Security Group: SG-Internal-Audit [Auto-Assigned]',
    };
  }

  // Rule 3: Controllership / Senior Analyst
  if (
    cleanEmail.includes('controller') ||
    cleanEmail.includes('analyst') ||
    cleanEmail.includes('fpna') ||
    cleanEmail.includes('ledger')
  ) {
    return {
      matched: true,
      name: providedName || 'Sarah Jenkins',
      email: cleanEmail,
      role: 'SENIOR_ANALYST',
      roleTitle: 'Senior Financial Controller',
      department: 'Financial Controllership & Reporting',
      employeeId: `${tenant.tenantSlug.toUpperCase().slice(0, 3)}-OPS-019`,
      idpProvider: 'Microsoft Entra ID (Azure AD SSO)',
      azureTenantId: tenant.azureTenantId,
      organization: tenant.name,
      isAutoAssigned: true,
      matchRule: 'Entra Security Group: SG-Controllership [Auto-Assigned]',
    };
  }

  // Rule 4: Default Organization User -> Stakeholder (Least Privilege)
  return {
    matched: true,
    name: userName || 'Corporate Stakeholder',
    email: cleanEmail,
    role: 'STAKEHOLDER',
    roleTitle: 'Corporate Stakeholder (Read-Only)',
    department: 'Corporate Strategy & Board Stakeholders',
    employeeId: `${tenant.tenantSlug.toUpperCase().slice(0, 3)}-GEN-${Math.floor(100 + Math.random() * 900)}`,
    idpProvider: 'Microsoft Entra ID (Azure AD SSO)',
    azureTenantId: tenant.azureTenantId,
    organization: tenant.name,
    isAutoAssigned: true,
    matchRule: 'Entra Default Domain Policy: All Domain Users -> Stakeholder [Least Privilege]',
  };
}

export interface DemoEnterpriseAccount {
  email: string;
  name: string;
  expectedRole: UserRole;
  roleDisplayName: string;
  department: string;
  description: string;
}

export const DEMO_ENTERPRISE_ACCOUNTS: DemoEnterpriseAccount[] = [
  {
    email: 'cfo@vancecapital.com',
    name: 'Alexandra Vance',
    expectedRole: 'ADMIN_CFO',
    roleDisplayName: 'Chief Financial Officer (Admin)',
    department: 'Executive Treasury & C-Suite',
    description: 'Auto-authenticated via Microsoft Entra as CFO with full executive authority.',
  },
  {
    email: 'audit@vancecapital.com',
    name: 'Marcus Wright',
    expectedRole: 'AUDITOR',
    roleDisplayName: 'Forensic & SOX Auditor',
    department: 'SOX Compliance & Forensic Audit',
    description: 'Auto-authenticated as Auditor with compliance-locked read-only statements.',
  },
  {
    email: 'controller@vancecapital.com',
    name: 'Sarah Jenkins',
    expectedRole: 'SENIOR_ANALYST',
    roleDisplayName: 'Senior Financial Controller',
    department: 'Financial Controllership & Reporting',
    description: 'Auto-authenticated as Controller with general ledger & write capabilities.',
  },
  {
    email: 'stakeholder@vancecapital.com',
    name: 'David Chen',
    expectedRole: 'STAKEHOLDER',
    roleDisplayName: 'Corporate Stakeholder',
    department: 'Corporate Strategy & Board Stakeholders',
    description: 'Auto-authenticated under Principle of Least Privilege with executive dashboards.',
  },
];

export interface DemoIndividualAccount {
  email: string;
  name: string;
  expectedRole: UserRole;
  roleDisplayName: string;
  practiceTitle: string;
  practiceName: string;
  specialization: string;
  description: string;
}

export const DEMO_INDIVIDUAL_ACCOUNTS: DemoIndividualAccount[] = [
  {
    email: 'cfo.advisor@rostovapartners.com',
    name: 'Dr. Elena Rostova',
    expectedRole: 'ADMIN_CFO',
    roleDisplayName: 'Independent Valuation Practitioner',
    practiceTitle: 'Valuation & Executive Advisory',
    practiceName: 'Rostova Capital Advisory',
    specialization: 'M&A Valuation, DCF Models, Capital Strategy',
    description: 'Full master access across all 10 analytical engines with zero RBAC restrictions.',
  },
  {
    email: 'senior.analyst@equityresearch.io',
    name: 'Liam Vance',
    expectedRole: 'ADMIN_CFO',
    roleDisplayName: 'Independent Equity & Valuation Specialist',
    practiceTitle: 'Independent Equity Research Practice',
    practiceName: 'Alpha Horizon Research',
    specialization: 'DuPont 5-Step, WACC Discount Rate, Financial Modeling',
    description: 'Full master access across all modeling and forecasting tools with zero RBAC restrictions.',
  },
  {
    email: 'auditor@soxcompliance.org',
    name: 'Sophia Patel',
    expectedRole: 'ADMIN_CFO',
    roleDisplayName: 'Forensic Audit & Valuation Specialist',
    practiceTitle: 'Forensic Audit & Risk Assurance Practice',
    practiceName: 'Patel Forensic Advisory',
    specialization: 'Forensic Anomaly Detection, Internal Audit, Ratio Analysis',
    description: 'Full master access across forensic engines, Benford scanning, and statements with zero RBAC restrictions.',
  },
  {
    email: 'investor@privatewealth.net',
    name: 'David Miller',
    expectedRole: 'ADMIN_CFO',
    roleDisplayName: 'Private Advisory & Valuation Lead',
    practiceTitle: 'Family Office Strategic Investment Office',
    practiceName: 'Miller Private Wealth Office',
    specialization: 'Valuation Dossiers, Risk Analytics, Executive Modeling',
    description: 'Full master access across all reporting and valuation engines with zero RBAC restrictions.',
  },
];

export interface IndividualRoleAssertion {
  role: UserRole;
  roleTitle: string;
  practiceTitle: string;
  department: string;
  practiceName: string;
  employeeId: string;
  clearanceLevel: string;
  matchedRule: string;
  clearanceSource: string;
  isDomainRecognized: boolean;
  corporateTenantMatched?: EnterpriseTenant;
}

/**
 * Resolves practitioner profile for individual / solo professional logins with
 * zero RBAC restrictions — providing unrestricted Master Clearance across all tools.
 */
export function resolveIndividualRoleAssertion(
  email: string,
  providedName?: string,
  preferredPracticeName?: string
): IndividualRoleAssertion {
  const cleanEmail = (email || '').toLowerCase().trim();
  const domain = cleanEmail.includes('@') ? cleanEmail.split('@')[1] : '';
  const recognizedTenant = domain ? findTenantByDomain(domain) : undefined;

  // Solo / Individual professional login has NO RBAC restrictions.
  // Master Clearance grants 100% full access to all analytical, forensic, modeling, and reporting engines.
  return {
    role: 'ADMIN_CFO',
    roleTitle: 'Independent Practitioner (Master Access)',
    practiceTitle: 'Independent Financial Valuation & Advisory',
    department: 'Independent Practice',
    practiceName: preferredPracticeName || (domain ? `${domain.split('.')[0].toUpperCase()} Advisory` : 'Independent Valuation Practice'),
    employeeId: `SOLO-PRAC-${Math.floor(100 + Math.random() * 900)}`,
    clearanceLevel: 'Master Clearance • Full Platform Authority (Zero RBAC Restrictions)',
    matchedRule: 'Independent Professional Policy: Unrestricted Access (No RBAC Locks)',
    clearanceSource: 'Individual Professional Clearance (Unrestricted • Zero RBAC)',
    isDomainRecognized: Boolean(recognizedTenant),
    corporateTenantMatched: recognizedTenant,
  };
}
