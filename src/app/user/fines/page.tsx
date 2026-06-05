'use client';

import { useEffect, useState } from 'react';
import { DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface FineData {
  id: string; amount: number; status: string; createdAt: string;
  issue: { book: { title: string; author: string } };
}

export default function UserFinesPage() {
  const [fines, setFines] = useState<FineData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/fines')
      .then(r => r.json())
      .then(json => { if (json.success) setFines(json.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalPending = fines.filter(f => f.status === 'PENDING').reduce((acc, f) => acc + f.amount, 0);
  const totalPaid    = fines.filter(f => f.status === 'PAID').reduce((acc, f) => acc + f.amount, 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>My Fines</h1>
        <p>View your library fine history and outstanding balances</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem', marginBottom: '1.5rem', maxWidth: 600 }}>
        <div className="stat-card" style={{ borderColor: totalPending > 0 ? '#FDE68A' : 'var(--border)' }}>
          <div className="stat-card-icon" style={{ background: totalPending > 0 ? '#FEF3C7' : '#F3F4F6' }}>
            <DollarSign size={20} color={totalPending > 0 ? '#D97706' : '#9CA3AF'} />
          </div>
          <div className="stat-card-label">Pending Balance</div>
          <div className="stat-card-value" style={{ color: totalPending > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
            ₹{totalPending.toFixed(0)}
          </div>
          <div className="stat-card-trend">{totalPending > 0 ? 'pay at library desk' : 'nothing due'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#D1FAE5' }}>
            <CheckCircle2 size={20} color="#059669" />
          </div>
          <div className="stat-card-label">Total Paid</div>
          <div className="stat-card-value" style={{ color: 'var(--success)' }}>₹{totalPaid.toFixed(0)}</div>
          <div className="stat-card-trend">all time payments</div>
        </div>
      </div>

      {/* Outstanding Alert */}
      {totalPending > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>Outstanding Balance: ₹{totalPending.toFixed(0)}</strong>
            <div style={{ fontWeight: 400, marginTop: '0.125rem' }}>Please pay your pending fines at the library service desk.</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date Issued</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>{[...Array(4)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>)}</tr>
                ))
              ) : fines.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <div className="empty-state-icon" style={{ background: '#D1FAE5' }}>
                        <CheckCircle2 size={22} color="#059669" />
                      </div>
                      <h3>No fines — great job! 🎉</h3>
                      <p>You have no fine records. Keep returning books on time!</p>
                    </div>
                  </td>
                </tr>
              ) : fines.map((fine, i) => (
                <tr key={fine.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                  <td>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{fine.issue.book.title}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{fine.issue.book.author}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: fine.status === 'PENDING' ? 'var(--warning)' : 'var(--text-primary)' }}>
                      ₹{fine.amount.toFixed(0)}
                    </span>
                  </td>
                  <td>
                    {fine.status === 'PENDING' && <span className="badge badge-yellow">Pending</span>}
                    {fine.status === 'PAID'    && <span className="badge badge-green">Paid</span>}
                    {fine.status === 'WAIVED'  && <span className="badge badge-gray">Waived</span>}
                  </td>
                  <td className="td-secondary">{formatDate(fine.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
