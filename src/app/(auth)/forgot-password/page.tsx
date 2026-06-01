'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle2, Library } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending reset email
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="auth-shell" style={{ gridTemplateColumns: '1fr' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-page)' }}>
          <div className="auth-form-box animate-scale-in" style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={32} color="var(--success)" />
            </div>
            <h2 className="auth-form-title">Reset Email Sent!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
            </p>
            <Link href="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-pattern" />
        <div className="auth-left-content animate-fade-in">
          <div className="auth-left-logo">
            <Library size={40} color="white" />
          </div>
          <h1>Security & Access</h1>
          <p>Recover your account password securely using your registered email address.</p>

          <div className="auth-features" style={{ marginTop: '2rem' }}>
            <div className="auth-feature-item">
              <span style={{ fontSize: '1.25rem' }}>🔒</span>
              <span>Secure password encryption</span>
            </div>
            <div className="auth-feature-item">
              <span style={{ fontSize: '1.25rem' }}>🛡️</span>
              <span>Multi-factor authentication ready</span>
            </div>
            <div className="auth-feature-item">
              <span style={{ fontSize: '1.25rem' }}>⚡</span>
              <span>Instant recovery link generation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-box animate-fade-in">
          <h2 className="auth-form-title">Reset Password</h2>
          <p className="auth-form-subtitle">Enter your email to receive a password recovery link</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon-left" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? <Loader2 size={19} className="animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
            <Link href="/login" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', padding: 0, color: 'var(--accent)', fontWeight: 600 }}>
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

