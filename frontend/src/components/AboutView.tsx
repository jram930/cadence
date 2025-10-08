import React from 'react';
import './AboutView.css';

export const AboutView: React.FC = () => {
  return (
    <div className="about-view">
      <header className="about-view__header">
        <h1 className="about-view__title">Welcome to Cadence</h1>
        <p className="about-view__subtitle">
          Your personal journaling companion with AI-powered insights
        </p>
      </header>

      <div className="about-view__content">
        <section className="about-section">
          <div className="about-section__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <h2 className="about-section__title">What is Cadence?</h2>
          <p className="about-section__text">
            Cadence is a beautiful, thoughtful journaling app designed to help you reflect on your day,
            track your mood, and gain insights into your emotional patterns over time. Whether you're
            journaling for mental health, personal growth, or simply to remember your days, Cadence
            makes it easy and enjoyable.
          </p>
        </section>

        <section className="about-section">
          <div className="about-section__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </div>
          <h2 className="about-section__title">Key Features</h2>
          <ul className="about-section__list">
            <li><strong>Daily Journaling:</strong> Write your thoughts with Markdown support for rich formatting</li>
            <li><strong>Mood Tracking:</strong> Track how you're feeling each day with five mood levels</li>
            <li><strong>Visual Analytics:</strong> See your journaling streaks and mood patterns in beautiful charts</li>
            <li><strong>AI Insights:</strong> Ask questions about your entries and get thoughtful insights (5 queries per hour)</li>
            <li><strong>Privacy First:</strong> Your entries are private and secure</li>
          </ul>
        </section>

        <section className="about-section">
          <div className="about-section__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 className="about-section__title">Getting Started</h2>
          <div className="about-section__steps">
            <div className="about-step">
              <div className="about-step__number">1</div>
              <div className="about-step__content">
                <h3 className="about-step__title">Write Your First Entry</h3>
                <p className="about-step__text">
                  Navigate to the Journal tab and write about your day. Select a mood that represents how you're feeling.
                </p>
              </div>
            </div>

            <div className="about-step">
              <div className="about-step__number">2</div>
              <div className="about-step__content">
                <h3 className="about-step__title">Build Your Streak</h3>
                <p className="about-step__text">
                  Try to journal every day to build a streak. Check the Stats tab to see your progress and mood patterns.
                </p>
              </div>
            </div>

            <div className="about-step">
              <div className="about-step__number">3</div>
              <div className="about-step__content">
                <h3 className="about-step__title">Ask AI for Insights</h3>
                <p className="about-step__text">
                  Once you have a few entries, visit the AI Insights tab to ask questions like "What were my happiest moments?" or "When did I feel most productive?"
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section about-section--highlight">
          <h2 className="about-section__title">Why Journal?</h2>
          <p className="about-section__text">
            Journaling has been shown to reduce stress, improve mood, enhance self-awareness, and help
            process emotions. By making it a daily habit, you create a valuable record of your life and
            gain clarity on your thoughts and feelings. Cadence makes this practice simple, beautiful,
            and insightful.
          </p>
        </section>

        <section className="about-section about-section--cta">
          <h2 className="about-section__title">Ready to Begin?</h2>
          <p className="about-section__text">
            Start your journaling journey today. Head to the Journal tab and write your first entry!
          </p>
        </section>
      </div>
    </div>
  );
};
