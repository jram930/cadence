import React from 'react';
import { StreakData } from '../types';
import './StreakCounter.css';

interface StreakCounterProps {
  data: StreakData | null;
  loading?: boolean;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="streak-counter">
        <div className="streak-counter__loading">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="streak-counter">
      <div className="streak-stat">
        <div className="streak-stat__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        </div>
        <div className="streak-stat__content">
          <div className="streak-stat__value">{data.currentStreak}</div>
          <div className="streak-stat__label">Current Streak</div>
        </div>
      </div>

      <div className="streak-stat">
        <div className="streak-stat__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
        </div>
        <div className="streak-stat__content">
          <div className="streak-stat__value">{data.longestStreak}</div>
          <div className="streak-stat__label">Longest Streak</div>
        </div>
      </div>

      <div className="streak-stat">
        <div className="streak-stat__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        </div>
        <div className="streak-stat__content">
          <div className="streak-stat__value">{data.totalEntries}</div>
          <div className="streak-stat__label">Total Entries</div>
        </div>
      </div>
    </div>
  );
};
