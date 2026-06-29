export const fmt = {
  currency: (val: number, currency = 'USD', compact = false) => {
    if (compact && Math.abs(val) >= 1_000_000) {
      return `${currency === 'USD' ? '$' : currency} ${(val / 1_000_000).toFixed(1)}M`;
    }
    if (compact && Math.abs(val) >= 1_000) {
      return `${currency === 'USD' ? '$' : currency} ${(val / 1_000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  },
  pct: (val: number, digits = 1) => `${val >= 0 ? '' : ''}${val.toFixed(digits)}%`,
  number: (val: number) => new Intl.NumberFormat('en-US').format(Math.round(val)),
  months: (val: number) => {
    if (val >= 999) return '∞';
    if (val >= 12) return `${(val / 12).toFixed(1)}y`;
    return `${val.toFixed(1)}mo`;
  },
};

export const scoreColor = (score: number) => {
  if (score >= 80) return '#22C55E';
  if (score >= 65) return '#3B82F6';
  if (score >= 50) return '#8B5CF6';
  if (score >= 35) return '#F59E0B';
  return '#EF4444';
};

export const deltaColor = (val: number) => val >= 0 ? '#22C55E' : '#EF4444';
export const deltaBg = (val: number) => val >= 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';
