'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { BookOpen, Clock, AlertTriangle, DollarSign, ArrowRight, BookMarked } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface IssueRecord {
  id: string; issueDate: string; dueDate: string; status: string;
  book: { title: string; author: string; coverImage?: string | null };
  fine: { amount: number; status: string } | null;
}

export default function UserDashboard() {
  const { data: session } = useSession();
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/borrow/history')
      .then(r => r.json())
      .then(json => { if (json.success) setIssues(json.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const activeIssues = issues.filter(i => i.status === 'ISSUED' || i.status === 'OVERDUE');
  const overdueCount = issues.filter(i => i.status === 'OVERDUE').length;
  const pendingFines = issues.filter(i => i.fine?.status === 'PENDING').reduce((acc, i) => acc + (i.fine?.amount || 0), 0);

  if (loading) return (
    <div className="animate-fade-in">
      <div className="skeleton" style={{ height: 120, borderRadius: 16, marginBottom: '1.5rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
      </div>
      <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
    </div>
  );

  const firstName = session?.user?.name?.split(' ')[0] || 'Member';

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2>Good {getGreeting()}, {firstName}! 👋</h2>
              <p>Here's a summary of your library activity</p>
            </div>
            <Link href="/user/catalog" className="btn" style={{
              background: 'rgba(255,255,255,0.15)', color: 'white',
              border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
            }}>
              <BookOpen size={16} />
              Browse Books
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#EEF2FF' }}>
            <BookMarked size={20} color="#4F46E5" />
          </div>
          <div className="stat-card-label">Currently Borrowed</div>
          <div className="stat-card-value">{activeIssues.length}</div>
          <div className="stat-card-trend">books in hand</div>
        </div>

        <div className="stat-card" style={{ borderColor: overdueCount > 0 ? '#FCA5A5' : 'var(--border)' }}>
          <div className="stat-card-icon" style={{ background: overdueCount > 0 ? '#FEE2E2' : '#F3F4F6' }}>
            <AlertTriangle size={20} color={overdueCount > 0 ? '#EF4444' : '#9CA3AF'} />
          </div>
          <div className="stat-card-label">Overdue Books</div>
          <div className="stat-card-value" style={{ color: overdueCount > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
            {overdueCount}
          </div>
          <div className="stat-card-trend">{overdueCount > 0 ? '⚠️ Please return soon' : 'all on time'}</div>
        </div>

        <div className="stat-card" style={{ borderColor: pendingFines > 0 ? '#FDE68A' : 'var(--border)' }}>
          <div className="stat-card-icon" style={{ background: pendingFines > 0 ? '#FEF3C7' : '#F3F4F6' }}>
            <DollarSign size={20} color={pendingFines > 0 ? '#F59E0B' : '#9CA3AF'} />
          </div>
          <div className="stat-card-label">Pending Fines</div>
          <div className="stat-card-value" style={{ color: pendingFines > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
            ₹{pendingFines.toFixed(0)}
          </div>
          <div className="stat-card-trend">{pendingFines > 0 ? 'needs payment' : 'no dues'}</div>
        </div>
      </div>

      {/* Currently Borrowed */}
      <div className="table-wrapper">
        <div className="table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div className="content-card-icon" style={{ background: 'var(--accent-light)' }}>
              <Clock size={15} color="var(--accent)" />
            </div>
            <div>
              <div className="card-title">Currently Borrowed</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeIssues.length} active {activeIssues.length === 1 ? 'book' : 'books'}</div>
            </div>
          </div>
          <Link href="/user/history" className="btn btn-secondary btn-sm">
            View All History <ArrowRight size={13} />
          </Link>
        </div>

        {activeIssues.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><BookOpen size={22} /></div>
            <h3>No books borrowed</h3>
            <p>You don't have any books currently. Browse the catalog to find something to read!</p>
            <Link href="/user/catalog" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div>
            {activeIssues.map((issue, i) => {
              const daysLeft = Math.ceil((new Date(issue.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isOverdue = daysLeft < 0;
              return (
                <div key={issue.id} className="issue-row animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      {issue.book.coverImage ? (
                        <img src={issue.book.coverImage} alt={issue.book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%',
                          background: `hsl(${(i * 67) % 360}, 70%, 92%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <BookOpen size={18} color={`hsl(${(i * 67) % 360}, 60%, 40%)`} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{issue.book.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 1 }}>
                        {issue.book.author} · Due: {formatDate(issue.dueDate)}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${isOverdue ? 'badge-red' : daysLeft <= 3 ? 'badge-yellow' : 'badge-green'}`}>
                    {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginTop: '1.25rem' }}>
        {[
          { href: '/user/catalog',  icon: '📚', label: 'Browse Catalog',  desc: 'Find your next book' },
          { href: '/user/history',  icon: '🕐', label: 'Borrow History',  desc: 'Past borrowings' },
          { href: '/user/fines',    icon: '💳', label: 'My Fines',        desc: 'View & pay fines' },
        ].map(action => (
          <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{action.icon}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.125rem' }}>{action.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{action.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
