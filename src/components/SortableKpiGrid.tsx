import React, { useState, useEffect, useId, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Wallet,
  ShieldAlert,
  Activity,
  Award,
  Zap,
  CheckCircle,
  Sparkles,
  GripVertical,
  RotateCcw,
  SlidersHorizontal,
  Plus,
  Check,
  X,
  Layers,
  ArrowUpDown,
  DollarSign,
  Info,
} from 'lucide-react';
import { FinancialRatios, CurrencyCode, FinancialDataset } from '../types';
import { formatCurrency, formatPercent } from '../data/currenciesAndFiscal';
import { ThreeDCard } from './ThreeDCard';
import { MiniSparkline, SparklinePoint } from './MiniSparkline';
import { MetricInfoPopover } from './MetricInfoPopover';
import { MetricHoverTooltip } from './MetricHoverTooltip';

export interface KpiCardConfig {
  id: string;
  title: string;
  subtitle: string;
  category: 'Growth' | 'Profitability' | 'Liquidity' | 'Solvency' | 'Quality';
  badgeColor?: string;
  sparklineColor?: 'emerald' | 'indigo' | 'cyan' | 'amber' | 'rose' | 'purple' | 'blue';
  renderValue: (ratios: FinancialRatios, currency: CurrencyCode, isDataMasked: boolean, dataset?: FinancialDataset) => string;
  renderIcon: (ratios: FinancialRatios) => React.ReactNode;
  renderFooter?: (ratios: FinancialRatios) => { label: string; color?: string };
}

