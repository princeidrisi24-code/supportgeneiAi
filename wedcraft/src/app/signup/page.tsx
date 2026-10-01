'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const { signUp, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    partner1: '',
    partner2: '',
    weddingDate: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!authLoading && user) {
    router.replace('/');
    return null;
  }

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    setError('');
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) errors.name = 'Full name is required.';
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!form.email.trim()) errors.email = 'Email is required.';
    else if (!emailRegex.test(form.email.trim())) errors.email = 'Enter a valid email address.';

    if (!form.password) errors.password = 'Password is required.';
    else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';

    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';

    if (!form.partner1.trim()) errors.partner1 = 'Partner 1 name is required.';
    if (!form.partner2.trim()) errors.partner2 = 'Partner 2 name is required.';
    if (!form.weddingDate) {
      errors.weddingDate = 'Wedding date is required.';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const parts = form.weddingDate.split('-');
      if (parts.length === 3) {
        const selected = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (selected < today) {
          errors.weddingDate = 'Wedding date cannot be in the past.';
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const result = await signUp(
        form.email.trim().toLowerCase(),
        form.password,
        form.name.trim(),
        form.partner1.trim(),
        form.partner2.trim(),
        form.weddingDate
      );
      if (result.error) {
        setError(result.error);
      } else {
        router.replace('/');
      }
    } catch {
      setError('Something went wrong during account creation. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">💍</div>
          <span className="auth-logo-text">WedCraft</span>
        </div>

        <h2 className="auth-title">Create Your Account</h2>
        <p className="auth-subtitle">Start planning the wedding of your dreams</p>

        {error && (
          <div className="auth-error" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span>⚠️</span>
            <div style={{ flex: 1 }}>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Your Full Name *</label>
            <input
              className={`form-input ${fieldErrors.name ? 'error' : ''}`}
              type="text"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              disabled={loading}
              required
            />
            {fieldErrors.name && <span className="form-helper error">{fieldErrors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              className={`form-input ${fieldErrors.email ? 'error' : ''}`}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              autoComplete="email"
              disabled={loading}
              required
            />
            {fieldErrors.email && <span className="form-helper error">{fieldErrors.email}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: '15px',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.password && <span className="form-helper error">{fieldErrors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                className={`form-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                disabled={loading}
                required
              />
              {fieldErrors.confirmPassword && <span className="form-helper error">{fieldErrors.confirmPassword}</span>}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-divider)', margin: '16px 0', paddingTop: '16px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-primary)' }}>
              💒 Wedding Details
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Partner 1 Name *</label>
              <input
                className={`form-input ${fieldErrors.partner1 ? 'error' : ''}`}
                type="text"
                placeholder="e.g. Rahul"
                value={form.partner1}
                onChange={(e) => update('partner1', e.target.value)}
                disabled={loading}
                required
              />
              {fieldErrors.partner1 && <span className="form-helper error">{fieldErrors.partner1}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Partner 2 Name *</label>
              <input
                className={`form-input ${fieldErrors.partner2 ? 'error' : ''}`}
                type="text"
                placeholder="e.g. Priya"
                value={form.partner2}
                onChange={(e) => update('partner2', e.target.value)}
                disabled={loading}
                required
              />
              {fieldErrors.partner2 && <span className="form-helper error">{fieldErrors.partner2}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Wedding Date *</label>
            <input
              className={`form-input ${fieldErrors.weddingDate ? 'error' : ''}`}
              type="date"
              value={form.weddingDate}
              onChange={(e) => update('weddingDate', e.target.value)}
              disabled={loading}
              required
            />
            {fieldErrors.weddingDate && <span className="form-helper error">{fieldErrors.weddingDate}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ width: '100%', height: '44px', fontSize: '15px', marginTop: '12px' }}
          >
            {loading ? 'Creating account...' : 'Create Account & Start Planning'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '20px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
