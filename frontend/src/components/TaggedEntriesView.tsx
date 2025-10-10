import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';
import { Entry } from '../types';
import { MoodIcon } from './MoodIcon';
import './TaggedEntriesView.css';

interface TaggedEntriesViewProps {
  tagName: string;
  onBack: () => void;
}

const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const TaggedEntriesView: React.FC<TaggedEntriesViewProps> = ({ tagName, onBack }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, [tagName]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const fetchedEntries = await api.getEntriesByTag(tagName);
      setEntries(fetchedEntries);
    } catch (error) {
      console.error('Error loading tagged entries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tagged-entries-view">
        <div className="tagged-entries-view__loading">Loading entries...</div>
      </div>
    );
  }

  return (
    <div className="tagged-entries-view">
      <header className="tagged-entries-view__header">
        <button className="tagged-entries-view__back" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Tags
        </button>
        <h2 className="tagged-entries-view__title">#{tagName}</h2>
        <p className="tagged-entries-view__subtitle">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </p>
      </header>

      {entries.length === 0 ? (
        <div className="tagged-entries-view__empty">
          <p>No entries found for this tag.</p>
        </div>
      ) : (
        <div className="tagged-entries-view__entries">
          {entries.map((entry) => (
            <div key={entry.id} className="tagged-entry-card">
              <div className="tagged-entry-card__header">
                <div className="tagged-entry-card__date">
                  {format(parseLocalDate(entry.entryDate), 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="tagged-entry-card__mood">
                  <span className={`mood-badge mood-badge--${entry.mood}`}>
                    <MoodIcon mood={entry.mood} size={16} />
                    <span>{entry.mood}</span>
                  </span>
                </div>
              </div>
              <div className="tagged-entry-card__content">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p style={{ whiteSpace: 'pre-wrap' }}>{children}</p>
                  }}
                >
                  {entry.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