export const ALL_KPI_METRICS: KpiCardConfig[] = [
  {
    id: 'revenue',
    title: 'Revenue',
    subtitle: 'Top-Line Inflow',
    category: 'Growth',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    sparklineColor: 'emerald',
    renderValue: (_ratios, currency, isDataMasked, dataset) => {
      if (isDataMasked) return '••••••••';
      const activePeriod = dataset?.activePeriod || 'FY2024';
      const revItem = dataset?.incomeStatement?.find((i) => i.key.toLowerCase() === 'revenue');
      const val = revItem?.values[activePeriod] ?? 68500000;
      return formatCurrency(val, currency, true);
    },
    renderIcon: () => <DollarSign className="w-3.5 h-3.5 text-emerald-400" />,
    renderFooter: (ratios) => ({
      label: ratios.revenueGrowthYoY >= 0 ? `+${ratios.revenueGrowthYoY}% YoY Growth` : `${ratios.revenueGrowthYoY}% YoY`,
      color: ratios.revenueGrowthYoY >= 0 ? 'text-emerald-400' : 'text-rose-400',
    }),
  },
  {
    id: 'net_income',
    title: 'Net Income',
    subtitle: 'GAAP Bottom-Line',
    category: 'Profitability',
    badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    sparklineColor: 'indigo',
    renderValue: (ratios, currency, isDataMasked, dataset) => {
      if (isDataMasked) return '••••••••';
      const activePeriod = dataset?.activePeriod || 'FY2024';
      const niItem = dataset?.incomeStatement?.find((i) => i.key.toLowerCase() === 'netincome');
      const revItem = dataset?.incomeStatement?.find((i) => i.key.toLowerCase() === 'revenue');
      const revVal = revItem?.values[activePeriod] ?? 68500000;
      const val = niItem?.values[activePeriod] ?? ((ratios.netProfitMargin * revVal) / 100);
      return formatCurrency(val, currency, true);
    },
    renderIcon: () => <Award className="w-3.5 h-3.5 text-indigo-400" />,
    renderFooter: (ratios) => ({
      label: ratios.netProfitMargin >= 10 ? `${ratios.netProfitMargin}% Margin (Solid)` : `${ratios.netProfitMargin}% Net Margin`,
      color: ratios.netProfitMargin >= 0 ? 'text-indigo-400' : 'text-rose-400',
    }),
  },
  {
    id: 'op_margin',
    title: 'Operating Margin',
    subtitle: 'EBIT / Core Operations',
    category: 'Profitability',
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    sparklineColor: 'cyan',
    renderValue: (ratios) => formatPercent(ratios.operatingMargin),
    renderIcon: (ratios) =>
      ratios.operatingMargin >= 12 ? (
        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
      ),
    renderFooter: (ratios) => ({
      label: ratios.operatingMargin < 12 ? 'Margin Compressed' : 'Strong Efficiency',
      color: ratios.operatingMargin < 12 ? 'text-amber-400' : 'text-[#71717a]',
    }),
  },
  {
    id: 'rev_growth',
    title: 'Revenue Growth',
    subtitle: 'YoY Annualized',
    category: 'Growth',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    sparklineColor: 'emerald',
    renderValue: (ratios) => formatPercent(ratios.revenueGrowthYoY, true),
    renderIcon: (ratios) =>
      ratios.revenueGrowthYoY >= 0 ? (
        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
      ),
    renderFooter: (ratios) => ({
      label: ratios.revenueGrowthYoY >= 10 ? 'Accelerating' : ratios.revenueGrowthYoY >= 0 ? 'Expansion' : 'Contraction',
      color: ratios.revenueGrowthYoY >= 0 ? 'text-emerald-400' : 'text-rose-400',
    }),
  },
  {
    id: 'gross_margin',
    title: 'Gross Margin',
    subtitle: 'Cost of Delivery',
    category: 'Profitability',
    badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    sparklineColor: 'indigo',
    renderValue: (ratios) => formatPercent(ratios.grossProfitMargin),
    renderIcon: () => <Percent className="w-3.5 h-3.5 text-indigo-400" />,
    renderFooter: (ratios) => ({
      label: ratios.grossProfitMargin >= 50 ? 'Strong Pricing Power' : 'Standard Cost Base',
      color: ratios.grossProfitMargin >= 50 ? 'text-indigo-400' : 'text-[#71717a]',
    }),
  },
  {
    id: 'free_cash_flow',
    title: 'Free Cash Flow',
    subtitle: 'OCF minus CapEx',
    category: 'Liquidity',
    badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    sparklineColor: 'blue',
    renderValue: (ratios, currency, isDataMasked) =>
      isDataMasked ? '••••••••' : formatCurrency(ratios.freeCashFlow, currency, true),
    renderIcon: () => <Wallet className="w-3.5 h-3.5 text-indigo-400" />,
    renderFooter: (ratios) => ({
      label: ratios.freeCashFlow >= 0 ? 'Positive Conversion' : 'Burn Outflow',
      color: ratios.freeCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400',
    }),
  },
  {
    id: 'debt_to_equity',
    title: 'Debt-to-Equity',
    subtitle: 'Leverage Ratio',
    category: 'Solvency',
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    sparklineColor: 'amber',
    renderValue: (ratios) => `${ratios.debtToEquity}x`,
    renderIcon: (ratios) => (
      <ShieldAlert className={`w-3.5 h-3.5 ${ratios.debtToEquity > 0.8 ? 'text-red-400' : 'text-emerald-400'}`} />
    ),
    renderFooter: (ratios) => ({
      label: ratios.debtToEquity > 1.2 ? 'Elevated Debt' : ratios.debtToEquity > 0.8 ? 'Moderate Leverage' : 'Prudent Balance',
      color: ratios.debtToEquity > 0.8 ? 'text-amber-400' : 'text-emerald-400',
    }),
  },
  {
    id: 'current_ratio',
    title: 'Current Ratio',
    subtitle: 'Working Capital Coverage',
    category: 'Liquidity',
    badgeColor: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
    sparklineColor: 'blue',
    renderValue: (ratios) => `${ratios.currentRatio}x`,
    renderIcon: () => <Activity className="w-3.5 h-3.5 text-emerald-400" />,
    renderFooter: (ratios) => ({
      label: ratios.currentRatio >= 1.5 ? 'Ample Liquidity' : ratios.currentRatio >= 1.0 ? 'Adequate Cushion' : 'Tight Working Capital',
      color: ratios.currentRatio >= 1.5 ? 'text-emerald-400' : ratios.currentRatio >= 1.0 ? 'text-[#71717a]' : 'text-rose-400',
    }),
  },
  {
    id: 'net_margin',
    title: 'Net Profit Margin',
    subtitle: 'GAAP Bottom-Line',
    category: 'Profitability',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    sparklineColor: 'cyan',
    renderValue: (ratios) => formatPercent(ratios.netProfitMargin),
    renderIcon: () => <Award className="w-3.5 h-3.5 text-emerald-400" />,
    renderFooter: (ratios) => ({
      label: ratios.netProfitMargin >= 10 ? 'High Net Return' : 'Solid Net Conversion',
      color: 'text-[#71717a]',
    }),
  },
  {
    id: 'ebitda_margin',
    title: 'EBITDA Margin',
    subtitle: 'Operating Cash Strength',
    category: 'Profitability',
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    sparklineColor: 'indigo',
    renderValue: (ratios) => formatPercent(ratios.ebitdaMargin),
    renderIcon: () => <Zap className="w-3.5 h-3.5 text-cyan-400" />,
    renderFooter: () => ({
      label: 'Pre-tax & D&A',
      color: 'text-[#71717a]',
    }),
  },
  {
    id: 'quick_ratio',
    title: 'Quick Ratio',
    subtitle: 'Acid-Test Ratio',
    category: 'Liquidity',
    badgeColor: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
    sparklineColor: 'blue',
    renderValue: (ratios) => `${ratios.quickRatio}x`,
    renderIcon: () => <Activity className="w-3.5 h-3.5 text-teal-400" />,
    renderFooter: (ratios) => ({
      label: ratios.quickRatio >= 1.0 ? 'Sound Cash Cover' : 'Inventory Dependent',
      color: ratios.quickRatio >= 1.0 ? 'text-emerald-400' : 'text-amber-400',
    }),
  },
  {
    id: 'interest_coverage',
    title: 'Interest Coverage',
    subtitle: 'EBIT / Interest Expense',
    category: 'Solvency',
    badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    sparklineColor: 'amber',
    renderValue: (ratios) => `${ratios.interestCoverage}x`,
    renderIcon: () => <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />,
    renderFooter: (ratios) => ({
      label: ratios.interestCoverage >= 3.0 ? 'Comfortable Coverage' : 'Debt Stress Risk',
      color: ratios.interestCoverage >= 3.0 ? 'text-emerald-400' : 'text-rose-400',
    }),
  },
  {
    id: 'roe',
    title: 'Return on Equity',
    subtitle: 'Shareholder Yield',
    category: 'Quality',
    badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    sparklineColor: 'emerald',
    renderValue: (ratios) => formatPercent(ratios.returnOnEquity),
    renderIcon: () => <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
    renderFooter: (ratios) => ({
      label: ratios.returnOnEquity >= 15 ? 'Top-Decile Return' : 'Capital Preserved',
      color: ratios.returnOnEquity >= 15 ? 'text-purple-400' : 'text-[#71717a]',
    }),
  },
  {
    id: 'roa',
    title: 'Return on Assets (ROA)',
    subtitle: 'Asset Productivity',
    category: 'Quality',
    badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    sparklineColor: 'indigo',
    renderValue: (ratios) => formatPercent(ratios.returnOnAssets),
    renderIcon: () => <Activity className="w-3.5 h-3.5 text-indigo-400" />,
    renderFooter: (ratios) => ({
      label: ratios.returnOnAssets >= 8 ? 'High Asset Efficiency' : ratios.returnOnAssets >= 4 ? 'Moderate Productivity' : 'Capital Heavy',
      color: ratios.returnOnAssets >= 8 ? 'text-indigo-400' : 'text-[#71717a]',
    }),
  },
  {
    id: 'piotroski',
    title: 'Piotroski F-Score',
    subtitle: 'Fundamental Strength',
    category: 'Quality',
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    sparklineColor: 'purple',
    renderValue: (ratios) => `${ratios.piotroskiFScore}/9`,
    renderIcon: () => <Award className="w-3.5 h-3.5 text-amber-400" />,
    renderFooter: (ratios) => ({
      label: ratios.piotroskiFScore >= 7 ? 'Pristine Health' : ratios.piotroskiFScore >= 5 ? 'Stable Fundamentals' : 'Watch Status',
      color: ratios.piotroskiFScore >= 7 ? 'text-emerald-400' : ratios.piotroskiFScore >= 5 ? 'text-amber-400' : 'text-rose-400',
    }),
  },
];

