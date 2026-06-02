'use client';

import { useEffect, useState } from 'react';
import { History, BookOpen } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface IssueRecord {
  id: string; issueDate: string; dueDate: string; returnDate: string | null; status: string;
  book: { title: string; author: string; isbn: string };
  fine: { amount: number; status: string } | null;
}

export default function UserHistoryPage() {
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/borrow/history')
      .then(r => r.json())
      .then(json => { if (json.success) setIssues(json.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Borrowing History</h1>
        <p>Your complete book borrowing record — {issues.length} total transactions</p>
      </div>

      <div className="table-wrapper">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Fine</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>)}</tr>
                ))
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><History size={22} /></div>
                      <h3>No borrowing history</h3>
                      <p>You haven't borrowed any books yet. Browse the catalog to get started!</p>
                    </div>
                  </td>
                </tr>
              ) : issues.map((issue, i) => (
                <tr key={issue.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.02}s` }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BookOpen size={15} color="var(--accent)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{issue.book.title}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{issue.book.author}</div>
                      </div>
                    </div>
                  </td>
                  <td className="td-secondary">{formatDate(issue.issueDate)}</td>
                  <td className="td-secondary">{formatDate(issue.dueDate)}</td>
                  <td className="td-secondary">{issue.returnDate ? formatDate(issue.returnDate) : <span style={{ color: 'var(--text-muted)' }}>Not returned</span>}</td>
                  <td>
                    {issue.status === 'ISSUED'   && <span className="badge badge-blue">Issued</span>}
                    {issue.status === 'OVERDUE'  && <span className="badge badge-red">Overdue</span>}
                    {issue.status === 'RETURNED' && <span className="badge badge-green">Returned</span>}
                  </td>
                  <td>
                    {issue.fine ? (
                      <span className={`badge ${issue.fine.status === 'PAID' ? 'badge-green' : issue.fine.status === 'WAIVED' ? 'badge-gray' : 'badge-yellow'}`}>
                        ₹{issue.fine.amount} · {issue.fine.status}
                      </span>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No fine</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
