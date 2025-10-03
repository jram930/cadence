import React from 'react';
import { MoodType } from '../types';
import './MoodSelector.css';

interface MoodSelectorProps {
  value: MoodType;
  onChange: (mood: MoodType) => void;
}

const moods: { type: MoodType; emoji: string; label: string }[] = [
  { type: MoodType.AMAZING, emoji: '🤩', label: 'Amazing' },
  { type: MoodType.GOOD, emoji: '😊', label: 'Good' },
  { type: MoodType.OKAY, emoji: '😐', label: 'Okay' },
  { type: MoodType.BAD, emoji: '😞', label: 'Bad' },
  { type: MoodType.TERRIBLE, emoji: '😢', label: 'Terrible' },
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
            <span className="mood-option__emoji">{mood.emoji}</span>
            <span className="mood-option__label">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