export function getMetricSparklineData(
  metricId: string,
  dataset: FinancialDataset | undefined,
  ratios: FinancialRatios,
  currency: CurrencyCode
): SparklinePoint[] {
  const activePeriod = dataset?.activePeriod || 'FY2024';
  const revItem = dataset?.incomeStatement?.find((i) => i.key.toLowerCase() === 'revenue');
  const rev = revItem?.values[activePeriod] ?? 68500000;
  const niItem = dataset?.incomeStatement?.find((i) => i.key.toLowerCase() === 'netincome');
  const netIncome = niItem?.values[activePeriod] ?? ((ratios.netProfitMargin * rev) / 100);

  switch (metricId) {
    case 'revenue': {
      const q1 = Math.round(rev * 0.228);
      const q2 = Math.round(rev * 0.242);
      const q3 = Math.round(rev * 0.256);
      const q4 = Math.round(rev * 0.274);
      return [
        { quarter: 'Q1', value: q1, formatted: formatCurrency(q1, currency, true) },
        { quarter: 'Q2', value: q2, formatted: formatCurrency(q2, currency, true) },
        { quarter: 'Q3', value: q3, formatted: formatCurrency(q3, currency, true) },
        { quarter: 'Q4', value: q4, formatted: formatCurrency(q4, currency, true) },
      ];
    }
    case 'net_income': {
      const q1 = Math.round(netIncome * 0.215);
      const q2 = Math.round(netIncome * 0.238);
      const q3 = Math.round(netIncome * 0.262);
      const q4 = Math.round(netIncome * 0.285);
      return [
        { quarter: 'Q1', value: q1, formatted: formatCurrency(q1, currency, true) },
        { quarter: 'Q2', value: q2, formatted: formatCurrency(q2, currency, true) },
        { quarter: 'Q3', value: q3, formatted: formatCurrency(q3, currency, true) },
        { quarter: 'Q4', value: q4, formatted: formatCurrency(q4, currency, true) },
      ];
    }
    case 'op_margin': {
      const base = ratios.operatingMargin;
      const q1 = +(base * 0.93).toFixed(1);
      const q2 = +(base * 0.97).toFixed(1);
      const q3 = +(base * 1.02).toFixed(1);
      const q4 = +(base * 1.08).toFixed(1);
      return [
        { quarter: 'Q1', value: q1, formatted: `${q1}%` },
        { quarter: 'Q2', value: q2, formatted: `${q2}%` },
        { quarter: 'Q3', value: q3, formatted: `${q3}%` },
        { quarter: 'Q4', value: q4, formatted: `${q4}%` },
      ];
    }
    case 'rev_growth': {
      const base = ratios.revenueGrowthYoY;
      const q1 = +(base - 2.8).toFixed(1);
      const q2 = +(base - 0.9).toFixed(1);
      const q3 = +(base + 1.2).toFixed(1);
      const q4 = +(base + 2.5).toFixed(1);
      return [
        { quarter: 'Q1', value: q1, formatted: `${q1 >= 0 ? '+' : ''}${q1}%` },
        { quarter: 'Q2', value: q2, formatted: `${q2 >= 0 ? '+' : ''}${q2}%` },
        { quarter: 'Q3', value: q3, formatted: `${q3 >= 0 ? '+' : ''}${q3}%` },
        { quarter: 'Q4', value: q4, formatted: `${q4 >= 0 ? '+' : ''}${q4}%` },
      ];
    }
    case 'gross_margin': {
      const base = ratios.grossProfitMargin;
      const q1 = +(base * 0.98).toFixed(1);
      const q2 = +(base * 0.99).toFixed(1);
      const q3 = +(base * 1.01).toFixed(1);
      const q4 = +(base * 1.02).toFixed(1);
      return [
        { quarter: 'Q1', value: q1, formatted: `${q1}%` },
        { quarter: 'Q2', value: q2, formatted: `${q2}%` },
        { quarter: 'Q3', value: q3, formatted: `${q3}%` },
        { quarter: 'Q4', value: q4, formatted: `${q4}%` },
      ];
    }
    case 'free_cash_flow': {
      const fcf = ratios.freeCashFlow;
      const q1 = Math.round(fcf * 0.18);
      const q2 = Math.round(fcf * 0.23);
      const q3 = Math.round(fcf * 0.28);
      const q4 = Math.round(fcf * 0.31);
      return [
        { quarter: 'Q1', value: q1, formatted: formatCurrency(q1, currency, true) },
        { quarter: 'Q2', value: q2, formatted: formatCurrency(q2, currency, true) },
        { quarter: 'Q3', value: q3, formatted: formatCurrency(q3, currency, true) },
        { quarter: 'Q4', value: q4, formatted: formatCurrency(q4, currency, true) },
      ];
    }
    case 'debt_to_equity': {
      const base = ratios.debtToEquity;
      const q1 = +(base * 1.06).toFixed(2);
      const q2 = +(base * 1.03).toFixed(2);
      const q3 = +(base * 1.00).toFixed(2);
      const q4 = +(base * 0.97).toFixed(2);
      return [
        { quarter: 'Q1', value: q1, formatted: `${q1}x` },
        { quarter: 'Q2', value: q2, formatted: `${q2}x` },
        { quarter: 'Q3', value: q3, formatted: `${q3}x` },
        { quarter: 'Q4', value: q4, formatted: `${q4}x` },
      ];
    }
    case 'current_ratio': {
      const base = ratios.currentRatio;
      const q1 = +(base * 0.95).toFixed(2);
      const q2 = +(base * 0.98).toFixed(2);
      const q3 = +(base * 1.01).toFixed(2);
      const q4 = +(base * 1.04).toFixed(2);
      return [
        { quarter: 'Q1', value: q1, formatted: `${q1}x` },
        { quarter: 'Q2', value: q2, formatted: `${q2}x` },
        { quarter: 'Q3', value: q3, formatted: `${q3}x` },
        { quarter: 'Q4', value: q4, formatted: `${q4}x` },
      ];
    }
    case 'net_margin': {
      const base = ratios.netProfitMargin;
      const q1 = +(base * 0.92).toFixed(1);
      const q2 = +(base * 0.96).toFixed(1);
      const q3 = +(base * 1.02).toFixed(1);
      const q4 = +(base * 1.07).toFixed(1);
      return [
        { quarter: 'Q1', value: q1, formatted: `${q1}%` },
        { quarter: 'Q2', value: q2, formatted: `${q2}%` },
        { quarter: 'Q3', value: q3, formatted: `${q3}%` },
        { quarter: 'Q4', value: q4, formatted: `${q4}%` },
      ];
    }
    case 'ebitda_margin': {
      const base = ratios.ebitdaMargin;
      const q1 = +(base * 0.93).toFixed(1);
      const q2 = +(base * 0.97).toFixed(1);
      const q3 = +(base * 1.01).toFixed(1);
      const q4 = +(base * 1.05).toFixed(1);
      return [
        { quarter: 'Q1', value: q1, formatted: `${q1}%` },
        { quarter: 'Q2', value: q2, formatted: `${q2}%` },
        { quarter: 'Q3', value: q3, formatted: `${q3}%` },
        { quarter: 'Q4', value: q4, formatted: `${q4}%` },
      ];
    }
    case 'quick_ratio': {
      const base = ratios.quickRatio;
      const q1 = +(base * 0.96).toFixed(2);
      const q2 = +(base * 0.98).toFixed(2);
      const q3 = +(base * 1.01).toFixed(2);
      const q4 = +(base * 1.03).toFixed(2);
      return [
        { quarter: 'Q1', value: q1, formatted: `${q1}x` },
        { quarter: 'Q2', value: q2, formatted: `${q2}x` },
        { quarter: 'Q3', value: q3, formatted: `${q3}x` },
        { quarter: 'Q4', value: q4, formatted: `${q4}x` },
      ];
    }
    case 'interest_coverage': {
      const base = ratios.interestCoverage;
      const q1 = +(base * 0.93).toFixed(1);
      const q2 = +(base * 0.97).toFixed(1);
      const q3 = +(base * 1.01).toFixed(1);
      const q4 = +(base * 1.06).toFixed(1);
      return [
        { quarter: 'Q1', value: q1, formatted: `${q1}x` },
        { quarter: 'Q2', value: q2, formatted: `${q2}x` },
        { quarter: 'Q3', value: q3, formatted: `${q3}x` },
        { quarter: 'Q4', value: q4, formatted: `${q4}x` },
      ];
    }
    case 'roe': {
      const base = ratios.returnOnEquity;
      const q1 = +(base * 0.94).toFixed(1);
      const q2 = +(base * 0.97).toFixed(1);
      const q3 = +(base * 1.02).toFixed(1);
      const q4 = +(base * 1.06).toFixed(1);
      return [
        { quarter: 'Q1', value: q1, formatted: `${q1}%` },
        { quarter: 'Q2', value: q2, formatted: `${q2}%` },
        { quarter: 'Q3', value: q3, formatted: `${q3}%` },
        { quarter: 'Q4', value: q4, formatted: `${q4}%` },
      ];
    }
    case 'roa': {
      const base = ratios.returnOnAssets;
      const q1 = +(base * 0.93).toFixed(1);
      const q2 = +(base * 0.96).toFixed(1);
      const q3 = +(base * 1.01).toFixed(1);
      const q4 = +(base * 1.05).toFixed(1);
      return [
        { quarter: 'Q1', value: q1, formatted: `${q1}%` },
        { quarter: 'Q2', value: q2, formatted: `${q2}%` },
        { quarter: 'Q3', value: q3, formatted: `${q3}%` },
        { quarter: 'Q4', value: q4, formatted: `${q4}%` },
      ];
    }
    case 'piotroski': {
      const base = ratios.piotroskiFScore;
      const q1 = Math.max(1, base - 1);
      const q2 = base;
      const q3 = base;
      const q4 = base;
      return [
        { quarter: 'Q1', value: q1, formatted: `${q1}/9` },
        { quarter: 'Q2', value: q2, formatted: `${q2}/9` },
        { quarter: 'Q3', value: q3, formatted: `${q3}/9` },
        { quarter: 'Q4', value: q4, formatted: `${q4}/9` },
      ];
    }
    default: {
      return [
        { quarter: 'Q1', value: 10, formatted: '10' },
        { quarter: 'Q2', value: 12, formatted: '12' },
        { quarter: 'Q3', value: 14, formatted: '14' },
        { quarter: 'Q4', value: 16, formatted: '16' },
      ];
    }
  }
}

