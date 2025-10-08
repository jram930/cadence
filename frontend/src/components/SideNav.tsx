import React from 'react';
import './SideNav.css';

export type View = 'journal' | 'stats' | 'ai' | 'about';

interface SideNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout?: () => void;
}

export const SideNav: React.FC<SideNavProps> = ({ currentView, onViewChange, onLogout }) => {
  return (
    <nav className="sidenav">
      <div className="sidenav__header">
        <h1 className="sidenav__title">Cadence</h1>
      </div>

      <div className="sidenav__items">
        <button
          className={`sidenav__item ${currentView === 'journal' ? 'sidenav__item--active' : ''}`}
          onClick={() => onViewChange('journal')}
        >
          <svg className="sidenav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span className="sidenav__label">Journal</span>
        </button>

        <button
          className={`sidenav__item ${currentView === 'stats' ? 'sidenav__item--active' : ''}`}
          onClick={() => onViewChange('stats')}
        >
          <svg className="sidenav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
          </svg>
          <span className="sidenav__label">Stats</span>
        </button>

        <button
          className={`sidenav__item ${currentView === 'ai' ? 'sidenav__item--active' : ''}`}
          onClick={() => onViewChange('ai')}
        >
          <svg className="sidenav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h-1.73c.34.6.73 1.26.73 2a2 2 0 1 1-4 0c0-.74.4-1.39 1-1.73V14a5 5 0 0 0-5-5h-1v1.73c.6.34 1 .99 1 1.73a2 2 0 1 1-4 0c0-.74.4-1.39 1-1.73V9H8a5 5 0 0 0-5 5v.27c.6.34 1 .99 1 1.73a2 2 0 1 1-4 0c0-.74.4-1.39 1-1.73V14a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
          </svg>
          <span className="sidenav__label">AI Insights</span>
        </button>

        <button
          className={`sidenav__item ${currentView === 'about' ? 'sidenav__item--active' : ''}`}
          onClick={() => onViewChange('about')}
        >
          <svg className="sidenav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span className="sidenav__label">About</span>
        </button>
      </div>

      {onLogout && (
        <div className="sidenav__footer">
          <button className="sidenav__logout" onClick={onLogout}>
            <svg className="sidenav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="sidenav__label">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};
