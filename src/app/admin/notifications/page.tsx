'use client';

import { useState } from 'react';
import { Bell, Send, Loader2 } from 'lucide-react';

export default function AdminNotificationsPage() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, type: 'INFO' }),
      });
      const json = await res.json();
      if (json.success) {
        setSent(true);
        setMessage('');
        setTimeout(() => setSent(false), 3000);
      } else {
        alert(json.error || 'Failed to broadcast announcement');
      }
    } catch {
      alert('Error broadcasting announcement');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Notifications</h1>
        <p>Send announcement notifications to all library members and staff</p>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '1.75rem',
        maxWidth: '600px',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: 'var(--accent-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)',
          }}>
            <Bell size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Send Announcement</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>This broadcast will appear in the notification feeds</p>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Message Content</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your announcement message here..."
            className="input"
            rows={5}
            style={{ minHeight: '120px', resize: 'vertical', padding: '0.75rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="btn btn-primary"
            style={{ gap: '0.5rem' }}
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Broadcast Announcement</>}
          </button>
          {sent && (
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--success)' }} className="animate-scale-in">
              ✓ Sent successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