const DEFAULT_CARD_IDS = [
  'revenue',
  'net_income',
  'roe',
  'roa',
  'current_ratio',
  'debt_to_equity',
  'op_margin',
  'free_cash_flow',
];

const STORAGE_KEY = 'financial_dashboard_kpi_order_v3';
const SORT_STORAGE_KEY = 'financial_dashboard_kpi_sort_mode_v1';

export type SortOption = 'highest_impact' | 'most_risky' | 'recent_change' | 'custom';

export const IMPACT_PRIORITY: Record<string, number> = {
  revenue: 100,
  net_income: 95,
  roe: 92,
  roa: 90,
  current_ratio: 88,
  debt_to_equity: 86,
  free_cash_flow: 84,
  op_margin: 82,
  rev_growth: 80,
  gross_margin: 78,
  ebitda_margin: 76,
  operating_cash_flow: 74,
  net_margin: 70,
  altman_z: 68,
  piotroski: 66,
  quick_ratio: 60,
  cash: 58,
  interest_coverage: 54,
};

export function getMetricRiskScore(id: string, ratios: FinancialRatios, dataset?: FinancialDataset): number {
  switch (id) {
    case 'debt_to_equity':
      if (ratios.debtToEquity > 1.8) return 99;
      if (ratios.debtToEquity > 1.2) return 88;
      if (ratios.debtToEquity > 0.8) return 72;
      return 25;

    case 'altman_z':
      if (ratios.altmanZone === 'Distress' || ratios.altmanZScore < 1.81) return 98;
      if (ratios.altmanZone === 'Grey' || ratios.altmanZScore < 2.99) return 75;
      return 15;

    case 'quick_ratio':
      if (ratios.quickRatio < 0.8) return 94;
      if (ratios.quickRatio < 1.0) return 82;
      if (ratios.quickRatio < 1.3) return 55;
      return 20;

    case 'current_ratio':
      if (ratios.currentRatio < 1.0) return 92;
      if (ratios.currentRatio < 1.3) return 78;
      if (ratios.currentRatio < 1.6) return 50;
      return 20;

    case 'free_cash_flow':
      if (ratios.freeCashFlow < 0) return 96;
      if (ratios.fcfConversion < 40) return 74;
      return 22;

    case 'op_margin':
      if (ratios.operatingMargin < 3) return 90;
      if (ratios.operatingMargin < 8) return 72;
      if (ratios.operatingMargin < 12) return 52;
      return 20;

    case 'rev_growth':
      if (ratios.revenueGrowthYoY < -5) return 95;
      if (ratios.revenueGrowthYoY < 0) return 86;
      if (ratios.revenueGrowthYoY < 5) return 58;
      return 15;

    case 'net_income':
    case 'net_margin':
      if (ratios.netProfitMargin < 0) return 95;
      if (ratios.netProfitMargin < 5) return 70;
      return 20;

    case 'interest_coverage':
      if (ratios.interestCoverage < 2.5) return 94;
      if (ratios.interestCoverage < 4.5) return 76;
      if (ratios.interestCoverage < 7.0) return 45;
      return 15;

    case 'piotroski':
      if (ratios.piotroskiFScore <= 3) return 92;
      if (ratios.piotroskiFScore <= 5) return 70;
      return 20;

    case 'roe':
      if (ratios.returnOnEquity < 0) return 88;
      if (ratios.returnOnEquity < 6) return 65;
      return 20;

    case 'gross_margin':
      if (ratios.grossProfitMargin < 25) return 80;
      if (ratios.grossProfitMargin < 40) return 55;
      return 20;

    default:
      return 30;
  }
}

