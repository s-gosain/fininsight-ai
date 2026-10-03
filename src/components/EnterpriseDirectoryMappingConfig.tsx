import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Key,
  Layers,
  Sparkles,
  Sliders,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Play
} from 'lucide-react';
import { UserRole, DirectoryRoleMappingRule, EnterpriseSsoConfig } from '../types';
import { USER_ROLES } from '../utils/encryption';
import {
  getEnterpriseSsoConfig,
  saveEnterpriseSsoConfig,
  evaluateDirectoryRules,
  DEFAULT_DIRECTORY_ROLE_RULES,
} from '../data/enterpriseTenants';

interface EnterpriseDirectoryMappingConfigProps {
  onConfigSaved?: (config: EnterpriseSsoConfig) => void;
}

export const EnterpriseDirectoryMappingConfig: React.FC<EnterpriseDirectoryMappingConfigProps> = ({
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<EnterpriseSsoConfig>(() => getEnterpriseSsoConfig());
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // New Rule Form State
  const [newRuleType, setNewRuleType] = useState<'ad_group' | 'email_pattern' | 'job_title'>('ad_group');
  const [newPattern, setNewPattern] = useState('');
  const [newTargetRole, setNewTargetRole] = useState<UserRole>('ADMIN_CFO');
  const [newDescription, setNewDescription] = useState('');
  const [ruleError, setRuleError] = useState<string | null>(null);

  // Live Simulator State
  const [testEmail, setTestEmail] = useState('alex.cfo@vancecapital.com');
  const [testAdGroup, setTestAdGroup] = useState('SG-Finance-C-Suite');
  const [testJobTitle, setTestJobTitle] = useState('Chief Financial Officer');
  const [testResult, setTestResult] = useState<{
    role: UserRole;
    reason: string;
    matchedRule: DirectoryRoleMappingRule | null;
  } | null>(null);

  const handleSaveConfig = () => {
    saveEnterpriseSsoConfig(config);
    setIsSavedNotice(true);
    if (onConfigSaved) onConfigSaved(config);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    setRuleError(null);

    if (!newPattern.trim()) {
      setRuleError('Please enter an AD Group name, email pattern, or job title.');
      return;
    }

    const newRule: DirectoryRoleMappingRule = {
      id: `rule-${Date.now().toString(36)}`,
      ruleType: newRuleType,
      patternOrGroup: newPattern.trim(),
      targetRole: newTargetRole,
      description: newDescription.trim() || `${newRuleType === 'ad_group' ? 'Active Directory Group' : 'Email Pattern'} -> ${USER_ROLES[newTargetRole].displayName}`,
      enabled: true,
    };

    const updatedRules = [newRule, ...config.rules];
    const updatedConfig = { ...config, rules: updatedRules, lastUpdated: new Date().toISOString() };
    setConfig(updatedConfig);
    saveEnterpriseSsoConfig(updatedConfig);

    setNewPattern('');
    setNewDescription('');
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleToggleRule = (id: string) => {
    const updatedRules = config.rules.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    const updatedConfig = { ...config, rules: updatedRules, lastUpdated: new Date().toISOString() };
    setConfig(updatedConfig);
    saveEnterpriseSsoConfig(updatedConfig);
  };

  const handleDeleteRule = (id: string) => {
    const updatedRules = config.rules.filter((r) => r.id !== id);
    const updatedConfig = { ...config, rules: updatedRules, lastUpdated: new Date().toISOString() };
    setConfig(updatedConfig);
    saveEnterpriseSsoConfig(updatedConfig);
  };

  const handleResetDefaults = () => {
    const updatedConfig = {
      ...config,
      rules: DEFAULT_DIRECTORY_ROLE_RULES,
      lastUpdated: new Date().toISOString(),
    };
    setConfig(updatedConfig);
    saveEnterpriseSsoConfig(updatedConfig);
  };

  const handleRunSimulator = () => {
    const result = evaluateDirectoryRules(
      testEmail,
      [testAdGroup],
      testJobTitle,
      config.rules
    );
    setTestResult(result);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Header & Overview */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-[#18181b] to-indigo-950/20 border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Key className="w-4 h-4 text-indigo-400" />
                <span>Enterprise SSO & Directory Role Mapping Engine</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#a1a1aa] mt-1">
              Define and map corporate email domain patterns and Active Directory groups to specific app roles (CFO, Auditor, Analyst). Permissions are automatically asserted upon employee SSO login.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveConfig}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-md shadow-indigo-900/40"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>

        {isSavedNotice && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Directory mapping rules and SSO configuration successfully saved and persisted!</span>
          </div>
        )}
      </div>

      {/* 2. Identity Provider OAuth Credentials */}
      <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Corporate Identity Provider (IdP) OAuth Settings</span>
          </label>
          <span className="text-[10px] font-mono text-indigo-300">OpenID Connect / SAML 2.0</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-[#71717a] block mb-1">IdP Authority:</label>
            <select
              value={config.idpProvider}
              onChange={(e) => setConfig({ ...config, idpProvider: e.target.value as any })}
              className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded text-xs text-white focus:outline-none"
            >
              <option value="microsoft_entra">Microsoft Entra ID (Azure AD)</option>
              <option value="okta">Okta Identity Cloud</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#71717a] block mb-1">
              {config.idpProvider === 'microsoft_entra' ? 'Azure Tenant GUID:' : 'Okta Domain:'}
            </label>
            <input
              type="text"
              value={config.tenantIdOrDomain}
              onChange={(e) => setConfig({ ...config, tenantIdOrDomain: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#71717a] block mb-1">OAuth Client ID (App ID):</label>
            <input
              type="text"
              value={config.clientId}
              onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded text-xs font-mono text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#27272a] text-[10px] font-mono text-[#a1a1aa]">
          <div>Redirect URI: <span className="text-white">{config.redirectUri}</span></div>
          <div>Scopes: <span className="text-indigo-300">{config.scopes.join(' ')}</span></div>
        </div>
      </div>

      {/* 3. Add New Role Mapping Rule Form */}
      <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add New Automated Role Mapping Rule</span>
          </label>
          <span className="text-[10px] font-mono text-[#71717a]">Evaluated by Priority</span>
        </div>

        {ruleError && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{ruleError}</span>
          </div>
        )}

        <form onSubmit={handleAddRule} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-[#71717a] block mb-1 font-semibold">1. Rule Criterion:</label>
              <select
                value={newRuleType}
                onChange={(e) => setNewRuleType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded text-xs text-white focus:outline-none"
              >
                <option value="ad_group">Active Directory Security Group</option>
                <option value="email_pattern">Email Domain Pattern (*cfo*@*)</option>
                <option value="job_title">Directory Job Title Claim</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#71717a] block mb-1 font-semibold">2. Pattern or Group Name:</label>
              <input
                type="text"
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                placeholder={
                  newRuleType === 'ad_group'
                    ? 'e.g. SG-Finance-Treasury'
                    : newRuleType === 'email_pattern'
                    ? 'e.g. *cfo*@vancecapital.com'
                    : 'e.g. Senior Controller'
                }
                className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#71717a] block mb-1 font-semibold">3. Assign App Role:</label>
              <select
                value={newTargetRole}
                onChange={(e) => setNewTargetRole(e.target.value as UserRole)}
                className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded text-xs text-white focus:outline-none font-semibold"
              >
                <option value="ADMIN_CFO">CFO (Admin Clearance)</option>
                <option value="AUDITOR">Auditor (SOX-404 Compliance)</option>
                <option value="SENIOR_ANALYST">Senior Analyst / Controller</option>
                <option value="STAKEHOLDER">Stakeholder (Least Privilege)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Audit description e.g. Executive Treasury group maps directly to CFO authority"
              className="flex-1 px-3 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded text-xs text-white focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Mapping Rule</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Active Rules List Table */}
      <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active Automated Directory Mapping Rules ({config.rules.length})</span>
          </label>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-[10px] text-[#71717a] hover:text-white underline cursor-pointer"
          >
            Reset Institutional Defaults
          </button>
        </div>

        <div className="space-y-2">
          {config.rules.map((rule, idx) => {
            const roleInfo = USER_ROLES[rule.targetRole];
            return (
              <div
                key={rule.id}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  rule.enabled
                    ? 'bg-[#141418] border-[#27272a]'
                    : 'bg-[#09090b]/50 border-[#27272a]/40 opacity-50'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[10px] font-mono text-[#71717a] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#18181b] border border-[#27272a] text-[#a1a1aa]">
                        {rule.ruleType === 'ad_group'
                          ? 'AD Group'
                          : rule.ruleType === 'email_pattern'
                          ? 'Email Pattern'
                          : 'Job Title'}
                      </span>
                      <strong className="text-xs font-mono text-white break-all">
                        {rule.patternOrGroup}
                      </strong>
                      <span className="text-[#71717a] text-[10px]">➔</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                        {roleInfo?.displayName || rule.targetRole}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#71717a] mt-1">{rule.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleRule(rule.id)}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                      rule.enabled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#18181b] text-[#71717a] border border-[#27272a]'
                    }`}
                  >
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1 rounded text-[#71717a] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Live Rule Simulator & Testing Playground */}
      <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Live Role Assignment Simulator</span>
          </div>
          <span className="text-[10px] font-mono text-indigo-300">Dry-Run Test Engine</span>
        </div>

        <p className="text-[11px] text-[#a1a1aa]">
          Test any hypothetical employee email address and AD group assertion to verify exact role resolution before deploying to production.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <div>
            <label className="text-[10px] text-[#71717a] block mb-1">Test Work Email:</label>
            <input
              type="text"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="e.g. alex.cfo@vancecapital.com"
              className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#71717a] block mb-1">Test AD Security Group:</label>
            <input
              type="text"
              value={testAdGroup}
              onChange={(e) => setTestAdGroup(e.target.value)}
              placeholder="e.g. SG-Finance-C-Suite"
              className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-indigo-500 rounded text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleRunSimulator}
              className="w-full py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulate Role Match</span>
            </button>
          </div>
        </div>

        {testResult && (
          <div className="mt-3 p-3 rounded-xl bg-[#09090b] border border-emerald-500/40 space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Evaluated App Role:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono text-xs border border-emerald-500/30">
                {USER_ROLES[testResult.role].displayName} ({testResult.role})
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/90 font-mono">
              ✓ {testResult.reason}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
