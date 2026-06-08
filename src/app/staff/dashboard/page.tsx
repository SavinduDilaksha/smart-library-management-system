'use client';

import { useEffect, useState } from 'react';
import { BookOpen, ArrowLeftRight, AlertTriangle, BookCheck, Clock, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface DashboardData {
  totalBooks: number; issuedToday: number; overdueBooks: number; availableBooks: number;
  recentIssues: Array<{ id: string; status: string; user: { name: string }; book: { title: string }; issueDate: string }>;
  recentActivities: Array<{ id: string; action: string; details: string; timestamp: string; user: { name: string } }>;
}

export default function StaffDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(json => { if (json.success) setData(json.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="animate-fade-in">
      <div className="skeleton" style={{ height: 28, width: 200, marginBottom: '1.5rem', borderRadius: 8 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 12 }} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="skeleton" style={{ height: 280, borderRadius: 12 }} />
        <div className="skeleton" style={{ height: 280, borderRadius: 12 }} />
      </div>
    </div>
  );

  const stats = [
    { label: 'Available Books', value: data?.availableBooks || 0, icon: BookOpen,       color: '#10B981', bg: '#D1FAE5', href: '/staff/borrowed-books', note: 'in stock' },
    { label: 'Issued Today',    value: data?.issuedToday || 0,    icon: ArrowLeftRight, color: '#3B82F6', bg: '#DBEAFE', href: '/staff/borrowed-books', note: 'transactions' },
    { label: 'Overdue Books',   value: data?.overdueBooks || 0,   icon: AlertTriangle,  color: '#EF4444', bg: '#FEE2E2', href: '/staff/overdue-books',  note: 'need attention' },
    { label: 'Total Books',     value: data?.totalBooks || 0,     icon: BookCheck,      color: '#8B5CF6', bg: '#EDE9FE', href: '/staff/borrowed-books', note: 'in catalog' },
  ];

  const statusBadge = (status: string) => {
    if (status === 'ISSUED')   return <span className="badge badge-blue">Issued</span>;
    if (status === 'OVERDUE')  return <span className="badge badge-red">Overdue</span>;
    if (status === 'RETURNED') return <span className="badge badge-green">Returned</span>;
    return <span className="badge badge-gray">{status}</span>;
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1>Staff Dashboard</h1>
        <p>Today's library operations overview · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Quick Actions Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
        <Link href="/staff/issue-book" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #059669, #0D9488)', borderRadius: 12, padding: '1.25rem',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'all 0.2s', cursor: 'pointer',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Action</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>Issue a Book</div>
              <div style={{ fontSize: '0.8125rem', opacity: 0.8, marginTop: '0.25rem' }}>Issue books to registered members</div>
            </div>
            <ArrowRight size={24} style={{ opacity: 0.8 }} />
          </div>
        </Link>
        <Link href="/staff/return-book" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: 12, padding: '1.25rem',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'all 0.2s', cursor: 'pointer',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Action</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>Return a Book</div>
              <div style={{ fontSize: '0.8125rem', opacity: 0.8, marginTop: '0.25rem' }}>Process returns & calculate fines</div>
            </div>
            <ArrowRight size={24} style={{ opacity: 0.8 }} />
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
              <div className="stat-card animate-fade-in" style={{ animationDelay: `${i * 0.05}s`, cursor: 'pointer' }}>
                <div className="stat-card-icon" style={{ background: s.bg }}>
                  <Icon size={20} color={s.color} />
                </div>
                <div className="stat-card-label">{s.label}</div>
                <div className="stat-card-value">{s.value}</div>
                <div className="stat-card-trend">{s.note}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Content Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Recent Issues */}
        <div className="table-wrapper">
          <div className="table-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div className="content-card-icon" style={{ background: '#DBEAFE' }}>
                <Clock size={15} color="#3B82F6" />
              </div>
              <div className="card-title">Recent Issues</div>
            </div>
            <Link href="/staff/borrowed-books" className="btn btn-secondary btn-sm">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div>
            {!data?.recentIssues?.length ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No recent issues</p>
              </div>
            ) : data.recentIssues.map(issue => (
              <div key={issue.id} className="issue-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={15} color="#3B82F6" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{issue.book.title}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>to {issue.user.name} · {formatDate(issue.issueDate)}</div>
                  </div>
                </div>
                {statusBadge(issue.status)}
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="table-wrapper">
          <div className="table-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div className="content-card-icon" style={{ background: '#D1FAE5' }}>
                <Activity size={15} color="#059669" />
              </div>
              <div className="card-title">Activity Log</div>
            </div>
          </div>
          <div>
            {!data?.recentActivities?.length ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No activity yet</p>
              </div>
            ) : data.recentActivities.map(a => (
              <div key={a.id} className="activity-row">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', flexShrink: 0, marginTop: 6 }} />
                <div>
                  <div className="activity-row-text">{a.details || a.action}</div>
                  <div className="activity-row-meta">by {a.user.name} · {formatDate(a.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
