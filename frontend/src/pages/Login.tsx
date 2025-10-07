import React, { useState } from 'react';
import './Login.css';

interface LoginProps {
  onLogin: (token: string) => void;
}

type Mode = 'login' | 'signup';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation for signup
    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (!email.includes('@')) {
        setError('Please enter a valid email');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body = mode === 'login'
        ? { username, password }
        : { username, email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `${mode === 'login' ? 'Login' : 'Signup'} failed`);
      }

      onLogin(data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="login">
      <div className="login__container">
        <div className="login__header">
          <h1 className="login__title">Cadence</h1>
          <p className="login__subtitle">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          {error && (
            <div className="login__error">
              {error}
            </div>
          )}

          <div className="login__field">
            <label className="login__label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="login__input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              autoFocus
            />
          </div>

          {mode === 'signup' && (
            <div className="login__field">
              <label className="login__label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="login__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          )}

          <div className="login__field">
            <label className="login__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="login__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Choose a password (min 6 characters)' : 'Enter your password'}
              required
            />
          </div>

          {mode === 'signup' && (
            <div className="login__field">
              <label className="login__label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="login__input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="login__button"
            disabled={loading}
          >
            {loading
              ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
              : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <div className="login__toggle">
          <button
            type="button"
            className="login__toggle-button"
            onClick={toggleMode}
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
