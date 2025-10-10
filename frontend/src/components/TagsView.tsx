import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Tag } from '../types';
import './TagsView.css';

interface TagsViewProps {
  onTagClick: (tagName: string) => void;
}

export const TagsView: React.FC<TagsViewProps> = ({ onTagClick }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const fetchedTags = await api.getTags();
      setTags(fetchedTags);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tags-view">
        <div className="tags-view__loading">Loading tags...</div>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="tags-view">
        <header className="tags-view__header">
          <h2 className="tags-view__title">Tags</h2>
          <p className="tags-view__subtitle">Organize your thoughts with hashtags</p>
        </header>
        <div className="tags-view__empty">
          <p>No tags yet! Use #hashtags in your journal entries to automatically create tags.</p>
          <p className="tags-view__hint">Example: "Today I worked on #goals and #productivity"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tags-view">
      <header className="tags-view__header">
        <h2 className="tags-view__title">Tags</h2>
        <p className="tags-view__subtitle">{tags.length} {tags.length === 1 ? 'tag' : 'tags'} found</p>
      </header>

      <div className="tags-view__grid">
        {tags.map((tag) => (
          <button
            key={tag.id}
            className="tag-card"
            onClick={() => onTagClick(tag.name)}
          >
            <div className="tag-card__name">#{tag.name}</div>
            <div className="tag-card__count">
              {tag.usageCount} {tag.usageCount === 1 ? 'entry' : 'entries'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
