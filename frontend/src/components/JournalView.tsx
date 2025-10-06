import React from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Entry, MoodType } from '../types';
import { EntryForm } from './EntryForm';
import { MoodIcon } from './MoodIcon';
import './JournalView.css';

// Helper function to parse date string as local date (not UTC)
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

interface JournalViewProps {
  todayEntry: Entry | null;
  allEntries: Entry[];
  editMode: boolean;
  loading: boolean;
  onSubmit: (content: string, mood: MoodType) => Promise<void>;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  todayEntry,
  allEntries,
  editMode,
  loading,
  onSubmit,
  onCancel,
  onEdit,
  onDelete,
}) => {
  const today = format(new Date(), 'yyyy-MM-dd');

  const isToday = (entryDate: string) => {
    return entryDate === today;
  };

  return (
    <div className="journal-view">
      <header className="journal-view__header">
        <h2 className="journal-view__title">Journal Entries</h2>
        <p className="journal-view__subtitle">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </header>

      {!todayEntry || editMode ? (
        <div className="journal-view__form">
          <EntryForm
            entry={todayEntry}
            onSubmit={onSubmit}
            onCancel={todayEntry && editMode ? onCancel : undefined}
          />
        </div>
      ) : null}

      <div className="journal-view__entries">
        {loading ? (
          <div className="journal-view__loading">Loading entries...</div>
        ) : allEntries.length === 0 ? (
          <div className="journal-view__empty">
            <p>No journal entries yet. Start writing!</p>
          </div>
        ) : (
          allEntries.map((entry) => {
            const isTodayEntry = isToday(entry.entryDate);

            if (isTodayEntry && !editMode) {
              return (
                <div key={entry.id} className="entry-card entry-card--today">
                  <div className="entry-card__header">
                    <div className="entry-card__date">
                      {format(parseLocalDate(entry.entryDate), 'EEEE, MMMM d, yyyy')} (Today)
                    </div>
                    <div className="entry-card__actions">
                      <button
                        className="button button--icon"
                        onClick={onEdit}
                        aria-label="Edit entry"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="button button--icon button--danger"
                        onClick={onDelete}
                        aria-label="Delete entry"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="entry-card__content">
                    <div className="entry-card__mood">
                      <span className={`mood-badge mood-badge--${entry.mood}`}>
                        <MoodIcon mood={entry.mood} size={16} />
                        <span>{entry.mood}</span>
                      </span>
                    </div>
                    <div className="entry-card__markdown">
                      <ReactMarkdown>{entry.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            } else if (!isTodayEntry) {
              return (
                <div key={entry.id} className="entry-card entry-card--past">
                  <div className="entry-card__header">
                    <div className="entry-card__date">
                      {format(parseLocalDate(entry.entryDate), 'EEEE, MMMM d, yyyy')}
                    </div>
                  </div>
                  <div className="entry-card__content">
                    <div className="entry-card__mood">
                      <span className={`mood-badge mood-badge--${entry.mood}`}>
                        <MoodIcon mood={entry.mood} size={16} />
                        <span>{entry.mood}</span>
                      </span>
                    </div>
                    <div className="entry-card__markdown">
                      <ReactMarkdown>{entry.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })
        )}
      </div>
    </div>
  );
};
