'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, BookCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface OverdueRecord {
  id: string; issueDate: string; dueDate: string;
  user: { name: string; email: string; phone: string | null };
  book: { title: string; author: string };
  fine: { amount: number; status: string } | null;
}

export default function StaffOverdueBooksPage() {
  const [overdue, setOverdue] = useState<OverdueRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/borrow/overdue')
      .then(r => r.json())
      .then(json => { if (json.success) setOverdue(json.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Overdue Books</h1>
        <p>List of books that have passed their return deadlines</p>
      </div>

      {overdue.length > 0 && (
        <div className="alert alert-danger animate-scale-in" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>There are {overdue.length} overdue book{overdue.length !== 1 ? 's' : ''} currently requiring staff attention.</span>
        </div>
      )}

      <div className="table-wrapper">
        <div className="table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} color="var(--danger)" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>Overdue List</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {overdue.length} items overdue
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Member</th>
                <th>Contact</th>
                <th>Due Date</th>
                <th>Days Overdue</th>
                <th>Fine Accrued</th>
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
              ) : overdue.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state" style={{ padding: '3rem' }}>
                      <div className="empty-state-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                        <BookCheck size={22} />
                      </div>
                      <h3>No overdue books! 🎉</h3>
                      <p>All books currently borrowed are within their due dates.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                overdue.map(item => {
                  const daysOverdue = Math.ceil((Date.now() - new Date(item.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.book.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.book.author}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.user.name}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{item.user.email}</div>
                        {item.user.phone && <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{item.user.phone}</div>}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{formatDate(item.dueDate)}</span>
                      </td>
                      <td>
                        <span className="badge badge-red">{daysOverdue} days overdue</span>
                      </td>
                      <td>
                        {item.fine ? (
                          <span style={{ fontWeight: 700, color: 'var(--warning-dark)' }}>₹{item.fine.amount}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
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

