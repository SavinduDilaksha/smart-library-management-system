'use client';

import { useEffect, useState, use } from 'react';
import { ArrowLeft, BookOpen, Users, Calendar, Shield, Hash, Bookmark, Layers } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface BookDetail {
  id: string; title: string; author: string; isbn: string;
  category: string; publisher: string | null; quantity: number; available: number;
  description: string | null; coverImage: string | null;
  issues: Array<{ id: string; issueDate: string; status: string; user: { name: string } }>;
  activeRequestsCount: number;
  userRequestStatus: string | null;
  userActiveRequestsCount: number;
  settings: {
    maxOnlineRequestsPerUser: number;
    maxOnlineCopiesPerBook: number;
  };
}

const COVER_COLORS: Record<string, { bg: string; text: string; emoji: string }> = {
  'Fiction':     { bg: '#EEF2FF', text: '#4F46E5', emoji: '📖' },
  'Science':     { bg: '#ECFDF5', text: '#059669', emoji: '🔬' },
  'History':     { bg: '#FEF3C7', text: '#D97706', emoji: '🏛️' },
  'Technology':  { bg: '#E0F2FE', text: '#0284C7', emoji: '💻' },
  'Literature':  { bg: '#FDF2F8', text: '#9D174D', emoji: '✍️' },
  'Philosophy':  { bg: '#F5F3FF', text: '#6D28D9', emoji: '🤔' },
  'Biology':     { bg: '#F0FDF4', text: '#166534', emoji: '🧬' },
  'Mathematics': { bg: '#FFF7ED', text: '#C2410C', emoji: '📐' },
  'default':     { bg: '#F8F9FC', text: '#4B5563', emoji: '📚' },
};

