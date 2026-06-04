'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, X, UserCog, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface StaffData {
  id: string; name: string; email: string; phone: string | null; status: string; createdAt: string;
  _count: { issues: number; fines: number };
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffData | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ role: 'STAFF' });
    if (search) params.set('search', search);
    try {
      const res = await fetch(`/api/users?${params}`);
      const json = await res.json();
      if (json.success) setStaff(json.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const openCreate = () => { setEditStaff(null); setForm({ name: '', email: '', password: '', phone: '' }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editStaff) {
        const res = await fetch(`/api/users/${editStaff.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, phone: form.phone }) });
        const json = await res.json();
        if (json.success) { setShowModal(false); fetchStaff(); } else alert(json.error);
      } else {
        const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, role: 'STAFF' }) });
        const json = await res.json();
        if (json.success) { setShowModal(false); fetchStaff(); } else alert(json.error);
      }
    } catch { alert('Error saving staff'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete staff "${name}"?`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) fetchStaff(); else alert(json.error);
    } catch { alert('Error'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header-actions">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Staff Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {staff.length} staff members
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="table-wrapper">
        <div className="table-header">
          <div className="search-bar-wrapper">
            <Search size={15} className="search-icon" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search staff members..."
              className="input"
              style={{ paddingLeft: '2.5rem', background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)' }}
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>)}</tr>
                ))
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><UserCog size={22} /></div>
                      <h3>No staff found</h3>
                      <p>Add your first staff member to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : staff.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: '#ECFDF5', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: '#059669',
                      }}>
                        {getInitials(s.name)}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{s.name}</span>
                    </div>
                  </td>
                  <td className="td-secondary">{s.email}</td>
                  <td className="td-secondary">{s.phone || '—'}</td>
                  <td>
                    <span className={`badge ${s.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>{s.status}</span>
                  </td>
                  <td className="td-secondary">{formatDate(s.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button onClick={() => { setEditStaff(s); setForm({ name: s.name, email: s.email, password: '', phone: s.phone || '' }); setShowModal(true); }}
                        className="btn btn-ghost btn-sm" style={{ color: 'var(--accent)' }} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(s.id, s.name)}
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
              <h3 className="modal-title">{editStaff ? 'Edit Staff' : 'Add Staff Member'}</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Staff member name" />
              </div>
              {!editStaff && (
                <>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="staff@library.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input className="input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min. 6 characters" />
                  </div>
                </>
              )}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+94 71 000 0000" />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || (!editStaff && (!form.email || !form.password))} className="btn btn-primary">
                {saving ? <Loader2 size={16} className="animate-spin" /> : editStaff ? 'Update Staff' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
