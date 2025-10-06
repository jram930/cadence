import React from 'react';
import { MoodType } from '../types';
import { MoodIcon } from './MoodIcon';
import './MoodSelector.css';

interface MoodSelectorProps {
  value: MoodType;
  onChange: (mood: MoodType) => void;
}

const moods: { type: MoodType; label: string }[] = [
  { type: MoodType.TERRIBLE, label: 'Terrible' },
  { type: MoodType.BAD, label: 'Bad' },
  { type: MoodType.OKAY, label: 'Okay' },
  { type: MoodType.GOOD, label: 'Good' },
  { type: MoodType.AMAZING, label: 'Amazing' },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="mood-selector">
      <label className="mood-selector__label">How are you feeling?</label>
      <div className="mood-selector__options">
        {moods.map((mood) => (
          <button
            key={mood.type}
            type="button"
            className={`mood-option ${value === mood.type ? 'mood-option--selected' : ''}`}
            onClick={() => onChange(mood.type)}
            aria-label={mood.label}
          >
            <span className="mood-option__icon">
              <MoodIcon mood={mood.type} size={24} />
            </span>
            <span className="mood-option__label">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
