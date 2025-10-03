import React, { useState, useEffect } from 'react';
import { MoodType, Entry } from '../types';
import { MoodSelector } from './MoodSelector';
import './EntryForm.css';

interface EntryFormProps {
  entry?: Entry | null;
  onSubmit: (content: string, mood: MoodType) => Promise<void>;
  onCancel?: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ entry, onSubmit, onCancel }) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType>(MoodType.OKAY);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (entry) {
      setContent(entry.content);
      setMood(entry.mood);
    }
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content, mood);
      if (!entry) {
        setContent('');
        setMood(MoodType.OKAY);
      }
    } catch (error) {
      console.error('Error submitting entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <MoodSelector value={mood} onChange={setMood} />

      <div className="entry-form__field">
        <label htmlFor="entry-content" className="entry-form__label">
          What's on your mind?
        </label>
        <textarea
          id="entry-content"
          className="entry-form__textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts here..."
          rows={6}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="entry-form__actions">
        {onCancel && (
          <button
            type="button"
            className="button button--secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="button button--primary"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? 'Saving...' : entry ? 'Update Entry' : 'Save Entry'}
        </button>
      </div>
    </form>
  );
};
