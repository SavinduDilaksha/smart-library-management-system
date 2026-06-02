'use client';

import { useEffect, useState } from 'react';
import { Search, BookPlus, Loader2, CheckCircle, User, BookOpen, Check, X, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface UserOption { id: string; name: string; email: string; }
interface BookOption { id: string; title: string; author: string; available: number; category: string; }

interface BorrowRequest {
  id: string;
  userId: string;
  bookId: string;
  requestDate: string;
  status: string;
  user: { name: string; email: string };
  book: { title: string; author: string; available: number };
}

export default function StaffIssueBookPage() {
  // Tab states
  const [activeTab, setActiveTab] = useState<'direct' | 'requests'>('direct');

  // Direct Issue states
  const [members, setMembers] = useState<UserOption[]>([]);
  const [books, setBooks] = useState<BookOption[]>([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [issuing, setIssuing] = useState(false);

  // Requests Queue states
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Common notifications
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchDirectOptions = () => {
    fetch('/api/users?role=MEMBER&status=ACTIVE').then(r => r.json()).then(json => { if (json.success) setMembers(json.data); });
    fetch('/api/books').then(r => r.json()).then(json => { if (json.success) setBooks(json.data.filter((b: BookOption) => b.available > 0)); });
  };

  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await fetch('/api/borrow/request');
      const json = await res.json();
      if (json.success) {
        // Filter to display only PENDING and APPROVED requests
        setRequests(json.data.filter((r: BorrowRequest) => ['PENDING', 'APPROVED'].includes(r.status)));
      }
    } catch {
      setError('Failed to fetch online requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectOptions();
    fetchRequests();
  }, []);

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );
  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.author.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const selectedMemberObj = members.find(m => m.id === selectedMember);
  const selectedBookObj   = books.find(b => b.id === selectedBook);

  const handleIssue = async () => {
    if (!selectedMember || !selectedBook) return;
    setIssuing(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/borrow/issue', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedMember, bookId: selectedBook }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(`Book "${selectedBookObj?.title}" issued to ${selectedMemberObj?.name}!`);
        setSelectedMember(''); setSelectedBook('');
        fetchDirectOptions();
      } else setError(json.error);
    } catch { setError('Failed to issue book'); }
    finally { setIssuing(false); }
  };

  const handleRequestAction = async (requestId: string, action: 'APPROVE' | 'REJECT' | 'ISSUE') => {
    setProcessingId(requestId); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/borrow/request/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        if (action === 'APPROVE') setSuccess('Borrow request approved successfully!');
        else if (action === 'REJECT') setSuccess('Borrow request rejected successfully.');
        else if (action === 'ISSUE') setSuccess('Book issued from reservation request successfully!');
        
        fetchRequests();
        fetchDirectOptions(); // Update available counts
      } else {
        setError(json.error || 'Failed to update request');
      }
    } catch {
      setError('An error occurred while updating the request.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Issue Book</h1>
        <p>Issue books directly to members or process online reservation requests</p>
      </div>

      {error   && <div className="alert alert-danger animate-scale-in" style={{ marginBottom: '1.5rem' }}>{error}</div>}
      {success && (
        <div className="alert alert-success animate-scale-in" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle size={16} style={{ flexShrink: 0 }} /> {success}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem', display: 'inline-flex', padding: '0.25rem', gap: '0.25rem' }}>
        <button
          className={`tab-btn${activeTab === 'direct' ? ' active' : ''}`}
          onClick={() => setActiveTab('direct')}
        >
          Direct Issue
        </button>
        <button
          className={`tab-btn${activeTab === 'requests' ? ' active' : ''}`}
          onClick={() => { setActiveTab('requests'); fetchRequests(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          Online Requests Queue
          {requests.length > 0 && (
            <span style={{
              background: activeTab === 'requests' ? 'var(--accent)' : 'var(--text-muted)',
              color: 'white',
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '0.125rem 0.375rem',
              borderRadius: '10px',
              marginLeft: '0.25rem'
            }}>
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'direct' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Select Member */}
            <div className="table-wrapper">
              <div className="table-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="content-card-icon" style={{ background: 'var(--accent-light)' }}>
                    <User size={15} color="var(--accent)" />
                  </div>
                  <div className="card-title">1. Select Member</div>
                </div>
              </div>

              <div style={{ padding: '1rem' }}>
                <div className="search-bar-wrapper" style={{ marginBottom: '0.875rem' }}>
                  <Search size={14} className="search-icon" />
                  <input type="text" value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                    placeholder="Search members..." className="input"
                    style={{ paddingLeft: '2.25rem', background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)' }}
                  />
                </div>

                <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {filteredMembers.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem 0' }}>No members found</p>
                  ) : filteredMembers.map(m => (
                    <button key={m.id} onClick={() => setSelectedMember(m.id)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '0.625rem 0.75rem', borderRadius: 8,
                        border: selectedMember === m.id ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                        background: selectedMember === m.id ? 'var(--accent-light)' : 'transparent',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: selectedMember === m.id ? 'var(--accent)' : 'var(--text-primary)' }}>{m.name}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{m.email}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Select Book */}
            <div className="table-wrapper">
              <div className="table-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="content-card-icon" style={{ background: '#ECFDF5' }}>
                    <BookOpen size={15} color="#059669" />
                  </div>
                  <div className="card-title">2. Select Book</div>
                </div>
              </div>

              <div style={{ padding: '1rem' }}>
                <div className="search-bar-wrapper" style={{ marginBottom: '0.875rem' }}>
                  <Search size={14} className="search-icon" />
                  <input type="text" value={bookSearch} onChange={e => setBookSearch(e.target.value)}
                    placeholder="Search books..." className="input"
                    style={{ paddingLeft: '2.25rem', background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)' }}
                  />
                </div>

                <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {filteredBooks.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem 0' }}>No available books</p>
                  ) : filteredBooks.map(b => (
                    <button key={b.id} onClick={() => setSelectedBook(b.id)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '0.625rem 0.75rem', borderRadius: 8,
                        border: selectedBook === b.id ? '1.5px solid #059669' : '1.5px solid transparent',
                        background: selectedBook === b.id ? '#ECFDF5' : 'transparent',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: selectedBook === b.id ? '#059669' : 'var(--text-primary)' }}>{b.title}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{b.author} · {b.available} available</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Issue Summary */}
          {(selectedMember || selectedBook) && (
            <div className="card animate-scale-in" style={{ marginBottom: '1.5rem', maxWidth: 600, background: 'var(--accent-light)', border: '1.5px solid var(--accent)', borderRadius: 12, padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.5rem' }}>Issue Summary</div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.125rem' }}>Member</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {selectedMemberObj?.name || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not selected</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.125rem' }}>Book</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {selectedBookObj?.title || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not selected</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button onClick={handleIssue} disabled={!selectedMember || !selectedBook || issuing} className="btn btn-primary" style={{ fontSize: '0.9375rem', padding: '0.75rem 1.75rem' }}>
            {issuing ? <Loader2 size={18} className="animate-spin" /> : <><BookPlus size={18} /> Issue Book</>}
          </button>
        </>
      ) : (
        /* Online Requests Queue */
        <div className="table-wrapper">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Requested Book</th>
                  <th>Member Info</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requestsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>{[...Array(5)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>)}</tr>
                  ))
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state" style={{ padding: '3rem' }}>
                        <div className="empty-state-icon"><Clock size={22} /></div>
                        <h3>No pending requests</h3>
                        <p>There are no online book reservation requests waiting to be processed.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req, i) => (
                    <tr key={req.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.book.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>by {req.book.author}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{req.user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{req.user.email}</div>
                      </td>
                      <td className="td-secondary">{formatDate(req.requestDate)}</td>
                      <td>
                        {req.status === 'PENDING' ? (
                          <span className="badge badge-indigo">Pending Review</span>
                        ) : (
                          <span className="badge badge-green">Approved</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {req.status === 'PENDING' && (
                            <button
                              onClick={() => handleRequestAction(req.id, 'APPROVE')}
                              disabled={processingId === req.id}
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--success)', borderColor: 'var(--success-light)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <Check size={14} /> Approve
                            </button>
                          )}
                          
                          {req.status === 'APPROVED' && (
                            <button
                              onClick={() => handleRequestAction(req.id, 'ISSUE')}
                              disabled={processingId === req.id}
                              className="btn btn-primary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <BookPlus size={14} /> Issue Book
                            </button>
                          )}

                          <button
                            onClick={() => handleRequestAction(req.id, 'REJECT')}
                            disabled={processingId === req.id}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
