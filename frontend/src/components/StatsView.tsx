import React from 'react';
import { StreakData, HeatMapData, AverageMoodData } from '../types';
import { StreakCounter } from './StreakCounter';
import { CalendarHeatMap } from './CalendarHeatMap';
import { AverageMoodStats } from './AverageMoodStats';
import './StatsView.css';

interface StatsViewProps {
  streakData: StreakData | null;
  heatMapData: HeatMapData[];
  averageMoodData: AverageMoodData | null;
  loading: boolean;
  onDateClick?: (date: string) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  streakData,
  heatMapData,
  averageMoodData,
  loading,
  onDateClick,
}) => {
  return (
    <div className="stats-view">
      <header className="stats-view__header">
        <h2 className="stats-view__title">Journal Statistics</h2>
        <p className="stats-view__subtitle">
          Track your journaling habits and mood patterns
        </p>
      </header>

      <div className="stats-view__content">
        <StreakCounter data={streakData} loading={loading} />
        <AverageMoodStats data={averageMoodData} loading={loading} />
        <CalendarHeatMap data={heatMapData} onDateClick={onDateClick} />
      </div>
    </div>
  );
};
