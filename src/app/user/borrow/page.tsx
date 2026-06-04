'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Loader2, XCircle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface RequestRecord {
  id: string;
  bookId: string;
  requestDate: string;
  status: string;
  book: {
    id: string;
    title: string;
    author: string;
    category: string;
    coverImage: string | null;
  };
}

export default function UserBorrowRequestsPage() {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/borrow/request');
      const json = await res.json();
      if (json.success) {
        // Show PENDING and APPROVED requests.
        // Once ISSUED, they clear from here and move to Return Status.
        setRequests(json.data.filter((r: RequestRecord) => ['PENDING', 'APPROVED'].includes(r.status)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to cancel this borrow request?')) return;
    setCancellingId(requestId); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/borrow/request/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL' }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess('Request cancelled successfully.');
        fetchRequests();
      } else {
        setError(json.error || 'Failed to cancel request');
      }
    } catch {
      setError('Error cancelling request. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>My Borrow Requests</h1>
        <p>Track your active online reservations and book pickup requests</p>
      </div>

      {success && (
        <div className="alert alert-success animate-scale-in" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger animate-scale-in" style={{ marginBottom: '1.5rem' }}>
          <XCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="table-wrapper" style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
          <Loader2 className="animate-spin" size={24} color="var(--accent)" />
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state" style={{ padding: '4rem 1.5rem' }}>
          <div className="empty-state-icon"><BookOpen size={24} /></div>
          <h3>No active requests</h3>
          <p style={{ marginBottom: '1.5rem' }}>You do not have any pending or approved borrow requests at this time.</p>
          <Link href="/user/catalog" className="btn btn-primary">
            Browse Catalog to Request <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Book Details</th>
                  <th>Category</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => (
                  <tr key={req.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 44, height: 60, borderRadius: 4, overflow: 'hidden', flexShrink: 0, position: 'relative', border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                          {req.book.coverImage ? (
                            <img src={req.book.coverImage} alt={req.book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                              📚
                            </div>
                          )}
                        </div>
                        <div>
                          <Link href={`/user/books/${req.book.id}`} style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                            {req.book.title}
                          </Link>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>by {req.book.author}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-indigo">{req.book.category}</span>
                    </td>
                    <td className="td-secondary">{formatDate(req.requestDate)}</td>
                    <td>
                      {req.status === 'PENDING' ? (
                        <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> Pending Review
                        </span>
                      ) : (
                        <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle2 size={12} /> Ready for Pickup
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {req.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(req.id)}
                          disabled={cancellingId === req.id}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
                        >
                          {cancellingId === req.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            'Cancel Request'
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