function getCoverStyle(category: string) {
  return COVER_COLORS[category] || COVER_COLORS['default'];
}

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/books/${id}`)
      .then(r => r.json())
      .then(json => { if (json.success) setBook(json.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleRequest = async () => {
    setRequesting(true); setSuccess(''); setError('');
    try {
      const res = await fetch('/api/borrow/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: id })
      });
      const json = await res.json();
      if (json.success) {
        setSuccess('Your request has been submitted successfully! Check status in "My Requests".');
        const detailsRes = await fetch(`/api/books/${id}`);
        const detailsJson = await detailsRes.json();
        if (detailsJson.success) setBook(detailsJson.data);
      } else {
        setError(json.error || 'Failed to submit request');
      }
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return (
    <div className="animate-fade-in">
      <div className="skeleton" style={{ height: 20, width: 140, marginBottom: '1.5rem', borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 320, borderRadius: 12, marginBottom: '1rem' }} />
    </div>
  );

  if (!book) return (
    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '4rem 0' }}>
      <div className="empty-state-icon" style={{ margin: '0 auto 1rem' }}><BookOpen size={24} /></div>
      <h3>Book not found</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>The book you are looking for does not exist or has been removed.</p>
      <Link href="/user/catalog" className="btn btn-primary">Back to Catalog</Link>
    </div>
  );

  const cover = getCoverStyle(book.category);

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link href="/user/catalog" className="btn" style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', gap: '0.375rem' }}>
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>

      {/* Book Detail Card */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          {/* Left Visual Cover Panel */}
          <div style={{
            background: book.coverImage ? 'none' : cover.bg,
            width: '240px',
            minHeight: '260px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
            padding: '2rem',
            position: 'relative',
            borderRight: '1px solid var(--border-light)',
          }}>
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
            ) : (
              <div style={{ fontSize: '4.5rem' }}>{cover.emoji}</div>
            )}
            <span className={`badge ${book.available > 0 ? 'badge-green' : 'badge-red'}`} style={{ position: 'absolute', bottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              {book.available > 0 ? `${book.available} Available` : 'Out of Stock'}
            </span>
          </div>

          {/* Right Information Panel */}
          <div style={{ flex: 1, padding: '2rem', minWidth: '320px' }}>
            <span className="badge badge-indigo" style={{ marginBottom: '0.875rem' }}>{book.category}</span>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem', lineHeight: 1.2 }}>
              {book.title}
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 500 }}>
              by {book.author}
            </p>

            {book.description && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6, background: 'var(--bg-surface-2)', padding: '0.875rem 1.125rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                {book.description}
              </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <Hash size={12} /> ISBN
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                  {book.isbn}
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <Bookmark size={12} /> Publisher
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {book.publisher || 'Unknown'}
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <Layers size={12} /> Copies
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {book.quantity} total
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <BookOpen size={12} /> Available
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: book.available > 0 ? 'var(--success)' : 'var(--danger)', marginTop: '0.25rem' }}>
                  {book.available} in shelf
                </div>
              </div>
            </div>

            {/* Reservation Request Action Panel */}
            <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
              {error && (
                <div className="alert alert-danger animate-scale-in" style={{ marginBottom: '1rem', fontSize: '0.8125rem', padding: '0.625rem 0.875rem' }}>
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success animate-scale-in" style={{ marginBottom: '1rem', fontSize: '0.8125rem', padding: '0.625rem 0.875rem' }}>
                  {success}
                </div>
              )}

              {/* Status information or Request Action Button */}
              {book.userRequestStatus ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <span>Request Status:</span>
                    <span className={`badge ${book.userRequestStatus === 'APPROVED' ? 'badge-green' : 'badge-indigo'}`}>
                      {book.userRequestStatus === 'APPROVED' ? 'Approved' : 'Pending Review'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {book.userRequestStatus === 'APPROVED' 
                      ? 'Your request has been approved! You can pick up the book from the library counter.' 
                      : 'Your request is submitted and waiting for library staff approval. You can cancel it in "My Requests".'}
                  </p>
                </div>
              ) : (
                (() => {
                  const isOnlineAvailable = book.available > 0 && book.activeRequestsCount < book.settings.maxOnlineCopiesPerBook;
                  const hasReachedUserLimit = book.userActiveRequestsCount >= book.settings.maxOnlineRequestsPerUser;

                  if (!isOnlineAvailable) {
                    return (
                      <div style={{ background: 'var(--danger-light)', color: 'var(--danger-dark)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 500 }}>
                        {book.available <= 0 
                          ? 'This book is currently out of stock.' 
                          : 'Online reservation copies limit reached for this book. Try borrowing in person at the counter.'}
                      </div>
                    );
                  }

                  if (hasReachedUserLimit) {
                    return (
                      <div style={{ background: 'var(--warning-light)', color: 'var(--warning-dark)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 500 }}>
                        You have reached the limit of {book.settings.maxOnlineRequestsPerUser} active online borrow requests.
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <button
                        onClick={handleRequest}
                        disabled={requesting}
                        className="btn btn-primary"
                        style={{ width: '100%', maxWidth: '240px', justifyContent: 'center' }}
                      >
                        {requesting ? 'Submitting...' : 'Request to Borrow'}
                      </button>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Online requests are valid for pickup. Max {book.settings.maxOnlineRequestsPerUser} active requests allowed.
                      </span>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Borrowing History */}
      {book.issues && book.issues.length > 0 && (
        <div className="table-wrapper">
          <div className="table-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div className="content-card-icon" style={{ background: 'var(--accent-light)' }}>
                <Calendar size={15} color="var(--accent)" />
              </div>
              <div>
                <div className="card-title">Recent Borrowing History</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Past checkouts for this book</div>
              </div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Issue Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {book.issues.map(issue => (
                  <tr key={issue.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{issue.user.name}</span>
                    </td>
                    <td className="td-secondary">{formatDate(issue.issueDate)}</td>
                    <td>
                      {issue.status === 'ISSUED' && <span className="badge badge-blue">Issued</span>}
                      {issue.status === 'OVERDUE' && <span className="badge badge-red">Overdue</span>}
                      {issue.status === 'RETURNED' && <span className="badge badge-green">Returned</span>}
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

