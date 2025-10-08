import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__content">
        <p className="footer__copyright">
          © {currentYear} Jared Ramsey. All rights reserved.
        </p>
        <div className="footer__links">
          <a
            href="https://github.com/jram930/micro-journal"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
          >
            GitHub
          </a>
          <span className="footer__separator">•</span>
          <a
            href="https://github.com/jram930/micro-journal/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
          >
            MIT License
          </a>
        </div>
      </div>
    </footer>
  );
};
