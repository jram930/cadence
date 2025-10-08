import React, { useState, useEffect } from 'react';
import './AdminView.css';

interface AdminStats {
  totalUsers: number;
  recentUsers: number;
  usersWithEntries: number;
  totalEntries: number;
  topUsers: Array<{
    username: string;
    entryCount: number;
  }>;
  totalAiQueries: number;
  recentAiQueries: number;
  timestamp: string;
}

export const AdminView: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Admin access required');
        }
        throw new Error('Failed to fetch admin stats');
      }

      const data = await response.json();
      setStats(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-view">
        <div className="admin-view__loading">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-view">
        <div className="admin-view__error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="admin-view">
      <header className="admin-view__header">
        <h1 className="admin-view__title">Admin Dashboard</h1>
        <p className="admin-view__subtitle">
          Last updated: {new Date(stats.timestamp).toLocaleString()}
        </p>
        <button className="admin-view__refresh" onClick={fetchStats}>
          Refresh
        </button>
      </header>

      <div className="admin-view__content">
        {/* User Stats */}
        <section className="admin-section">
          <h2 className="admin-section__title">User Statistics</h2>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-card__value">{stats.totalUsers}</div>
              <div className="admin-stat-card__label">Total Users</div>
            </div>

            <div className="admin-stat-card admin-stat-card--highlight">
              <div className="admin-stat-card__value">{stats.recentUsers}</div>
              <div className="admin-stat-card__label">New Users (24h)</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-card__value">{stats.usersWithEntries}</div>
              <div className="admin-stat-card__label">Active Users</div>
              <div className="admin-stat-card__note">Users with ≥1 entry</div>
            </div>
          </div>
        </section>

        {/* Entry Stats */}
        <section className="admin-section">
          <h2 className="admin-section__title">Entry Statistics</h2>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-card__value">{stats.totalEntries}</div>
              <div className="admin-stat-card__label">Total Entries</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-card__value">
                {stats.totalUsers > 0
                  ? (stats.totalEntries / stats.totalUsers).toFixed(1)
                  : '0.0'}
              </div>
              <div className="admin-stat-card__label">Avg Entries per User</div>
            </div>
          </div>
        </section>

        {/* AI Query Stats */}
        <section className="admin-section">
          <h2 className="admin-section__title">AI Query Statistics</h2>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-card__value">{stats.totalAiQueries}</div>
              <div className="admin-stat-card__label">Total AI Queries</div>
            </div>

            <div className="admin-stat-card admin-stat-card--highlight">
              <div className="admin-stat-card__value">{stats.recentAiQueries}</div>
              <div className="admin-stat-card__label">AI Queries (24h)</div>
            </div>
          </div>
        </section>

        {/* Top Users */}
        <section className="admin-section admin-section--full">
          <h2 className="admin-section__title">Top 10 Most Active Users</h2>
          {stats.topUsers.length > 0 ? (
            <div className="admin-table">
              <table className="admin-table__table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Username</th>
                    <th>Entry Count</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topUsers.map((user, index) => (
                    <tr key={user.username}>
                      <td className="admin-table__rank">
                        {index + 1}
                        {index === 0 && ' 🏆'}
                        {index === 1 && ' 🥈'}
                        {index === 2 && ' 🥉'}
                      </td>
                      <td className="admin-table__username">{user.username}</td>
                      <td className="admin-table__count">{user.entryCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="admin-section__empty">No active users yet</p>
          )}
        </section>
      </div>
    </div>
  );
};
