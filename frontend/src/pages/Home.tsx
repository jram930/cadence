import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { api } from '../services/api';
import { MoodType, StreakData, HeatMapData, Entry } from '../types';
import { EntryForm } from '../components/EntryForm';
import { StreakCounter } from '../components/StreakCounter';
import { CalendarHeatMap } from '../components/CalendarHeatMap';
import './Home.css';

export const Home: React.FC = () => {
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [heatMapData, setHeatMapData] = useState<HeatMapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entry, streak, heatmap] = await Promise.all([
        api.getEntryByDate(today),
        api.getStreakData(),
        api.getHeatMapData(365),
      ]);

      setTodayEntry(entry);
      setStreakData(streak);
      setHeatMapData(heatmap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (content: string, mood: MoodType) => {
    try {
      if (todayEntry) {
        await api.updateEntry(todayEntry.id, { content, mood });
      } else {
        await api.createEntry({ content, mood, entryDate: today });
      }

      setEditMode(false);
      await loadData();
    } catch (error) {
      console.error('Error saving entry:', error);
      throw error;
    }
  };

  const handleDateClick = async (date: string) => {
    try {
      const entry = await api.getEntryByDate(date);
      if (entry) {
        // Could navigate to a detail view or show a modal
        console.log('Entry for', date, entry);
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
    }
  };

  const handleDelete = async () => {
    if (!todayEntry || !confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      await api.deleteEntry(todayEntry.id);
      await loadData();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  return (
    <div className="home">
      <div className="container">
        <header className="home__header">
          <h1 className="home__title">Micro Journal</h1>
          <p className="home__subtitle">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </header>

        <StreakCounter data={streakData} loading={loading} />

        {!todayEntry || editMode ? (
          <EntryForm
            entry={todayEntry}
            onSubmit={handleSubmit}
            onCancel={todayEntry && editMode ? () => setEditMode(false) : undefined}
          />
        ) : (
          <div className="entry-display">
            <div className="entry-display__header">
              <h2>Today's Entry</h2>
              <div className="entry-display__actions">
                <button
                  className="button button--icon"
                  onClick={() => setEditMode(true)}
                  aria-label="Edit entry"
                >
                  ✏️
                </button>
                <button
                  className="button button--icon button--danger"
                  onClick={handleDelete}
                  aria-label="Delete entry"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="entry-display__content">
              <div className="entry-display__mood">
                Mood: <span className="mood-badge mood-badge--{todayEntry.mood}">
                  {todayEntry.mood}
                </span>
              </div>
              <p className="entry-display__text">{todayEntry.content}</p>
            </div>
          </div>
        )}

        <CalendarHeatMap data={heatMapData} onDateClick={handleDateClick} />
      </div>
    </div>
  );
};
