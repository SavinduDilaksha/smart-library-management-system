'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight,
  Library, BookMarked, Users, Shield,
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) setError('Invalid email or password. Please try again.');
      else { router.push('/'); router.refresh(); }
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  const quickLogin = async (qEmail: string, qPass: string) => {
    setError(''); setLoading(true);
    const result = await signIn('credentials', { email: qEmail, password: qPass, redirect: false });
    if (result?.error) { setError(result.error); setLoading(false); }
    else { router.push('/'); router.refresh(); }
  };

  return (
    <div className="auth-shell">
      {/* Left Panel — Branding */}
      <div className="auth-left">
        <div className="auth-left-pattern" />
        <div className="auth-left-content animate-fade-in">
          <div className="auth-left-logo">
            <Library size={40} color="white" />
          </div>
          <h1>Library Management System</h1>
          <p>
            A modern platform for managing books, members, staff, borrowings, and library operations — all in one place.
          </p>

          <div className="auth-features">
            <div className="auth-feature-item">
              <BookMarked size={18} color="white" />
              <span>Manage 1000s of books with ease</span>
            </div>
            <div className="auth-feature-item">
              <Users size={18} color="white" />
              <span>Track members & staff accounts</span>
            </div>
            <div className="auth-feature-item">
              <Shield size={18} color="white" />
              <span>Role-based access for Admin, Staff & Members</span>
            </div>
            <div className="auth-feature-item">
              <BookOpen size={18} color="white" />
              <span>Automated fines & due date alerts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-right">
        <div className="auth-form-box animate-fade-in">
          <h2 className="auth-form-title">Welcome back 👋</h2>
          <p className="auth-form-subtitle">Sign in to your account to continue</p>

          {error && (
            <div className="alert alert-danger animate-scale-in">
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0, marginTop: 2 }} />
              {error}
            </div>
          )}

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

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4375rem' }}>
                <label className="form-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                  style={{ paddingLeft: '0.875rem', paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              {loading ? <Loader2 size={19} className="animate-spin" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', margin: '1.5rem 0' }}>
            <div className="divider" style={{ flex: 1 }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Quick Demo Login
            </span>
            <div className="divider" style={{ flex: 1 }} />
          </div>

          <div className="auth-quick-btns">
            <button onClick={() => quickLogin('admin@library.com', 'Admin@123')} disabled={loading} className="quick-login-btn admin">
              🛡️ Admin
            </button>
            <button onClick={() => quickLogin('staff@library.com', 'Staff@123')} disabled={loading} className="quick-login-btn staff">
              💼 Staff
            </button>
            <button onClick={() => quickLogin('member@library.com', 'Member@123')} disabled={loading} className="quick-login-btn member">
              👤 Member
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
            New member?{' '}
            <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