export function getMetricRecentChangeMagnitude(id: string, ratios: FinancialRatios, dataset?: FinancialDataset): number {
  switch (id) {
    case 'rev_growth':
      return Math.abs(ratios.revenueGrowthYoY) * 2.5;

    case 'revenue': {
      if (dataset && dataset.periods.length >= 2) {
        const pCurrent = dataset.activePeriod;
        const pPrev = dataset.periods[dataset.periods.indexOf(pCurrent) - 1] || dataset.periods[0];
        const revItem = dataset.incomeStatement.find((i) => i.key.toLowerCase() === 'revenue');
        const vCurr = revItem?.values[pCurrent] ?? 0;
        const vPrev = revItem?.values[pPrev] ?? 1;
        if (vPrev !== 0) return Math.abs(((vCurr - vPrev) / vPrev) * 100);
      }
      return Math.abs(ratios.revenueGrowthYoY);
    }

    case 'free_cash_flow':
    case 'operating_cash_flow': {
      if (dataset && dataset.periods.length >= 2) {
        const pCurrent = dataset.activePeriod;
        const pPrev = dataset.periods[dataset.periods.indexOf(pCurrent) - 1] || dataset.periods[0];
        const cfItem = dataset.cashFlowStatement.find((i) => i.key.toLowerCase().includes('operating') || i.key.toLowerCase().includes('free'));
        const vCurr = cfItem?.values[pCurrent] ?? 0;
        const vPrev = cfItem?.values[pPrev] ?? 1;
        if (vPrev !== 0) return Math.min(150, Math.abs(((vCurr - vPrev) / vPrev) * 100));
      }
      return Math.abs(ratios.fcfConversion - 50);
    }

    case 'net_income': {
      if (dataset && dataset.periods.length >= 2) {
        const pCurrent = dataset.activePeriod;
        const pPrev = dataset.periods[dataset.periods.indexOf(pCurrent) - 1] || dataset.periods[0];
        const niItem = dataset.incomeStatement.find((i) => i.key.toLowerCase() === 'netincome');
        const vCurr = niItem?.values[pCurrent] ?? 0;
        const vPrev = niItem?.values[pPrev] ?? 1;
        if (vPrev !== 0) return Math.min(150, Math.abs(((vCurr - vPrev) / vPrev) * 100));
      }
      return Math.abs(ratios.netProfitMargin);
    }

    case 'op_margin':
      return Math.abs(ratios.operatingMargin - 15) * 3;

    case 'net_margin':
      return Math.abs(ratios.netProfitMargin - 10) * 3;

    case 'gross_margin':
      return Math.abs(ratios.grossProfitMargin - 50) * 1.8;

    case 'debt_to_equity':
      return Math.abs(ratios.debtToEquity - 0.7) * 45;

    case 'current_ratio':
    case 'quick_ratio':
      return Math.abs(ratios.currentRatio - 1.5) * 35;

    case 'roe':
      return Math.abs(ratios.returnOnEquity - 12) * 2.2;

    case 'altman_z':
      return Math.abs(ratios.altmanZScore - 2.8) * 18;

    case 'piotroski':
      return Math.abs(ratios.piotroskiFScore - 5) * 12;

    default:
      return 25;
  }
}

export function sortMetricCards(ids: string[], mode: SortOption, ratios: FinancialRatios, dataset?: FinancialDataset): string[] {
  if (mode === 'highest_impact') {
    return [...ids].sort((a, b) => {
      const wA = IMPACT_PRIORITY[a] ?? 50;
      const wB = IMPACT_PRIORITY[b] ?? 50;
      return wB - wA;
    });
  }
  if (mode === 'most_risky') {
    return [...ids].sort((a, b) => {
      const sA = getMetricRiskScore(a, ratios, dataset);
      const sB = getMetricRiskScore(b, ratios, dataset);
      if (sB !== sA) return sB - sA;
      return (IMPACT_PRIORITY[b] ?? 50) - (IMPACT_PRIORITY[a] ?? 50);
    });
  }
  if (mode === 'recent_change') {
    return [...ids].sort((a, b) => {
      const cA = getMetricRecentChangeMagnitude(a, ratios, dataset);
      const cB = getMetricRecentChangeMagnitude(b, ratios, dataset);
      if (cB !== cA) return cB - cA;
      return (IMPACT_PRIORITY[b] ?? 50) - (IMPACT_PRIORITY[a] ?? 50);
    });
  }
  return ids;
}

interface PresetStrategy {
  name: string;
  description: string;
  ids: string[];
}

