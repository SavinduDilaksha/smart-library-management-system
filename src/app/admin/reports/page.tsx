'use client';

import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface IssueRecord {
  id: string; issueDate: string; dueDate: string; returnDate: string | null; status: string;
  user: { name: string; email: string };
  book: { title: string; author: string; isbn: string };
  fine: { amount: number; status: string } | null;
}

export default function AdminReportsPage() {
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('all');

  useEffect(() => { fetchData(); }, [reportType]);

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (reportType === 'overdue')  params.set('status', 'OVERDUE');
    if (reportType === 'issued')   params.set('status', 'ISSUED');
    if (reportType === 'returned') params.set('status', 'RETURNED');
    try {
      const res = await fetch(`/api/borrow/history?${params}`);
      const json = await res.json();
      if (json.success) setIssues(json.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const exportCSV = () => {
    const headers = 'Book,Author,Member,Issue Date,Due Date,Return Date,Status,Fine\n';
    const rows = issues.map(i =>
      `"${i.book.title}","${i.book.author}","${i.user.name}","${formatDate(i.issueDate)}","${formatDate(i.dueDate)}","${i.returnDate ? formatDate(i.returnDate) : ''}","${i.status}","${i.fine ? '₹' + i.fine.amount : ''}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library-report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reportTabs = [
    { key: 'all',      label: 'All Records',       color: 'var(--accent)',   bg: 'var(--accent-light)' },
    { key: 'issued',   label: 'Currently Issued',   color: '#3B82F6',         bg: '#DBEAFE' },
    { key: 'overdue',  label: 'Overdue',             color: '#EF4444',         bg: '#FEE2E2' },
    { key: 'returned', label: 'Returned',            color: '#10B981',         bg: '#D1FAE5' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header-actions">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Reports
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Generate and export library transaction reports
          </p>
        </div>
        <button onClick={exportCSV} disabled={issues.length === 0} className="btn btn-secondary">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {reportTabs.map(r => (
          <button
            key={r.key}
            onClick={() => setReportType(r.key)}
            style={{
              padding: '1rem', borderRadius: 12, textAlign: 'left',
              border: reportType === r.key ? `2px solid ${r.color}` : '1.5px solid var(--border)',
              background: reportType === r.key ? r.bg : 'var(--bg-surface)',
              cursor: 'pointer', transition: 'all 0.18s ease',
              boxShadow: reportType === r.key ? `0 2px 12px rgba(0,0,0,0.08)` : 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: reportType === r.key ? r.color : 'var(--text-muted)', marginBottom: '0.375rem' }}>
              {r.label}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: reportType === r.key ? r.color : 'var(--text-primary)' }}>
              {issues.length}
            </div>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} color="var(--text-muted)" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
              {issues.length} {reportTabs.find(r => r.key === reportType)?.label} Records
            </span>
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
                  <tr key={i}>{[...Array(7)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>)}</tr>
                ))
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><FileText size={22} /></div>
                      <h3>No records found</h3>
                      <p>No transactions match the selected report type.</p>
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
                      <span style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.875rem' }}>₹{issue.fine.amount}</span>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
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
