import React from 'react';
import { AIChat } from './AIChat';
import './AIView.css';

export const AIView: React.FC = () => {
  return (
    <div className="ai-view">
      <header className="ai-view__header">
        <h2 className="ai-view__title">AI Insights</h2>
        <p className="ai-view__subtitle">
          Ask questions about your journal entries and get thoughtful insights
        </p>
      </header>

      <div className="ai-view__content">
        <AIChat />
      </div>
    </div>
  );
};
