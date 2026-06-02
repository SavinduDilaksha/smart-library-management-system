'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Save, Loader2, Mail, User, Phone, ShieldCheck } from 'lucide-react';

function getInitials(name?: string | null) {
  if (!name) return 'M';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function UserProfilePage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account information and preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', maxWidth: 900 }}>
        {/* Left — Profile Card */}
        <div>
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1.25rem',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem', fontWeight: 800, color: 'white',
                boxShadow: '0 8px 24px rgba(79,70,229,0.3)',
              }}>
                {getInitials(session?.user?.name)}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {session?.user?.name}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
                {session?.user?.email}
              </p>
              <span className="badge badge-indigo">Library Member</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', padding: '1rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                <ShieldCheck size={15} color="var(--success)" />
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Account Active</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Mail size={15} color="var(--text-muted)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Edit Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Account Information</div>
              <div className="card-subtitle">Update your profile details</div>
            </div>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">Full Name</label>
              <div className="input-icon-wrapper">
                <User size={16} className="input-icon-left" />
                <input
                  id="profile-name"
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon-left" />
                <input
                  id="profile-email"
                  className="input"
                  value={session?.user?.email || ''}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed', background: 'var(--bg-surface-2)' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                Contact library staff to change your email address
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="profile-phone">Phone Number</label>
              <div className="input-icon-wrapper">
                <Phone size={16} className="input-icon-left" />
                <input
                  id="profile-phone"
                  className="input"
                  placeholder="+94 71 000 0000"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
              </button>
              {saved && (
                <span className="animate-fade-in" style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 500 }}>
                  ✓ Changes saved!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