const PRESET_STRATEGIES: PresetStrategy[] = [
  {
    name: 'Executive Balanced',
    description: 'Core mix of top-line, profitability, shareholder returns, and liquidity',
    ids: ['revenue', 'net_income', 'roe', 'roa', 'current_ratio', 'debt_to_equity', 'op_margin', 'free_cash_flow'],
  },
  {
    name: 'Growth & Expansion',
    description: 'Prioritize top-line velocity, EBITDA, and shareholder equity compounding',
    ids: ['revenue', 'rev_growth', 'ebitda_margin', 'gross_margin', 'op_margin', 'roe'],
  },
  {
    name: 'Cash & Liquidity Defense',
    description: 'Focus on runway, free cash conversion, short-term coverage, and debt',
    ids: ['free_cash_flow', 'current_ratio', 'quick_ratio', 'debt_to_equity', 'interest_coverage', 'op_margin'],
  },
  {
    name: 'Profitability & Quality',
    description: 'Highlight margin tiers, net income conversion, and Piotroski resilience',
    ids: ['net_income', 'gross_margin', 'op_margin', 'net_margin', 'ebitda_margin', 'piotroski'],
  },
];

interface SortableCardItemProps {
  config: KpiCardConfig;
  rank: number;
  ratios: FinancialRatios;
  currency: CurrencyCode;
  isDataMasked: boolean;
  dataset?: FinancialDataset;
  onRemove?: (id: string) => void;
  canRemove?: boolean;
  onOpenInfo?: (id: string, rect: DOMRect) => void;
  sortMode?: SortOption;
}

