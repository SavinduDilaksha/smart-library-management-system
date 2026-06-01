'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ArrowRight, Library, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Registration failed');
      else {
        setSuccess('Registration successful! Please wait for staff approval before signing in.');
        setTimeout(() => router.push('/login'), 3500);
      }
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="auth-shell" style={{ gridTemplateColumns: '1fr' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-page)' }}>
          <div className="auth-form-box animate-scale-in" style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={32} color="var(--success)" />
            </div>
            <h2 className="auth-form-title">Account Created!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              Your registration is pending staff approval. You'll be redirected to the login page shortly.
            </p>
            <Link href="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Go to Login
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
          <h1>Join Our Library</h1>
          <p>Create a member account to browse our catalog, borrow books, and manage your reading journey.</p>

          <div className="auth-features" style={{ marginTop: '2rem' }}>
            <div className="auth-feature-item">
              <span style={{ fontSize: '1.25rem' }}>📚</span>
              <span>Access to thousands of books</span>
            </div>
            <div className="auth-feature-item">
              <span style={{ fontSize: '1.25rem' }}>🔔</span>
              <span>Due date reminders via email</span>
            </div>
            <div className="auth-feature-item">
              <span style={{ fontSize: '1.25rem' }}>📊</span>
              <span>Track your reading history</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-box animate-fade-in">
          <h2 className="auth-form-title">Create Account</h2>
          <p className="auth-form-subtitle">Register as a library member — pending staff approval</p>

          {error && (
            <div className="alert alert-danger animate-scale-in">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="input-icon-wrapper">
                <User size={16} className="input-icon-left" />
                <input id="name" type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input" placeholder="John Doe" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon-left" />
                <input id="email" type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input" placeholder="john@example.com" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <div className="input-icon-wrapper">
                <Phone size={16} className="input-icon-left" />
                <input id="phone" type="tel" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="input" placeholder="+94 71 000 0000" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input" placeholder="Min. 6 characters"
                  required minLength={6}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              {loading ? <Loader2 size={19} className="animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
