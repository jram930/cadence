import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { MoodType, StreakData, HeatMapData, AverageMoodData, Entry } from '../types';
import { SideNav, View } from '../components/SideNav';
import { JournalView } from '../components/JournalView';
import { StatsView } from '../components/StatsView';
import { AIView } from '../components/AIView';
import { AboutView } from '../components/AboutView';
import './Home.css';

export const Home: React.FC = () => {
  const { view } = useParams<{ view: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentView = (view as View) || 'journal';
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [heatMapData, setHeatMapData] = useState<HeatMapData[]>([]);
  const [averageMoodData, setAverageMoodData] = useState<AverageMoodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    loadData();
    checkFirstTimeUser();
  }, []);

  const checkFirstTimeUser = () => {
    const hasVisited = localStorage.getItem('has_visited');
    if (!hasVisited) {
      // First time user - navigate to about page
      navigate('/about');
      // Mark as visited
      localStorage.setItem('has_visited', 'true');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [entry, entries, streak, heatmap, averageMood] = await Promise.all([
        api.getEntryByDate(today),
        api.getEntries(),
        api.getStreakData(),
        api.getHeatMapData(365),
        api.getAverageMoodData(),
      ]);

      setTodayEntry(entry);
      setAllEntries(entries);
      setStreakData(streak);
      setHeatMapData(heatmap);
      setAverageMoodData(averageMood);
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

  const renderView = () => {
    switch (currentView) {
      case 'journal':
        return (
          <JournalView
            todayEntry={todayEntry}
            allEntries={allEntries}
            editMode={editMode}
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={() => setEditMode(false)}
            onEdit={() => setEditMode(true)}
            onDelete={handleDelete}
          />
        );
      case 'stats':
        return (
          <StatsView
            streakData={streakData}
            heatMapData={heatMapData}
            averageMoodData={averageMoodData}
            loading={loading}
            onDateClick={handleDateClick}
          />
        );
      case 'ai':
        return <AIView />;
      case 'about':
        return <AboutView />;
      default:
        return null;
    }
  };

  const handleViewChange = (newView: View) => {
    navigate(`/${newView}`);
  };

  return (
    <div className="home">
      <SideNav currentView={currentView} onViewChange={handleViewChange} onLogout={logout} />
      <div className="home__content">
        {renderView()}
      </div>
    </div>
  );
};
