import React from 'react';
import { HeatMapData, MoodType } from '../types';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks } from 'date-fns';
import './CalendarHeatMap.css';

interface CalendarHeatMapProps {
  data: HeatMapData[];
  onDateClick?: (date: string) => void;
}

const getMoodColor = (mood?: MoodType): string => {
  if (!mood) return 'var(--color-bg-secondary)';

  switch (mood) {
    case MoodType.AMAZING:
      return 'var(--color-mood-amazing)';
    case MoodType.GOOD:
      return 'var(--color-mood-good)';
    case MoodType.OKAY:
      return 'var(--color-mood-okay)';
    case MoodType.BAD:
      return 'var(--color-mood-bad)';
    case MoodType.TERRIBLE:
      return 'var(--color-mood-terrible)';
    default:
      return 'var(--color-bg-secondary)';
  }
};

export const CalendarHeatMap: React.FC<CalendarHeatMapProps> = ({ data, onDateClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="heatmap">
        <div className="heatmap__loading">No data available</div>
      </div>
    );
  }

  // Group data by week
  const weeks: HeatMapData[][] = [];
  const dataMap = new Map<string, HeatMapData>();

  data.forEach((item) => {
    dataMap.set(item.date, item);
  });

  const startDate = parseISO(data[0].date);
  const endDate = parseISO(data[data.length - 1].date);

  let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 0 });
  const lastWeekEnd = endOfWeek(endDate, { weekStartsOn: 0 });

  while (currentWeekStart <= lastWeekEnd) {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
    const daysInWeek = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });

    const weekData = daysInWeek.map((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      return dataMap.get(dateKey) || { date: dateKey, count: 0 };
    });

    weeks.push(weekData);
    currentWeekStart = addWeeks(currentWeekStart, 1);
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="heatmap">
      <h3 className="heatmap__title">Your Journal Activity</h3>
      <div className="heatmap__container">
        <div className="heatmap__days">
          {dayLabels.map((label) => (
            <div key={label} className="heatmap__day-label">
              {label}
            </div>
          ))}
        </div>
        <div className="heatmap__grid">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="heatmap__week">
              {week.map((day) => (
                <button
                  key={day.date}
                  className="heatmap__cell"
                  style={{
                    backgroundColor: day.count > 0 ? getMoodColor(day.mood) : 'var(--color-bg-secondary)',
                    opacity: day.count > 0 ? 1 : 0.3,
                  }}
                  onClick={() => onDateClick?.(day.date)}
                  title={`${day.date}${day.mood ? ` - ${day.mood}` : ''}`}
                  aria-label={`${day.date}${day.count > 0 ? ' - has entry' : ' - no entry'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="heatmap__legend">
        <span className="heatmap__legend-label">Mood:</span>
        <div className="heatmap__legend-item">
          <div className="heatmap__legend-color" style={{ backgroundColor: getMoodColor(MoodType.AMAZING) }} />
          <span>Amazing</span>
        </div>
        <div className="heatmap__legend-item">
          <div className="heatmap__legend-color" style={{ backgroundColor: getMoodColor(MoodType.GOOD) }} />
          <span>Good</span>
        </div>
        <div className="heatmap__legend-item">
          <div className="heatmap__legend-color" style={{ backgroundColor: getMoodColor(MoodType.OKAY) }} />
          <span>Okay</span>
        </div>
        <div className="heatmap__legend-item">
          <div className="heatmap__legend-color" style={{ backgroundColor: getMoodColor(MoodType.BAD) }} />
          <span>Bad</span>
        </div>
        <div className="heatmap__legend-item">
          <div className="heatmap__legend-color" style={{ backgroundColor: getMoodColor(MoodType.TERRIBLE) }} />
          <span>Terrible</span>
        </div>
      </div>
    </div>
  );
};
