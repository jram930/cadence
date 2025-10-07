import React, { useState, useEffect } from 'react';
import { AIChat } from './AIChat';
import './AIView.css';

export const AIView: React.FC = () => {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number>(5);

  useEffect(() => {
    fetchRateLimit();
  }, []);

  const fetchRateLimit = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/ai/rate-limit', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRemaining(data.remaining);
        setLimit(data.limit);
      }
    } catch (error) {
      console.error('Error fetching rate limit:', error);
    }
  };

  const handleQuerySent = () => {
    // Decrement the counter when a query is sent
    if (remaining !== null && remaining > 0) {
      setRemaining(remaining - 1);
    }
  };

  return (
    <div className="ai-view">
      <header className="ai-view__header">
        <h2 className="ai-view__title">AI Insights</h2>
        <p className="ai-view__subtitle">
          Ask questions about your journal entries and get thoughtful insights
        </p>
        {remaining !== null && (
          <div className="ai-view__rate-limit">
            <span className="ai-view__rate-limit-text">
              Queries remaining: <strong>{remaining}/{limit}</strong>
            </span>
            <span className="ai-view__rate-limit-note">
              (Resets hourly)
            </span>
          </div>
        )}
      </header>

      <div className="ai-view__content">
        <AIChat onQuerySent={handleQuerySent} />
      </div>
    </div>
  );
};
