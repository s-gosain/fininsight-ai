import { UserRole, UserRolePermissions, NavigationTabId } from '../types';

export const TAB_TITLES: Record<NavigationTabId, string> = {
  dashboard: 'Financial Health Dashboard',
  visualization: 'Data Visualizer',
  competitors: 'Competitor Analysis',
  anomalies: 'Forensic Anomaly Detection',
  benchmarks: 'Peer Benchmarks',
  forecasting: 'Predictive Forecasting & Monte Carlo',
  redflags: 'Risk Red Flags',
  statements: 'Financial Statements Table',
  sentiment: 'Management Sentiment Analysis',
  budget: 'Budget Discrepancy & Variance Alerts',
};

export const USER_ROLES: Record<UserRole, UserRolePermissions> = {
  ADMIN_CFO: {
    role: 'ADMIN_CFO',
    displayName: 'Chief Financial Officer (Admin)',
    description: 'Full administrative rights, ERP syncing, encryption keys, executive PDF exports, and budget approval authority.',
    allowedTabs: [
      'dashboard',
      'visualization',
      'competitors',
      'anomalies',
      'benchmarks',
      'forecasting',
      'redflags',
      'statements',
      'sentiment',
      'budget',
    ],
    canExportPDF: true,
    canEditData: true,
    canAddComments: true,
    canResolveComments: true,
    canViewAuditLogs: true,
    canSyncERP: true,
    canToggleEncryption: true,
    canUploadDataset: true,
    canRunDeepAI: true,
    canApproveBudget: true,
    canDisputeBudget: true,
    canModifyForecasting: true,
    canManageCloudModels: true,
  },
  SENIOR_ANALYST: {
    role: 'SENIOR_ANALYST',
    displayName: 'Senior Financial Analyst',
    description: 'Can run deep AI models, edit statement models, create annotations, export reports, and trigger ERP sync.',
    allowedTabs: [
      'dashboard',
      'visualization',
      'competitors',
      'anomalies',
      'benchmarks',
      'forecasting',
      'redflags',
      'statements',
      'sentiment',
      'budget',
    ],
    canExportPDF: true,
    canEditData: true,
    canAddComments: true,
    canResolveComments: false,
    canViewAuditLogs: true,
    canSyncERP: true,
    canToggleEncryption: false,
    canUploadDataset: true,
    canRunDeepAI: true,
    canApproveBudget: false,
    canDisputeBudget: true,
    canModifyForecasting: true,
    canManageCloudModels: true,
  },
  AUDITOR: {
    role: 'AUDITOR',
    displayName: 'Internal / External Auditor',
    description: 'Independent review access, compliance verification, read audit trails, annotate red flags, and export audit dossiers.',
    allowedTabs: [
      'dashboard',
      'visualization',
      'competitors',
      'anomalies',
      'benchmarks',
      'redflags',
      'statements',
      'sentiment',
      'budget',
    ],
    canExportPDF: true,
    canEditData: false,
    canAddComments: true,
    canResolveComments: true,
    canViewAuditLogs: true,
    canSyncERP: false,
    canToggleEncryption: false,
    canUploadDataset: false,
    canRunDeepAI: true,
    canApproveBudget: false,
    canDisputeBudget: true,
    canModifyForecasting: false,
    canManageCloudModels: false,
  },
  STAKEHOLDER: {
    role: 'STAKEHOLDER',
    displayName: 'Read-Only Executive / Investor',
    description: 'Executive view only: dashboard KPIs, health summaries, peer benchmarks, and competitor analysis.',
    allowedTabs: [
      'dashboard',
      'competitors',
      'benchmarks',
      'sentiment',
    ],
    canExportPDF: true,
    canEditData: false,
    canAddComments: false,
    canResolveComments: false,
    canViewAuditLogs: false,
    canSyncERP: false,
    canToggleEncryption: false,
    canUploadDataset: false,
    canRunDeepAI: false,
    canApproveBudget: false,
    canDisputeBudget: false,
    canModifyForecasting: false,
    canManageCloudModels: false,
  },
};

export function isTabAllowedForRole(tabId: NavigationTabId, role: UserRole): boolean {
  return USER_ROLES[role]?.allowedTabs.includes(tabId) ?? false;
}

export function getRequiredRolesForTab(tabId: NavigationTabId): UserRole[] {
  return (Object.keys(USER_ROLES) as UserRole[]).filter((role) =>
    USER_ROLES[role].allowedTabs.includes(tabId)
  );
}

export const COMPLIANCE_STANDARDS = [
  {
    code: 'SOX 404',
    title: 'Sarbanes-Oxley Internal Controls',
    status: 'Compliant & Audited',
    description: 'Segregation of duties, automated audit trail for statement modifications, and dual-authorization on budget variances.',
  },
  {
    code: 'GAAP / IFRS',
    title: 'Accounting Standards Convergence',
    status: 'Standardized',
    description: 'Automated revenue recognition rules (ASC 606 / IFRS 15) and multi-currency foreign exchange translation parity.',
  },
  {
    code: 'AES-256 GCM',
    title: 'End-to-End Financial Encryption',
    status: 'Enforced (Hardware FIPS 140-3)',
    description: 'In-transit TLS 1.3 encryption and field-level database encryption for sensitive general ledger balances.',
  },
  {
    code: 'GDPR / CCPA',
    title: 'Data Privacy & PII Protection',
    status: 'Zero Data Retention',
    description: 'Zero data retention for proprietary financial models, data masking for individual stakeholder accounts.',
  },
];

export function maskSensitiveValue(value: string | number, isMasked: boolean): string {
  if (!isMasked) return typeof value === 'number' ? value.toLocaleString() : value;
  return '••••••••';
}
