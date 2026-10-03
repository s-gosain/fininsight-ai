import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { AuditLog } from '../types';
import { Activity, ShieldAlert, Sparkles, TrendingUp, Users, BarChart2, LineChart } from 'lucide-react';

interface AuditActivityChartProps {
  logs: AuditLog[];
  selectedDate?: string | null;
  onSelectDate?: (dateKey: string | null) => void;
}

interface ActivityBucket {
  dateKey: string;
  displayDate: string;
  total: number;
  security: number;
  system: number;
  sampleActions: string[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: ActivityBucket;
    color: string;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div className="bg-[#121214]/95 backdrop-blur-md border border-[#27272a] p-2.5 rounded-xl shadow-xl text-xs space-y-2 max-w-xs z-50">
      <div className="flex items-center justify-between border-b border-[#27272a] pb-1.5">
        <span className="font-semibold text-white font-mono">{data.displayDate}</span>
        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
          {data.total} {data.total === 1 ? 'event' : 'events'}
        </span>
      </div>

      <div className="space-y-1 font-mono text-[11px]">
        <div className="flex items-center justify-between text-amber-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Security & Access:
          </span>
          <span className="font-semibold">{data.security}</span>
        </div>
        <div className="flex items-center justify-between text-indigo-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            System Operations:
          </span>
          <span className="font-semibold">{data.system}</span>
        </div>
      </div>

      {data.sampleActions.length > 0 && (
        <div className="pt-1.5 border-t border-[#27272a] text-[10px] text-[#a1a1aa] space-y-0.5">
          <span className="text-[#71717a] block">Key Events:</span>
          {data.sampleActions.map((act, idx) => (
            <div key={idx} className="truncate">• {act}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AuditActivityChart: React.FC<AuditActivityChartProps> = ({
  logs,
  selectedDate,
  onSelectDate,
}) => {
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  const chartData = useMemo<ActivityBucket[]>(() => {
    if (!logs || logs.length === 0) return [];

    const dateMap = new Map<string, ActivityBucket>();

    // Sort chronologically
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    sortedLogs.forEach((log) => {
      const dateObj = new Date(log.timestamp);
      const dateKey = dateObj.toISOString().split('T')[0];
      const displayDate = dateObj.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          dateKey,
          displayDate,
          total: 0,
          security: 0,
          system: 0,
          sampleActions: [],
        });
      }

      const item = dateMap.get(dateKey)!;
      item.total += 1;
      if (log.category === 'Security') {
        item.security += 1;
      } else {
        item.system += 1;
      }
      if (item.sampleActions.length < 3 && !item.sampleActions.includes(log.action)) {
        item.sampleActions.push(log.action);
      }
    });

    return Array.from(dateMap.values());
  }, [logs]);

  // Aggregate metrics
  const totalEvents = logs.length;
  const securityCount = useMemo(() => logs.filter((l) => l.category === 'Security').length, [logs]);
  const securityPct = totalEvents > 0 ? Math.round((securityCount / totalEvents) * 100) : 0;
  
  const peak = useMemo(() => {
    if (chartData.length === 0) return null;
    return [...chartData].sort((a, b) => b.total - a.total)[0];
  }, [chartData]);

  const uniqueActors = useMemo(() => new Set(logs.map((l) => l.user)).size, [logs]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#0f0f12] border border-[#27272a] rounded-xl p-3.5 space-y-3">
      {/* Metrics Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#27272a]/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-xs flex items-center gap-1.5">
              <span>System & Security Log Frequency</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#27272a] text-[#a1a1aa] font-mono">
                {chartData.length} active {chartData.length === 1 ? 'day' : 'days'}
              </span>
            </h4>
          </div>
        </div>

        {/* Quick KPI badges & Chart Style Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-2 py-1 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center gap-1.5 text-[11px] font-mono">
            <TrendingUp className="w-3 h-3 text-indigo-400" />
            <span className="text-[#71717a]">Total:</span>
            <span className="font-semibold text-white">{totalEvents}</span>
          </div>

          <div className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5 text-[11px] font-mono text-amber-300">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span className="text-amber-400/80">Security:</span>
            <span className="font-semibold">{securityCount} ({securityPct}%)</span>
          </div>

          {peak && (
            <div className="px-2 py-1 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center gap-1.5 text-[11px] font-mono text-[#a1a1aa]">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="text-[#71717a]">Peak:</span>
              <span className="text-white font-medium">{peak.displayDate} ({peak.total})</span>
            </div>
          )}

          <div className="px-2 py-1 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center gap-1.5 text-[11px] font-mono text-[#a1a1aa]">
            <Users className="w-3 h-3 text-cyan-400" />
            <span className="text-[#71717a]">Actors:</span>
            <span className="text-white font-medium">{uniqueActors}</span>
          </div>

          {/* Toggle between Bar Chart and Area Chart */}
          <div className="flex items-center bg-[#18181b] border border-[#27272a] rounded-lg p-0.5">
            <button
              onClick={() => setChartType('bar')}
              className={`p-1 rounded text-[10px] flex items-center gap-1 font-mono transition-colors ${
                chartType === 'bar'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
              title="Recharts Bar Chart View"
            >
              <BarChart2 className="w-3 h-3" />
              <span className="hidden sm:inline">Bars</span>
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`p-1 rounded text-[10px] flex items-center gap-1 font-mono transition-colors ${
                chartType === 'area'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
              title="Area Chart View"
            >
              <LineChart className="w-3 h-3" />
              <span className="hidden sm:inline">Area</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart / Area Chart Container with strict min-h and [min-height:0] */}
      <div 
        className="w-full h-[150px] min-h-[150px] relative [min-height:0]"
        style={{ minHeight: 0 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
              onClick={(state: any) => {
                if (onSelectDate && state?.activePayload?.[0]?.payload?.dateKey) {
                  const clickedKey = state.activePayload[0].payload.dateKey;
                  onSelectDate(selectedDate === clickedKey ? null : clickedKey);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
              />
              <YAxis
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Stacked Bars: System operations on bottom, security events on top */}
              <Bar
                dataKey="system"
                name="System Operations"
                stackId="a"
                fill="#6366f1"
                radius={[0, 0, 2, 2]}
              />
              <Bar
                dataKey="security"
                name="Security & Access"
                stackId="a"
                fill="#f59e0b"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          ) : (
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
              onClick={(state: any) => {
                if (onSelectDate && state?.activePayload?.[0]?.payload?.dateKey) {
                  const clickedKey = state.activePayload[0].payload.dateKey;
                  onSelectDate(selectedDate === clickedKey ? null : clickedKey);
                }
              }}
            >
              <defs>
                <linearGradient id="auditSystemGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="auditSecurityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
              />
              <YAxis
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="system"
                name="System Operations"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#auditSystemGradient)"
                activeDot={{ r: 4, fill: '#818cf8', stroke: '#18181b', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="security"
                name="Security & Access"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#auditSecurityGradient)"
                activeDot={{ r: 4, fill: '#fbbf24', stroke: '#18181b', strokeWidth: 2 }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend & Date Filter Indicator */}
      <div className="flex items-center justify-between text-[11px] text-[#71717a] font-mono pt-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#6366f1]" />
            <span className="text-[#a1a1aa]">System Operations (Analysis, ERP, Export, Collab)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />
            <span className="text-amber-400">Security Events (Keys, Seals, Access)</span>
          </span>
        </div>

        {selectedDate && (
          <button
            onClick={() => onSelectDate && onSelectDate(null)}
            className="text-xs text-indigo-400 hover:text-white underline cursor-pointer"
          >
            Clear Date Filter ({selectedDate})
          </button>
        )}
      </div>
    </div>
  );
};
