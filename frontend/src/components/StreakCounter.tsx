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
        <div className="streak-stat__icon">🔥</div>
        <div className="streak-stat__content">
          <div className="streak-stat__value">{data.currentStreak}</div>
          <div className="streak-stat__label">Current Streak</div>
        </div>
      </div>

      <div className="streak-stat">
        <div className="streak-stat__icon">🏆</div>
        <div className="streak-stat__content">
          <div className="streak-stat__value">{data.longestStreak}</div>
          <div className="streak-stat__label">Longest Streak</div>
        </div>
      </div>

      <div className="streak-stat">
        <div className="streak-stat__icon">📝</div>
        <div className="streak-stat__content">
          <div className="streak-stat__value">{data.totalEntries}</div>
          <div className="streak-stat__label">Total Entries</div>
        </div>
      </div>
    </div>
  );
};
