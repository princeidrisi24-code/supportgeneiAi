'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConnectionModal from '@/app/components/ConnectionModal';

const DEMO_EMAIL = 'guest@wedcraft.demo';
const DEMO_PASSWORD = 'demo123456';

export default function LoginPage() {
  const { signIn, user, loading: authLoading, isLocalMode } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  // Redirect if already logged in
  if (!authLoading && user) {
    router.replace('/');
    return null;
  }

  const validate = () => {
    if (!email.trim()) return 'Please enter your email address.';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address.';
    if (!password) return 'Please enter your password.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email.trim().toLowerCase(), password);
      if (result.error) {
        let message = result.error;
        if (message.includes('Invalid login credentials')) {
          message = 'Invalid email or password. Please check and try again.';
        } else if (message.includes('Email not confirmed')) {
          message = 'Your email is not confirmed yet. Please confirm your user in Supabase Authentication.';
        }
        setError(message);
      } else {
        router.replace('/');
      }
    } catch {
      setError('Something went wrong during sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      const result = await signIn(DEMO_EMAIL, DEMO_PASSWORD);
      if (result.error) {
        setError(result.error);
      } else {
        router.replace('/');
      }
    } catch {
      setError('Something went wrong with demo login. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="loading-spinner-container">
          <div className="loading-spinner-text">Loading WedCraft...</div>
        </div>
      </div>
    );
  }

  const isAnyLoading = loading || demoLoading;

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Top Connection Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowConnectionModal(true)}
            style={{ fontSize: '12px', padding: '4px 8px', color: 'var(--color-primary)' }}
            title="Configure Supabase & GitHub credentials"
          >
            ⚙️ Connect Supabase &amp; GitHub
          </button>
          <span
            className="badge"
            style={{
              fontSize: '11px',
              background: isLocalMode ? 'var(--color-warning-bg)' : 'var(--color-primary-subtle)',
              color: isLocalMode ? 'var(--color-warning)' : 'var(--color-primary)',
            }}
          >
            {isLocalMode ? '🟡 Local Storage' : '☁️ Cloud Ready'}
          </span>
        </div>

        <div className="auth-logo">
          <div className="auth-logo-icon">💍</div>
          <span className="auth-logo-text">WedCraft</span>
        </div>

        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue planning your perfect day</p>

        {error && (
          <div className="auth-error" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span>⚠️</span>
            <div style={{ flex: 1 }}>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className={`form-input ${error && !email ? 'error' : ''}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              autoComplete="email"
              disabled={isAnyLoading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className={`form-input ${error && !password ? 'error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
                disabled={isAnyLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '15px',
                  color: 'var(--color-text-muted)',
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isAnyLoading}
            style={{ width: '100%', height: '44px', fontSize: '15px', marginTop: '8px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          margin: '20px 0', color: 'var(--color-text-muted)', fontSize: '13px',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border-light)' }} />
          <span>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border-light)' }} />
        </div>

        {/* Guest Demo Button */}
        <button
          type="button"
          className="btn btn-accent w-full"
          disabled={isAnyLoading}
          onClick={handleDemoLogin}
          style={{
            width: '100%',
            height: '44px',
            fontSize: '15px',
            gap: '8px',
          }}
        >
          {demoLoading ? (
            '✨ Logging into demo...'
          ) : (
            <>✨ Try Demo — Guest Login</>
          )}
        </button>
        <p style={{
          textAlign: 'center', fontSize: '11px', color: 'var(--color-text-muted)',
          marginTop: '8px', lineHeight: 1.4,
        }}>
          Explore WedCraft instantly with sample data
        </p>

        <div className="auth-footer" style={{ marginTop: '20px' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ fontWeight: 600 }}>Create one</Link>
        </div>
      </div>

      {showConnectionModal && (
        <ConnectionModal onClose={() => setShowConnectionModal(false)} />
      )}
    </div>
  );
}
