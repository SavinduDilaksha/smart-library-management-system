'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, BookOpen, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface IssueRecord {
  id: string; dueDate: string; status: string;
  book: { title: string; author: string };
}

export default function UserReturnPage() {
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/borrow/history?status=ISSUED').then(r => r.json()),
      fetch('/api/borrow/history?status=OVERDUE').then(r => r.json()),
    ]).then(([issued, overdue]) => {
      setIssues([...(issued.data || []), ...(overdue.data || [])]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Return Status</h1>
        <p>Books currently in your possession that need to be returned</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="empty-state" style={{ padding: '4rem 0' }}>
          <div className="empty-state-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <RotateCcw size={22} />
          </div>
          <h3>No books to return! 🎉</h3>
          <p>You have no pending returns. Your reading list is clean!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '720px' }}>
          {issues.map((issue, i) => {
            const daysLeft = Math.ceil((new Date(issue.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0;
            return (
              <div
                key={issue.id}
                className="animate-fade-in"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderLeft: isOverdue
                    ? '4px solid var(--danger)'
                    : daysLeft <= 3
                    ? '4px solid var(--warning)'
                    : '4px solid var(--success)',
                  borderRadius: 12,
                  padding: '1.25rem 1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.875rem' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                      background: `hsl(${(i * 73) % 360}, 75%, 95%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <BookOpen size={16} color={`hsl(${(i * 73) % 360}, 65%, 45%)`} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {issue.book.title}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.125rem 0 0.25rem' }}>
                        by {issue.book.author}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                        Due: <span style={{ fontWeight: 600, color: isOverdue ? 'var(--danger)' : 'var(--text-secondary)' }}>{formatDate(issue.dueDate)}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${isOverdue ? 'badge-red' : daysLeft <= 3 ? 'badge-yellow' : 'badge-green'}`} style={{ fontSize: '0.75rem' }}>
                    {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                  </span>
                </div>

                {isOverdue && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.625rem 0.875rem', borderRadius: 6,
                    background: 'var(--danger-light)', color: 'var(--danger-dark)',
                    fontSize: '0.75rem', fontWeight: 500,
                  }}>
                    <AlertTriangle size={14} />
                    <span>Please return this book to the library immediately to prevent fine accumulation.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
