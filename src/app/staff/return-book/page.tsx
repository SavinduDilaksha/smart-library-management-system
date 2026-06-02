'use client';

import { useEffect, useState } from 'react';
import { Search, RotateCcw, Loader2, CheckCircle, AlertTriangle, BookCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface IssueRecord {
  id: string; issueDate: string; dueDate: string; status: string;
  user: { id: string; name: string; email: string };
  book: { id: string; title: string; author: string };
}

export default function StaffReturnBookPage() {
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [returning, setReturning] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string; fine?: number } | null>(null);

  useEffect(() => { fetchIssued(); }, []);

  const fetchIssued = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/borrow/history?status=ISSUED');
      const json = await res.json();
      const res2  = await fetch('/api/borrow/history?status=OVERDUE');
      const json2 = await res2.json();
      if (json.success && json2.success) setIssues([...json.data, ...json2.data]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleReturn = async (issueId: string) => {
    setReturning(issueId); setResult(null);
    try {
      const res = await fetch('/api/borrow/return', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId }),
      });
      const json = await res.json();
      if (json.success) {
        setResult({
          success: true,
          message: json.data.isOverdue
            ? `Book returned. Fine charged: ₹${json.data.fine?.amount}`
            : 'Book returned successfully!',
          fine: json.data.fine?.amount,
        });
        fetchIssued();
      } else setResult({ success: false, message: json.error });
    } catch { setResult({ success: false, message: 'Failed to process return' }); }
    finally { setReturning(null); }
  };

  const filtered = issues.filter(i =>
    i.user.name.toLowerCase().includes(search.toLowerCase()) ||
    i.book.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Return Book</h1>
        <p>Process book returns from members — {issues.length} {issues.length === 1 ? 'book' : 'books'} currently out</p>
      </div>

      {result && (
        <div className={`alert animate-scale-in ${result.success ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '1.5rem' }}>
          {result.success ? <CheckCircle size={16} style={{ flexShrink: 0 }} /> : <AlertTriangle size={16} style={{ flexShrink: 0 }} />}
          {result.message}
        </div>
      )}

      <div className="table-wrapper">
        <div className="table-header">
          <div className="search-bar-wrapper">
            <Search size={15} className="search-icon" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by member name or book title..."
              className="input"
              style={{ paddingLeft: '2.5rem', background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)' }}
            />
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {filtered.length} results
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
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon" style={{ background: '#D1FAE5' }}>
                        <BookCheck size={22} color="#059669" />
                      </div>
                      <h3>No books to return</h3>
                      <p>All issued books have been returned!</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(issue => {
                const isOverdue = new Date(issue.dueDate) < new Date();
                return (
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
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: isOverdue ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: isOverdue ? 600 : 400 }}>
                        {formatDate(issue.dueDate)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isOverdue ? 'badge-red' : 'badge-blue'}`}>
                        {isOverdue ? 'Overdue' : 'Issued'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleReturn(issue.id)}
                        disabled={returning === issue.id}
                        className="btn btn-primary btn-sm"
                        style={{ background: isOverdue ? 'var(--danger)' : undefined }}
                      >
                        {returning === issue.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <><RotateCcw size={13} /> Return</>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