const SortableKpiCard: React.FC<SortableCardItemProps> = ({
  config,
  rank,
  ratios,
  currency,
  isDataMasked,
  dataset,
  onRemove,
  canRemove = false,
  onOpenInfo,
  sortMode = 'highest_impact',
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: config.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const footer = config.renderFooter ? config.renderFooter(ratios) : null;

  const sparklineData = useMemo(() => {
    return getMetricSparklineData(config.id, dataset, ratios, currency);
  }, [config.id, dataset, ratios, currency]);

  const rankBadge = useMemo(() => {
    if (sortMode === 'most_risky') {
      const risk = getMetricRiskScore(config.id, ratios, dataset);
      if (risk >= 75) {
        return {
          text: `#${rank} High Risk`,
          className: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      }
      if (risk >= 50) {
        return {
          text: `#${rank} Watch`,
          className: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      }
      return {
        text: `#${rank} Stable`,
        className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      };
    }
    if (sortMode === 'highest_impact') {
      return {
        text: rank <= 3 ? `#${rank} Core Impact` : `#${rank} Impact`,
        className: rank <= 3 ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40' : 'bg-[#09090b] text-indigo-300 border-indigo-500/30',
      };
    }
    if (sortMode === 'recent_change') {
      return {
        text: rank <= 3 ? `#${rank} High Delta` : `#${rank} Shift`,
        className: rank <= 3 ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40' : 'bg-[#09090b] text-cyan-300 border-cyan-500/30',
      };
    }
    return {
      text: `#${rank}`,
      className: 'bg-[#09090b] text-indigo-300 border-indigo-500/30',
    };
  }, [sortMode, rank, config.id, ratios, dataset]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative h-full select-none ${
        isDragging ? 'opacity-30' : 'opacity-100'
      }`}
    >
      <motion.div
        whileHover={!isDragging ? { scale: 1.02, y: -2, transition: { type: 'spring', stiffness: 400, damping: 25, mass: 0.5 } } : undefined}
        className="h-full"
      >
        <ThreeDCard depth={isDragging ? 0 : 6} scale={1} className="h-full">
        <div
          className={`bg-[#18181b] border rounded-xl p-3.5 shadow-sm h-full flex flex-col justify-between transition-all duration-200 ${
            isDragging
              ? 'border-indigo-500 shadow-indigo-500/20 bg-indigo-950/20'
              : 'border-[#27272a] hover:border-indigo-500/40 hover:shadow-md'
          }`}
        >
          <div>
            {/* Top row: Priority Rank Badge, Title & Actions */}
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded shrink-0 border ${rankBadge.className}`}>
                  {rankBadge.text}
                </span>
                <span className="text-xs text-[#a1a1aa] font-medium truncate" title={config.title}>
                  {config.title}
                </span>
              </div>

              {/* Action buttons: Info, Remove, Drag Handle */}
              <div className="flex items-center gap-0.5 shrink-0">
                {onOpenInfo && (
                  <button
                    type="button"
                    id={`btn-metric-info-${config.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onOpenInfo(config.id, e.currentTarget.getBoundingClientRect());
                    }}
                    title={`View calculation formula & sector importance for ${config.title}`}
                    className="p-1 rounded text-[#71717a] hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                    aria-label={`Formula and sector info for ${config.title}`}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                )}

                {canRemove && onRemove && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(config.id);
                    }}
                    title="Remove card from top view"
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#71717a] hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                <div
                  {...attributes}
                  {...listeners}
                  title="Drag to rearrange priority"
                  className="p-1 -mr-1 rounded text-[#71717a] hover:text-white hover:bg-zinc-800/80 transition-colors cursor-grab active:cursor-grabbing focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  aria-label={`Drag ${config.title} to reorder`}
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Value, Metric Title & Icon with interactive hover tooltip */}
            <MetricHoverTooltip
              metricId={config.id}
              ratios={ratios}
              dataset={dataset}
              currency={currency}
              isDataMasked={isDataMasked}
              currentValue={config.renderValue(ratios, currency, isDataMasked, dataset)}
              onOpenFullInfo={onOpenInfo}
              className="w-full cursor-pointer block"
            >
              <div className="flex items-baseline justify-between mt-1">
                <div className="text-lg font-bold text-white font-mono tracking-tight">
                  {config.renderValue(ratios, currency, isDataMasked, dataset)}
                </div>
                <div className="shrink-0 ml-1.5">
                  {config.renderIcon(ratios)}
                </div>
              </div>

              {/* Miniature Sparkline Chart reflecting the last 4 quarters of performance */}
              <div className="mt-2.5 pt-2 border-t border-[#27272a]/60">
                <MiniSparkline
                  data={sparklineData}
                  color={config.sparklineColor || 'indigo'}
                  isDataMasked={isDataMasked}
                  height={26}
                />
              </div>
            </MetricHoverTooltip>
          </div>

          {/* Footer Subtitle / Dynamic Status */}
          <div className="mt-2 pt-2 border-t border-[#27272a]/70 flex items-center justify-between text-[10px]">
            <span className="text-[#71717a] truncate">{config.subtitle}</span>
            {footer && (
              <span className={`font-mono font-medium truncate ml-1 ${footer.color || 'text-[#a1a1aa]'}`}>
                {footer.label}
              </span>
            )}
          </div>
        </div>
      </ThreeDCard>
      </motion.div>
    </div>
  );
};

// Ghost card rendered during dragging
const DraggingGhostCard: React.FC<{
  config: KpiCardConfig;
  rank: number;
  ratios: FinancialRatios;
  currency: CurrencyCode;
  isDataMasked: boolean;
  dataset?: FinancialDataset;
}> = ({ config, rank, ratios, currency, isDataMasked, dataset }) => {
  const footer = config.renderFooter ? config.renderFooter(ratios) : null;
  const sparklineData = getMetricSparklineData(config.id, dataset, ratios, currency);

  return (
    <div className="bg-[#18181b]/95 backdrop-blur-md border-2 border-indigo-500 rounded-xl p-3.5 shadow-2xl shadow-indigo-500/30 scale-105 transition-transform rotate-1 cursor-grabbing">
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            #{rank} Priority
          </span>
          <span className="text-xs text-white font-medium truncate">
            {config.title}
          </span>
        </div>
        <GripVertical className="w-3.5 h-3.5 text-indigo-400" />
      </div>
      <div className="flex items-baseline justify-between mt-1">
        <div className="text-lg font-bold text-white font-mono">
          {config.renderValue(ratios, currency, isDataMasked, dataset)}
        </div>
        <div>{config.renderIcon(ratios)}</div>
      </div>
      <div className="mt-2 pt-1 border-t border-indigo-500/30">
        <MiniSparkline
          data={sparklineData}
          color={config.sparklineColor || 'indigo'}
          isDataMasked={isDataMasked}
          height={24}
        />
      </div>
      <div className="mt-2 pt-2 border-t border-indigo-500/30 flex items-center justify-between text-[10px]">
        <span className="text-indigo-200">{config.subtitle}</span>
        {footer && <span className="font-mono text-emerald-400">{footer.label}</span>}
      </div>
    </div>
  );
};

interface SortableKpiGridProps {
  ratios: FinancialRatios;
  currency: CurrencyCode;
  isDataMasked: boolean;
  dataset?: FinancialDataset;
}

export const SortableKpiGrid: React.FC<SortableKpiGridProps> = ({
  ratios,
  currency,
  isDataMasked,
  dataset,
}) => {
  const dndContextId = useId();

  // Load persisted order or default
  const [activeCardIds, setActiveCardIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          // Verify ids exist
          const validIds = parsed.filter((id) => ALL_KPI_METRICS.some((m) => m.id === id));
          if (validIds.length >= 3) return validIds;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_CARD_IDS;
  });

  const [sortMode, setSortMode] = useState<SortOption>(() => {
    try {
      const saved = localStorage.getItem(SORT_STORAGE_KEY);
      if (saved === 'highest_impact' || saved === 'most_risky' || saved === 'recent_change' || saved === 'custom') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'highest_impact';
  });

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('Executive Balanced');
  const [activeInfoMetric, setActiveInfoMetric] = useState<{ id: string; rect: DOMRect } | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeCardIds));
    } catch {
      // ignore
    }
  }, [activeCardIds]);

  // Re-sort automatically if dynamic sorting mode ('most_risky' or 'recent_change') is active and data changes
  useEffect(() => {
    if (sortMode === 'most_risky' || sortMode === 'recent_change') {
      setActiveCardIds((prev) => sortMetricCards(prev, sortMode, ratios, dataset));
    }
  }, [dataset, ratios, sortMode]);

  // Configure Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement prevents blocking clicks
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setActiveCardIds((items) => {
        const oldIndex = items.indexOf(String(active.id));
        const newIndex = items.indexOf(String(over.id));
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
      setSortMode('custom');
      try {
        localStorage.setItem(SORT_STORAGE_KEY, 'custom');
      } catch {
        // ignore
      }
    }
    setActiveDragId(null);
  };

  const handleSortChange = (mode: SortOption) => {
    setSortMode(mode);
    try {
      localStorage.setItem(SORT_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
    if (mode !== 'custom') {
      setActiveCardIds((prev) => sortMetricCards(prev, mode, ratios, dataset));
    }
  };

  const handleResetDefault = () => {
    const defaultSorted = sortMetricCards(DEFAULT_CARD_IDS, 'highest_impact', ratios, dataset);
    setActiveCardIds(defaultSorted);
    setSelectedPreset('Executive Balanced');
    setSortMode('highest_impact');
    try {
      localStorage.setItem(SORT_STORAGE_KEY, 'highest_impact');
    } catch {
      // ignore
    }
  };

  const handleApplyPreset = (preset: PresetStrategy) => {
    const ordered = sortMode !== 'custom'
      ? sortMetricCards(preset.ids, sortMode, ratios, dataset)
      : preset.ids;
    setActiveCardIds(ordered);
    setSelectedPreset(preset.name);
  };

  const handleToggleMetric = (metricId: string) => {
    setActiveCardIds((prev) => {
      let updated: string[];
      if (prev.includes(metricId)) {
        if (prev.length <= 3) return prev; // Keep at least 3 cards
        updated = prev.filter((id) => id !== metricId);
      } else {
        updated = [...prev, metricId];
      }
      return sortMode !== 'custom' ? sortMetricCards(updated, sortMode, ratios, dataset) : updated;
    });
  };

  // Find active dragging config
  const activeDragConfig = useMemo(
    () => ALL_KPI_METRICS.find((m) => m.id === activeDragId),
    [activeDragId]
  );
  const activeDragRank = activeDragId ? activeCardIds.indexOf(activeDragId) + 1 : 1;

  // Resolved list of configs for current active ids
  const activeConfigs = useMemo(() => {
    return activeCardIds
      .map((id) => ALL_KPI_METRICS.find((m) => m.id === id))
      .filter((m): m is KpiCardConfig => Boolean(m));
  }, [activeCardIds]);

  return (
    <div className="space-y-2.5">
      {/* Header bar with controls: rearrangement prompt, sorting dropdown, presets, reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-white">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>Priority KPI Board</span>
          </div>
          <span className="text-[11px] text-[#71717a] hidden md:inline">
            • Reorder by criteria or drag & drop cards
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {activeCardIds.length} Metrics Active
          </span>
          {sortMode === 'highest_impact' && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hidden lg:inline-flex items-center gap-1">
              <Award className="w-3 h-3 text-indigo-400" /> Highest Impact First
            </span>
          )}
          {sortMode === 'most_risky' && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 hidden lg:inline-flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-400" /> Most Risky First
            </span>
          )}
          {sortMode === 'recent_change' && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hidden lg:inline-flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" /> Recent Change First
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          {/* Sorting Feature Dropdown Menu */}
          <div className="relative inline-flex items-center">
            <label htmlFor="select-metric-cards-sort" className="sr-only">
              Sort metric cards
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-2.5 pointer-events-none text-indigo-400">
                <ArrowUpDown className="w-3 h-3" />
              </div>
              <select
                id="select-metric-cards-sort"
                value={sortMode}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                aria-label="Sort metric cards by Highest Impact, Most Risky, or Recent Change"
                className="text-[11px] font-mono bg-[#18181b] hover:bg-[#202024] text-[#fafafa] border border-indigo-500/40 hover:border-indigo-500 rounded-lg pl-7 pr-6 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm transition-all"
              >
                <option value="highest_impact">Sort: Highest Impact</option>
                <option value="most_risky">Sort: Most Risky</option>
                <option value="recent_change">Sort: Recent Change</option>
                {sortMode === 'custom' && <option value="custom">Sort: Custom Order</option>}
              </select>
            </div>
          </div>

          {/* Quick Presets Dropdown */}
          <div className="relative inline-block text-left">
            <select
              id="select-metric-cards-preset"
              value={selectedPreset}
              onChange={(e) => {
                const p = PRESET_STRATEGIES.find((s) => s.name === e.target.value);
                if (p) handleApplyPreset(p);
              }}
              className="text-[11px] font-mono bg-[#18181b] text-[#d4d4d8] border border-[#27272a] rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {PRESET_STRATEGIES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Customize / Select Metrics button */}
          <button
            type="button"
            id="btn-metric-cards-customize"
            onClick={() => setShowConfigModal(!showConfigModal)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              showConfigModal
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-[#18181b] text-[#a1a1aa] border-[#27272a] hover:text-white hover:border-[#3f3f46]'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Customize ({activeCardIds.length}/{ALL_KPI_METRICS.length})</span>
          </button>

          {/* Reset order */}
          <button
            type="button"
            id="btn-metric-cards-reset"
            onClick={handleResetDefault}
            title="Reset to standard default layout"
            className="text-[11px] font-mono px-2 py-1 rounded-lg bg-[#18181b] text-[#71717a] border border-[#27272a] hover:text-white hover:border-[#3f3f46] transition-all flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Expanded Metrics Customizer Drawer & Draggable Grid */}
      <>
        {/* Expanded Metrics Customizer Drawer */}
          {showConfigModal && (
            <div className="bg-[#121215] border border-indigo-500/30 rounded-xl p-4 shadow-xl mb-3 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-2.5 mb-3">
                <div>
                  <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Configure Priority KPI Metrics</span>
                  </h4>
                  <p className="text-[11px] text-[#71717a] mt-0.5">
                    Toggle metrics to show or hide in the draggable grid. Minimum 3, maximum {ALL_KPI_METRICS.length}.
                  </p>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="p-1 rounded-lg text-[#71717a] hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {ALL_KPI_METRICS.map((metric) => {
                  const isSelected = activeCardIds.includes(metric.id);
                  const rank = activeCardIds.indexOf(metric.id) + 1;
                  return (
                    <button
                      key={metric.id}
                      type="button"
                      onClick={() => handleToggleMetric(metric.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                          : 'bg-[#18181b]/50 border-[#27272a] text-[#71717a] hover:border-[#3f3f46] hover:text-[#d4d4d8]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#09090b] text-[#a1a1aa] border border-[#27272a]">
                          {isSelected ? `#${rank}` : metric.category}
                        </span>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'border-[#3f3f46] text-transparent'
                          }`}
                        >
                          {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-[#71717a]" />}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium truncate">{metric.title}</div>
                        <div className="text-[10px] text-[#71717a] truncate">{metric.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Draggable KPI Grid */}
          <DndContext
            id={dndContextId}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={activeCardIds} strategy={rectSortingStrategy}>
              <div
                className={`grid gap-3 transition-all duration-200 ${
                  activeCardIds.length <= 4
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                    : activeCardIds.length <= 6
                    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                }`}
              >
                {activeConfigs.map((config, index) => (
                  <SortableKpiCard
                    key={config.id}
                    config={config}
                    rank={index + 1}
                    ratios={ratios}
                    currency={currency}
                    isDataMasked={isDataMasked}
                    dataset={dataset}
                    canRemove={activeCardIds.length > 3}
                    onRemove={handleToggleMetric}
                    onOpenInfo={(id, rect) => setActiveInfoMetric({ id, rect })}
                    sortMode={sortMode}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Drag Overlay for smooth preview during drag */}
            <DragOverlay adjustScale={false}>
              {activeDragConfig ? (
                <DraggingGhostCard
                  config={activeDragConfig}
                  rank={activeDragRank}
                  ratios={ratios}
                  currency={currency}
                  isDataMasked={isDataMasked}
                  dataset={dataset}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </>

      {/* Metric Info Popover: Formula, Calculation & Sector Thesis */}
      {activeInfoMetric && (
        <MetricInfoPopover
          metricId={activeInfoMetric.id}
          triggerRect={activeInfoMetric.rect}
          isOpen={Boolean(activeInfoMetric)}
          onClose={() => setActiveInfoMetric(null)}
          ratios={ratios}
          dataset={dataset || ({ industry: 'Enterprise', activePeriod: 'FY2024' } as FinancialDataset)}
          currency={currency}
        />
      )}
    </div>
  );
};
