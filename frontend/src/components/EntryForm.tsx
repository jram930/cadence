import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MoodType, Entry } from '../types';
import { MoodSelector } from './MoodSelector';
import './EntryForm.css';

interface EntryFormProps {
  entry?: Entry | null;
  onSubmit: (content: string, mood: MoodType) => Promise<void>;
  onCancel?: () => void;
}

type Tab = 'write' | 'preview';

export const EntryForm: React.FC<EntryFormProps> = ({ entry, onSubmit, onCancel }) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType>(MoodType.OKAY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('write');

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
        <div className="entry-form__tabs">
          <button
            type="button"
            className={`entry-form__tab ${activeTab === 'write' ? 'entry-form__tab--active' : ''}`}
            onClick={() => setActiveTab('write')}
          >
            Write
          </button>
          <button
            type="button"
            className={`entry-form__tab ${activeTab === 'preview' ? 'entry-form__tab--active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </div>

        {activeTab === 'write' ? (
          <textarea
            id="entry-content"
            className="entry-form__textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts here... (Markdown supported)"
            rows={10}
            disabled={isSubmitting}
            required
          />
        ) : (
          <div className="entry-form__preview">
            {content.trim() ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p className="entry-form__preview-empty">Nothing to preview</p>
            )}
          </div>
        )}
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
