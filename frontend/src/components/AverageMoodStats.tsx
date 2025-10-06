import React from 'react';
import { AverageMoodData } from '../types';
import './AverageMoodStats.css';

interface AverageMoodStatsProps {
  data: AverageMoodData | null;
  loading?: boolean;
}

export const AverageMoodStats: React.FC<AverageMoodStatsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="average-mood-stats">
        <div className="average-mood-stats__loading">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const getMoodLabel = (value: number): string => {
    if (value === 0) return 'No data';
    if (value >= 4.5) return 'Amazing';
    if (value >= 3.5) return 'Good';
    if (value >= 2.5) return 'Okay';
    if (value >= 1.5) return 'Bad';
    return 'Terrible';
  };

  const getMoodColor = (value: number): string => {
    if (value === 0) return 'var(--color-text-tertiary)';
    if (value >= 4.5) return 'var(--color-mood-amazing)';
    if (value >= 3.5) return 'var(--color-mood-good)';
    if (value >= 2.5) return 'var(--color-mood-okay)';
    if (value >= 1.5) return 'var(--color-mood-bad)';
    return 'var(--color-mood-terrible)';
  };

  const formatValue = (value: number): string => {
    return value === 0 ? '—' : value.toFixed(1);
  };

  return (
    <div className="average-mood-stats">
      <div className="average-mood-stat">
        <div className="average-mood-stat__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="M8 14h.01" />
            <path d="M12 14h.01" />
            <path d="M16 14h.01" />
            <path d="M8 18h.01" />
          </svg>
        </div>
        <div className="average-mood-stat__content">
          <div className="average-mood-stat__value" style={{ color: getMoodColor(data.last7Days) }}>
            {formatValue(data.last7Days)}
          </div>
          <div className="average-mood-stat__label">
            Last 7 Days
            <span className="average-mood-stat__sublabel">{getMoodLabel(data.last7Days)}</span>
          </div>
        </div>
      </div>

      <div className="average-mood-stat">
        <div className="average-mood-stat__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="M8 14h.01" />
            <path d="M12 14h.01" />
            <path d="M16 14h.01" />
            <path d="M8 18h.01" />
            <path d="M12 18h.01" />
            <path d="M16 18h.01" />
          </svg>
        </div>
        <div className="average-mood-stat__content">
          <div className="average-mood-stat__value" style={{ color: getMoodColor(data.last30Days) }}>
            {formatValue(data.last30Days)}
          </div>
          <div className="average-mood-stat__label">
            Last 30 Days
            <span className="average-mood-stat__sublabel">{getMoodLabel(data.last30Days)}</span>
          </div>
        </div>
      </div>

      <div className="average-mood-stat">
        <div className="average-mood-stat__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <rect x="8" y="13" width="8" height="7" />
          </svg>
        </div>
        <div className="average-mood-stat__content">
          <div className="average-mood-stat__value" style={{ color: getMoodColor(data.last90Days) }}>
            {formatValue(data.last90Days)}
          </div>
          <div className="average-mood-stat__label">
            Last 90 Days
            <span className="average-mood-stat__sublabel">{getMoodLabel(data.last90Days)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
