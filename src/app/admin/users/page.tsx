'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Trash2, X, Users, Loader2, CheckCircle, XCircle, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface UserData {
  id: string; name: string; email: string; role: string;
  phone: string | null; status: string; createdAt: string;
  _count: { issues: number; fines: number };
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ role: 'MEMBER' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    try {
      const res = await fetch(`/api/users?${params}`);
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) fetchUsers(); else alert(json.error);
    } catch { alert('Error updating status'); }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'MEMBER' }),
      });
      const json = await res.json();
      if (json.success) { setShowModal(false); fetchUsers(); setForm({ name: '', email: '', password: '', phone: '' }); }
      else alert(json.error);
    } catch { alert('Error creating user'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete member "${name}"?`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) fetchUsers(); else alert(json.error);
    } catch { alert('Error deleting user'); }
  };

  const statusBadge = (status: string) => {
    if (status === 'ACTIVE')   return <span className="badge badge-green">Active</span>;
    if (status === 'PENDING')  return <span className="badge badge-yellow">Pending</span>;
    if (status === 'INACTIVE') return <span className="badge badge-red">Inactive</span>;
    return <span className="badge badge-gray">{status}</span>;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header-actions">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Member Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {users.length} members registered
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Add Member
        </button>
      </div>

      <div className="table-wrapper">
        <div className="table-header">
          <div className="search-bar-wrapper">
            <Search size={15} className="search-icon" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search members by name or email..."
              className="input"
              style={{ paddingLeft: '2.5rem', background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)' }}
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select" style={{ width: 'auto', minWidth: 140 }}>
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Issues</th>
                <th>Fines</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>)}</tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><Users size={22} /></div>
                      <h3>No members found</h3>
                      <p>Add your first member or adjust filters.</p>
                    </div>
                  </td>
                </tr>
              ) : users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--accent-light)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent)',
                      }}>
                        {getInitials(user.name)}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{user.name}</span>
                    </div>
                  </td>
                  <td className="td-secondary">{user.email}</td>
                  <td className="td-secondary">{user.phone || '—'}</td>
                  <td>{statusBadge(user.status)}</td>
                  <td className="td-secondary">{user._count.issues}</td>
                  <td className="td-secondary">{user._count.fines}</td>
                  <td className="td-secondary">{formatDate(user.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {user.status === 'PENDING' && (
                        <button onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                          className="btn btn-ghost btn-sm" style={{ color: 'var(--success)' }} title="Approve">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {user.status === 'ACTIVE' && (
                        <button onClick={() => handleStatusChange(user.id, 'INACTIVE')}
                          className="btn btn-ghost btn-sm" style={{ color: 'var(--warning)' }} title="Deactivate">
                          <XCircle size={14} />
                        </button>
                      )}
                      {user.status === 'INACTIVE' && (
                        <button onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                          className="btn btn-ghost btn-sm" style={{ color: 'var(--success)' }} title="Reactivate">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(user.id, user.name)}
                        className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Member</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min. 6 characters" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+94 71 000 0000" />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.name || !form.email || !form.password} className="btn btn-primary">
                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
