'use client';

import { useEffect, useState } from 'react';
import { Settings, Loader2, Save, DollarSign, Clock, BookOpen, Library } from 'lucide-react';

interface SettingsData {
  finePerDay: number;
  maxBorrowDays: number;
  maxBooksPerUser: number;
  libraryName: string;
  maxOnlineRequestsPerUser: number;
  maxOnlineCopiesPerBook: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    finePerDay: 5,
    maxBorrowDays: 14,
    maxBooksPerUser: 5,
    libraryName: 'City Library',
    maxOnlineRequestsPerUser: 3,
    maxOnlineCopiesPerBook: 3,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(json => { if (json.success) setSettings(json.data); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else alert(json.error);
    } catch { alert('Error saving settings'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="animate-fade-in">
      <div className="skeleton" style={{ height: 28, width: 200, marginBottom: '1.5rem', borderRadius: 8 }} />
      {[...Array(2)].map((_, i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 12, marginBottom: '1rem' }} />)}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header-actions">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            System Settings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Configure library rules and policies
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          {saved && (
            <span className="animate-fade-in" style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 500 }}>
              ✓ Settings saved!
            </span>
          )}
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Settings</>}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Library Info */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Library size={16} color="var(--accent)" />
            </div>
            <div className="settings-section-title">Library Information</div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0, maxWidth: 400 }}>
              <label className="form-label">Library Name</label>
              <input
                className="input"
                value={settings.libraryName}
                onChange={e => setSettings({...settings, libraryName: e.target.value})}
                placeholder="City Library"
              />
            </div>
          </div>
        </div>

        {/* Borrowing Rules */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={16} color="#3B82F6" />
            </div>
            <div className="settings-section-title">Borrowing Rules</div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Maximum Borrow Duration</div>
              <div className="settings-row-desc">How many days a member can keep a book</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <input
                type="number"
                className="input"
                style={{ width: 80, textAlign: 'center' }}
                value={settings.maxBorrowDays}
                onChange={e => setSettings({...settings, maxBorrowDays: parseInt(e.target.value) || 1})}
                min={1} max={60}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>days</span>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Books Per Member Limit</div>
              <div className="settings-row-desc">Maximum books a member can borrow at once</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <input
                type="number"
                className="input"
                style={{ width: 80, textAlign: 'center' }}
                value={settings.maxBooksPerUser}
                onChange={e => setSettings({...settings, maxBooksPerUser: parseInt(e.target.value) || 1})}
                min={1} max={20}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>books</span>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Active Online Requests Limit</div>
              <div className="settings-row-desc">Maximum pending/approved online requests a member can have</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <input
                type="number"
                className="input"
                style={{ width: 80, textAlign: 'center' }}
                value={settings.maxOnlineRequestsPerUser}
                onChange={e => setSettings({...settings, maxOnlineRequestsPerUser: parseInt(e.target.value) || 1})}
                min={1} max={10}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>requests</span>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Max Online Reservations Per Book</div>
              <div className="settings-row-desc">Maximum active online requests/reservations allowed per book</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <input
                type="number"
                className="input"
                style={{ width: 80, textAlign: 'center' }}
                value={settings.maxOnlineCopiesPerBook}
                onChange={e => setSettings({...settings, maxOnlineCopiesPerBook: parseInt(e.target.value) || 1})}
                min={1} max={10}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>copies</span>
            </div>
          </div>
        </div>

        {/* Fine Settings */}
        <div className="settings-section">
          <div className="settings-section-header">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={16} color="#D97706" />
            </div>
            <div className="settings-section-title">Fine Policy</div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Daily Fine Rate</div>
              <div className="settings-row-desc">Amount charged per overdue day</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>₹</span>
              <input
                type="number"
                className="input"
                style={{ width: 100, textAlign: 'center' }}
                value={settings.finePerDay}
                onChange={e => setSettings({...settings, finePerDay: parseFloat(e.target.value) || 0})}
                min={0} step={0.5}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>per day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
