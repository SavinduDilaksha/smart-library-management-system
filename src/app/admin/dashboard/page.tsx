'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen, Users, UserCog, ArrowLeftRight, AlertTriangle,
  DollarSign, TrendingUp, BookCheck, Clock, Activity,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DashboardData {
  totalBooks: number; totalUsers: number; totalStaff: number;
  issuedToday: number; overdueBooks: number; totalFinesPending: number;
  totalFinesCollected: number; availableBooks: number;
  recentIssues: Array<{ id: string; issueDate: string; status: string; user: { name: string }; book: { title: string } }>;
  recentActivities: Array<{ id: string; action: string; details: string; timestamp: string; user: { name: string } }>;
}

const STATS = (d: DashboardData) => [
  { label: 'Total Books',     value: d.totalBooks,           icon: BookOpen,       color: '#4F46E5', bg: '#EEF2FF',  change: 'in catalog' },
  { label: 'Available',       value: d.availableBooks,       icon: BookCheck,      color: '#10B981', bg: '#D1FAE5',  change: 'ready to borrow' },
  { label: 'Members',         value: d.totalUsers,           icon: Users,          color: '#3B82F6', bg: '#DBEAFE',  change: 'registered' },
  { label: 'Staff',           value: d.totalStaff,           icon: UserCog,        color: '#8B5CF6', bg: '#EDE9FE',  change: 'accounts' },
  { label: 'Issued Today',    value: d.issuedToday,          icon: ArrowLeftRight, color: '#06B6D4', bg: '#CFFAFE',  change: 'transactions' },
  { label: 'Overdue',         value: d.overdueBooks,         icon: AlertTriangle,  color: '#EF4444', bg: '#FEE2E2',  change: 'books late' },
  { label: 'Fines Pending',   value: `₹${Math.round(d.totalFinesPending)}`,   icon: DollarSign,  color: '#F59E0B', bg: '#FEF3C7', change: 'to collect' },
  { label: 'Collected',       value: `₹${Math.round(d.totalFinesCollected)}`, icon: TrendingUp,  color: '#059669', bg: '#D1FAE5', change: 'total revenue' },
];

const statusBadge = (status: string) => {
  if (status === 'ISSUED')   return <span className="badge badge-blue">Issued</span>;
  if (status === 'OVERDUE')  return <span className="badge badge-red">Overdue</span>;
  if (status === 'RETURNED') return <span className="badge badge-green">Returned</span>;
  return <span className="badge badge-gray">{status}</span>;
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(j => { if (j.success) setData(j.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="animate-fade-in">
      <div className="skeleton" style={{ height: 28, width: 220, marginBottom: '1.5rem', borderRadius: 8 }} />
      <div className="stats-grid">
        {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 12 }} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="skeleton" style={{ height: 320, borderRadius: 12 }} />
        <div className="skeleton" style={{ height: 320, borderRadius: 12 }} />
      </div>
    </div>
  );

  const stats = STATS(data!);

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header-actions">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.375rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <Activity size={13} />
          Live data
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="stat-card-icon" style={{ background: s.bg }}>
                <Icon size={20} color={s.color} />
              </div>
              <div className="stat-card-label">{s.label}</div>
              <div className="stat-card-value" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
              <div className="stat-card-trend">{s.change}</div>
            </div>
          );
        })}
      </div>

      {/* Content Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Recent Issues */}
        <div className="table-wrapper">
          <div className="table-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div className="content-card-icon" style={{ background: 'var(--info-light)' }}>
                <Clock size={15} color="var(--info)" />
              </div>
              <div>
                <div className="card-title">Recent Issues</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{data?.recentIssues?.length || 0} recent records</div>
              </div>
            </div>
          </div>

          <div>
            {!data?.recentIssues?.length ? (
              <div className="empty-state" style={{ padding: '2.5rem' }}>
                <div className="empty-state-icon"><BookOpen size={22} /></div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No recent issues</p>
              </div>
            ) : data.recentIssues.map((issue, i) => (
              <div key={issue.id} className="issue-row animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={16} color="var(--accent)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{issue.book.title}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 1 }}>
                      {issue.user.name} · {formatDate(issue.issueDate)}
                    </div>
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
              <div className="content-card-icon" style={{ background: 'var(--success-light)' }}>
                <Activity size={15} color="var(--success)" />
              </div>
              <div>
                <div className="card-title">Activity Log</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{data?.recentActivities?.length || 0} recent events</div>
              </div>
            </div>
          </div>

          <div>
            {!data?.recentActivities?.length ? (
              <div className="empty-state" style={{ padding: '2.5rem' }}>
                <div className="empty-state-icon"><Activity size={22} /></div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No recent activity</p>
              </div>
            ) : data.recentActivities.map((a, i) => (
              <div key={a.id} className="activity-row animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', flexShrink: 0, marginTop: 6 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="activity-row-text">{a.details || a.action}</div>
                  <div className="activity-row-meta">{a.user.name} · {formatDate(a.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
