import React, { useState } from 'react';
import { api } from '../services/api';
import './AIChat.css';

interface RelevantEntry {
  id: string;
  date: string;
  content: string;
  mood: string;
}

interface AIChatProps {
  onQuerySent?: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ onQuerySent }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [relevantEntries, setRelevantEntries] = useState<RelevantEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      return;
    }

    setLoading(true);
    setError('');
    setShowResults(false);

    try {
      const result = await api.queryAI(question);
      setAnswer(result.answer);
      setRelevantEntries(result.relevantEntries);
      setShowResults(true);

      // Notify parent that a query was sent
      if (onQuerySent) {
        onQuerySent();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to query AI');
    } finally {
      setLoading(false);
    }
  };

  const exampleQuestions = [
    'What were my happiest moments?',
    'When did I feel most productive?',
    'What challenges have I been facing?',
    'How has my mood changed over time?',
  ];

  return (
    <div className="ai-chat">
      <form onSubmit={handleSubmit} className="ai-chat__form">
        <div className="ai-chat__input-group">
          <input
            type="text"
            className="ai-chat__input"
            placeholder="Ask a question about your journal entries..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="ai-chat__submit"
            disabled={loading || !question.trim()}
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </div>

        <div className="ai-chat__examples">
          <span className="ai-chat__examples-label">Try asking:</span>
          {exampleQuestions.map((example, index) => (
            <button
              key={index}
              type="button"
              className="ai-chat__example-btn"
              onClick={() => setQuestion(example)}
              disabled={loading}
            >
              {example}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <div className="ai-chat__error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {showResults && (
        <div className="ai-chat__results">
          <div className="ai-chat__answer">
            <h3 className="ai-chat__answer-title">Answer</h3>
            <p className="ai-chat__answer-text">{answer}</p>
          </div>

          {relevantEntries.length > 0 && (
            <div className="ai-chat__entries">
              <h3 className="ai-chat__entries-title">
                Related Entries ({relevantEntries.length})
              </h3>
              <div className="ai-chat__entries-list">
                {relevantEntries.map((entry) => (
                  <div key={entry.id} className="ai-chat__entry">
                    <div className="ai-chat__entry-header">
                      <span className="ai-chat__entry-date">{entry.date}</span>
                      <span className={`ai-chat__entry-mood mood-badge--${entry.mood}`}>
                        {entry.mood}
                      </span>
                    </div>
                    <p className="ai-chat__entry-content">{entry.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
