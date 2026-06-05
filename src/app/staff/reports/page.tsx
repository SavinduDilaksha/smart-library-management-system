'use client';

import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface IssueRecord {
  id: string; issueDate: string; dueDate: string; returnDate: string | null; status: string;
  user: { name: string }; book: { title: string; author: string };
  fine: { amount: number; status: string } | null;
}

export default function StaffReportsPage() {
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter) params.set('status', filter);
    fetch(`/api/borrow/history?${params}`)
      .then(r => r.json())
      .then(json => { if (json.success) setIssues(json.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  const exportCSV = () => {
    const headers = 'Book,Author,Member,Issue Date,Due Date,Return Date,Status,Fine\n';
    const rows = issues.map(i => `"${i.book.title}","${i.book.author}","${i.user.name}","${formatDate(i.issueDate)}","${formatDate(i.dueDate)}","${i.returnDate ? formatDate(i.returnDate) : ''}","${i.status}","${i.fine ? '₹' + i.fine.amount : ''}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `staff-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header-actions">
        <div>
          <h1>Reports</h1>
          <p>View and export book transaction reports</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="select"
            style={{ width: 'auto', minWidth: 150 }}
          >
            <option value="">All Transactions</option>
            <option value="ISSUED">Issued</option>
            <option value="OVERDUE">Overdue</option>
            <option value="RETURNED">Returned</option>
          </select>
          <button
            onClick={exportCSV}
            disabled={issues.length === 0}
            className="btn btn-primary"
            style={{ gap: '0.5rem' }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} color="var(--text-muted)" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>Report Data</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {issues.length} records found
          </div>
        </div>

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
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>
                    ))}
                  </tr>
                ))
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><FileText size={22} /></div>
                      <h3>No records found</h3>
                      <p>No transaction history matches your active filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                issues.map(i => (
                  <tr key={i.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{i.book.title}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{i.book.author}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{i.user.name}</span>
                    </td>
                    <td className="td-secondary">{formatDate(i.issueDate)}</td>
                    <td className="td-secondary">{formatDate(i.dueDate)}</td>
                    <td className="td-secondary">{i.returnDate ? formatDate(i.returnDate) : '—'}</td>
                    <td>
                      {i.status === 'ISSUED' && <span className="badge badge-blue">Issued</span>}
                      {i.status === 'OVERDUE' && <span className="badge badge-red">Overdue</span>}
                      {i.status === 'RETURNED' && <span className="badge badge-green">Returned</span>}
                    </td>
                    <td>
                      {i.fine ? (
                        <span style={{ fontWeight: 600, color: 'var(--warning-dark)' }}>₹{i.fine.amount}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

