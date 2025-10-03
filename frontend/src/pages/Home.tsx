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
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
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
      const [entry, entries, streak, heatmap] = await Promise.all([
        api.getEntryByDate(today),
        api.getEntries(),
        api.getStreakData(),
        api.getHeatMapData(365),
      ]);

      setTodayEntry(entry);
      setAllEntries(entries);
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

  const isToday = (entryDate: string) => {
    return entryDate === today;
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

        <CalendarHeatMap data={heatMapData} onDateClick={handleDateClick} />

        <div className="entries-list">
          <h2 className="entries-list__title">Journal Entries</h2>

          {!todayEntry || editMode ? (
            <EntryForm
              entry={todayEntry}
              onSubmit={handleSubmit}
              onCancel={todayEntry && editMode ? () => setEditMode(false) : undefined}
            />
          ) : null}

          <div className="entries-list__scroll">
            {allEntries.map((entry) => {
              const isTodayEntry = isToday(entry.entryDate);

              if (isTodayEntry && !editMode) {
                return (
                  <div key={entry.id} className="entry-display entry-display--today">
                    <div className="entry-display__header">
                      <div className="entry-display__date">
                        {format(new Date(entry.entryDate), 'EEEE, MMMM d, yyyy')} (Today)
                      </div>
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
                        Mood: <span className={`mood-badge mood-badge--${entry.mood}`}>
                          {entry.mood}
                        </span>
                      </div>
                      <p className="entry-display__text">{entry.content}</p>
                    </div>
                  </div>
                );
              } else if (!isTodayEntry) {
                return (
                  <div key={entry.id} className="entry-display entry-display--past">
                    <div className="entry-display__header">
                      <div className="entry-display__date">
                        {format(new Date(entry.entryDate), 'EEEE, MMMM d, yyyy')}
                      </div>
                    </div>
                    <div className="entry-display__content">
                      <div className="entry-display__mood">
                        Mood: <span className={`mood-badge mood-badge--${entry.mood}`}>
                          {entry.mood}
                        </span>
                      </div>
                      <p className="entry-display__text">{entry.content}</p>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
