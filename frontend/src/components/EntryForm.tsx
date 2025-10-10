import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { MoodType, Entry } from '../types';
import { MoodSelector } from './MoodSelector';
import { api } from '../services/api';
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
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showEnhanceModal, setShowEnhanceModal] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');

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

  const handleEnhance = async () => {
    if (!content.trim()) {
      alert('Please write some content first before enhancing.');
      return;
    }

    setIsEnhancing(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const result = await api.enhanceNote(content, today);

      setOriginalContent(content);
      setEnhancedContent(result.enhancedContent);
      setShowEnhanceModal(true);
    } catch (error: any) {
      console.error('Error enhancing note:', error);
      alert(error.message || 'Failed to enhance note. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAcceptEnhancement = () => {
    setContent(enhancedContent);
    setShowEnhanceModal(false);
    setOriginalContent('');
    setEnhancedContent('');
  };

  const handleRejectEnhancement = () => {
    setShowEnhanceModal(false);
    setOriginalContent('');
    setEnhancedContent('');
  };

  return (
    <>
      <form className="entry-form" onSubmit={handleSubmit}>
        <MoodSelector value={mood} onChange={setMood} />

        <div className="entry-form__field">
          <div className="entry-form__tabs">
            <div className="entry-form__tabs-left">
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
            <button
              type="button"
              className="entry-form__ai-button"
              onClick={handleEnhance}
              disabled={isEnhancing || isSubmitting || !content.trim()}
              title="Enhance note with AI"
            >
              {isEnhancing ? '✨ Enhancing...' : '✨ AI Enhance'}
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

      {showEnhanceModal && (
        <div className="enhance-modal-overlay" onClick={handleRejectEnhancement}>
          <div className="enhance-modal" onClick={(e) => e.stopPropagation()}>
            <div className="enhance-modal__header">
              <h3>✨ AI Enhanced Note</h3>
              <button
                className="enhance-modal__close"
                onClick={handleRejectEnhancement}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="enhance-modal__content">
              <div className="enhance-modal__section">
                <h4>Original</h4>
                <div className="enhance-modal__text">
                  <ReactMarkdown>{originalContent}</ReactMarkdown>
                </div>
              </div>

              <div className="enhance-modal__divider">→</div>

              <div className="enhance-modal__section">
                <h4>Enhanced</h4>
                <div className="enhance-modal__text enhance-modal__text--enhanced">
                  <ReactMarkdown>{enhancedContent}</ReactMarkdown>
                </div>
              </div>
            </div>

            <div className="enhance-modal__actions">
              <button
                type="button"
                className="button button--secondary"
                onClick={handleRejectEnhancement}
              >
                Keep Original
              </button>
              <button
                type="button"
                className="button button--primary"
                onClick={handleAcceptEnhancement}
              >
                Use Enhanced Version
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
