import { CurrencyCode, CurrencyConfig, FiscalYearConfig, FiscalYearType } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 0.79 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 154.2 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToUSD: 1.38 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUSD: 1.52 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToUSD: 83.4 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateToUSD: 0.89 },
};

export const FISCAL_YEAR_TYPES: Record<FiscalYearType, FiscalYearConfig> = {
  CALENDAR: {
    type: 'CALENDAR',
    label: 'Standard Calendar (Jan 1 - Dec 31)',
    startMonth: 'January',
    endMonth: 'December',
    quarters: ['Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Oct-Dec)'],
  },
  APR_MAR: {
    type: 'APR_MAR',
    label: 'Commonwealth / UK (Apr 1 - Mar 31)',
    startMonth: 'April',
    endMonth: 'March',
    quarters: ['Q1 (Apr-Jun)', 'Q2 (Jul-Sep)', 'Q3 (Oct-Dec)', 'Q4 (Jan-Mar)'],
  },
  OCT_SEP: {
    type: 'OCT_SEP',
    label: 'US Federal / Tech (Oct 1 - Sep 30)',
    startMonth: 'October',
    endMonth: 'September',
    quarters: ['Q1 (Oct-Dec)', 'Q2 (Jan-Mar)', 'Q3 (Apr-Jun)', 'Q4 (Jul-Sep)'],
  },
  JUL_JUN: {
    type: 'JUL_JUN',
    label: 'Australian / Higher Ed (Jul 1 - Jun 30)',
    startMonth: 'July',
    endMonth: 'June',
    quarters: ['Q1 (Jul-Sep)', 'Q2 (Oct-Dec)', 'Q3 (Jan-Mar)', 'Q4 (Apr-Jun)'],
  },
  RETAIL_445: {
    type: 'RETAIL_445',
    label: 'NRF 4-4-5 Retail Calendar',
    startMonth: 'February',
    endMonth: 'January',
    quarters: ['Q1 (Weeks 1-13)', 'Q2 (Weeks 14-26)', 'Q3 (Weeks 27-39)', 'Q4 (Weeks 40-52)'],
  },
};

export function formatCurrency(amount: number, currencyCode: CurrencyCode = 'USD', compact: boolean = false): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const converted = amount * config.rateToUSD;

  if (compact && Math.abs(converted) >= 1_000_000_000) {
    return `${config.symbol}${(converted / 1_000_000_000).toFixed(2)}B`;
  }
  if (compact && Math.abs(converted) >= 1_000_000) {
    return `${config.symbol}${(converted / 1_000_000).toFixed(2)}M`;
  }
  if (compact && Math.abs(converted) >= 1_000) {
    return `${config.symbol}${(converted / 1_000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: config.code,
    maximumFractionDigits: compact ? 0 : 0,
  }).format(converted);
}

export function formatPercent(value: number, includeSign: boolean = false): string {
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
