'use client';

import { useEffect, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface IssueRecord {
  id: string; issueDate: string; dueDate: string; returnDate: string | null; status: string;
  user: { name: string; email: string };
  book: { title: string; author: string; isbn: string };
  fine: { amount: number; status: string } | null;
}

export default function AdminIssueReturnPage() {
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchIssues(); }, [filter]);

  const fetchIssues = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set('status', filter);
    try {
      const res = await fetch(`/api/borrow/history?${params}`);
      const json = await res.json();
      if (json.success) setIssues(json.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header-actions">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Issue & Return Overview
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            All book transaction records
          </p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="select" style={{ width: 'auto', minWidth: 140 }}>
          <option value="">All Status</option>
          <option value="ISSUED">Issued</option>
          <option value="RETURNED">Returned</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      <div className="table-wrapper">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Member</th>
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
                  <tr key={i}>{[...Array(7)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>)}</tr>
                ))
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><ArrowLeftRight size={22} /></div>
                      <h3>No transactions found</h3>
                      <p>No issue/return records match your filter.</p>
                    </div>
                  </td>
                </tr>
              ) : issues.map(issue => (
                <tr key={issue.id}>
                  <td>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{issue.book.title}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{issue.book.author}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{issue.user.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{issue.user.email}</div>
                  </td>
                  <td className="td-secondary">{formatDate(issue.issueDate)}</td>
                  <td className="td-secondary">{formatDate(issue.dueDate)}</td>
                  <td className="td-secondary">{issue.returnDate ? formatDate(issue.returnDate) : '—'}</td>
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
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>}
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
