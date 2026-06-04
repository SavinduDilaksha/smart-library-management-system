'use client';

import { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, XCircle, TrendingUp, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface FineData {
  id: string; amount: number; status: string; createdAt: string;
  user: { id: string; name: string; email: string };
  issue: { book: { title: string; author: string } };
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function AdminFinesPage() {
  const [fines, setFines] = useState<FineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchFines(); }, [filter]);

  const fetchFines = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set('status', filter);
    try {
      const res = await fetch(`/api/fines?${params}`);
      const json = await res.json();
      if (json.success) setFines(json.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handlePayment = async (fineId: string, action: string) => {
    try {
      const res = await fetch('/api/fines/payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fineId, action }),
      });
      const json = await res.json();
      if (json.success) fetchFines(); else alert(json.error);
    } catch { alert('Error processing fine'); }
  };

  const totalPending   = fines.filter(f => f.status === 'PENDING').reduce((acc, f) => acc + f.amount, 0);
  const totalCollected = fines.filter(f => f.status === 'PAID').reduce((acc, f) => acc + f.amount, 0);
  const pendingCount   = fines.filter(f => f.status === 'PENDING').length;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Fine Management</h1>
        <p>Track and manage library late return fines</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#FEF3C7' }}>
            <Clock size={20} color="#D97706" />
          </div>
          <div className="stat-card-label">Pending Fines</div>
          <div className="stat-card-value" style={{ color: 'var(--warning)' }}>₹{totalPending.toFixed(0)}</div>
          <div className="stat-card-trend">{pendingCount} fine{pendingCount !== 1 ? 's' : ''} to collect</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#D1FAE5' }}>
            <TrendingUp size={20} color="#059669" />
          </div>
          <div className="stat-card-label">Total Collected</div>
          <div className="stat-card-value" style={{ color: 'var(--success)' }}>₹{totalCollected.toFixed(0)}</div>
          <div className="stat-card-trend">revenue from fines</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#EEF2FF' }}>
            <DollarSign size={20} color="#4F46E5" />
          </div>
          <div className="stat-card-label">Total Records</div>
          <div className="stat-card-value">{fines.length}</div>
          <div className="stat-card-trend">all fine records</div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={16} color="var(--text-muted)" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>Fine Records</span>
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="select" style={{ width: 'auto', minWidth: 140 }}>
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="WAIVED">Waived</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>)}</tr>
                ))
              ) : fines.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><DollarSign size={22} /></div>
                      <h3>No fines found</h3>
                      <p>No fine records match your current filter.</p>
                    </div>
                  </td>
                </tr>
              ) : fines.map(fine => (
                <tr key={fine.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--danger-light)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700, color: 'var(--danger)',
                      }}>
                        {getInitials(fine.user.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{fine.user.name}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{fine.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>{fine.issue.book.title}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{fine.issue.book.author}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: fine.status === 'PENDING' ? 'var(--warning)' : 'var(--text-primary)', fontSize: '0.9375rem' }}>
                      ₹{fine.amount.toFixed(0)}
                    </span>
                  </td>
                  <td>
                    {fine.status === 'PENDING' && <span className="badge badge-yellow">Pending</span>}
                    {fine.status === 'PAID'    && <span className="badge badge-green">Paid</span>}
                    {fine.status === 'WAIVED'  && <span className="badge badge-gray">Waived</span>}
                  </td>
                  <td className="td-secondary">{formatDate(fine.createdAt)}</td>
                  <td>
                    {fine.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button onClick={() => handlePayment(fine.id, 'PAID')}
                          className="btn btn-ghost btn-sm" style={{ color: 'var(--success)' }} title="Mark Paid">
                          <CheckCircle size={14} />
                        </button>
                        <button onClick={() => handlePayment(fine.id, 'WAIVED')}
                          className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }} title="Waive Fine">
                          <XCircle size={14} />
                        </button>
                      </div>
                    )}
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
