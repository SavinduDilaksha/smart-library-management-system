'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface IssueRecord {
  id: string; issueDate: string; dueDate: string; status: string;
  user: { name: string; email: string }; book: { title: string; author: string };
}

export default function StaffBorrowedBooksPage() {
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/borrow/history?status=ISSUED')
      .then(r => r.json())
      .then(json => { if (json.success) setIssues(json.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Currently Borrowed</h1>
        <p>{issues.length} book{issues.length !== 1 ? 's' : ''} currently issued to members</p>
      </div>

      <div className="table-wrapper">
        <div className="table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={16} color="var(--text-muted)" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>Active Transactions</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {issues.length} active borrowings
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Author</th>
                <th>Member</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status / Time Left</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>
                    ))}
                  </tr>
                ))
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><BookOpen size={22} /></div>
                      <h3>No books currently borrowed</h3>
                      <p>All issued books have been returned.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                issues.map(issue => {
                  const daysLeft = Math.ceil((new Date(issue.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={issue.id}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{issue.book.title}</span>
                      </td>
                      <td className="td-secondary">{issue.book.author}</td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{issue.user.name}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{issue.user.email}</div>
                      </td>
                      <td className="td-secondary">{formatDate(issue.issueDate)}</td>
                      <td className="td-secondary">{formatDate(issue.dueDate)}</td>
                      <td>
                        {daysLeft <= 0 ? (
                          <span className="badge badge-red">Due today / Late</span>
                        ) : daysLeft <= 2 ? (
                          <span className="badge badge-red">{daysLeft} days left</span>
                        ) : daysLeft <= 5 ? (
                          <span className="badge badge-yellow">{daysLeft} days left</span>
                        ) : (
                          <span className="badge badge-green">{daysLeft} days left</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

