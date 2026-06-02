'use client';

import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Bell, ChevronRight, LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

// Map paths to readable breadcrumbs
const pathLabels: Record<string, string> = {
  'dashboard':     'Dashboard',
  'books':         'Books',
  'users':         'Members',
  'staff':         'Staff',
  'issue-return':  'Issue & Return',
  'fines':         'Fines',
  'reports':       'Reports',
  'notifications': 'Notifications',
  'settings':      'Settings',
  'catalog':       'Book Catalog',
  'history':       'Borrow History',
  'borrow':        'My Requests',
  'return':        'Return Status',
  'profile':       'My Profile',
  'issue-book':    'Issue Book',
  'return-book':   'Return Book',
  'borrowed-books':'Borrowed Books',
  'overdue-books': 'Overdue Books',
  'admin':         'Admin',
  'user':          'Member',
};

function getInitials(name?: string | null) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

interface TopHeaderProps {
  role?: 'admin' | 'staff' | 'user';
}

export default function TopHeader({ role = 'admin' }: TopHeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [unreadCount, setUnreadCount] = useState(0);

  // Build breadcrumb from pathname
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map(s => pathLabels[s] || s.charAt(0).toUpperCase() + s.slice(1));

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      if (json.success) {
        const count = json.data.filter((n: { read: boolean }) => !n.read).length;
        setUnreadCount(count);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 15000);
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const roleColors = {
    admin: '#4F46E5',
    staff: '#059669',
    user:  '#4F46E5',
  };

  return (
    <header className="top-header">
      {/* Breadcrumb */}
      <nav className="header-breadcrumb">
        <span style={{ color: 'var(--text-muted)' }}>
          {role === 'admin' ? 'Admin' : role === 'staff' ? 'Staff' : 'Member'}
        </span>
        {crumbs.slice(1).map((crumb, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
            <span className={i === crumbs.length - 2 ? 'header-breadcrumb-current' : ''}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Actions */}
      <div className="header-actions">
        {/* Notification bell */}
        <Link href={`/${role}/notifications`} className="header-icon-btn" style={{ textDecoration: 'none', position: 'relative' }}>
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="notif-badge">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User avatar dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="header-avatar"
            style={{ background: `linear-gradient(135deg, ${roleColors[role]}, #7C3AED)` }}
            onClick={() => setDropdownOpen(v => !v)}
            title={session?.user?.name || 'Account'}
          >
            {getInitials(session?.user?.name)}
          </button>

          {dropdownOpen && (
            <div className="animate-scale-in" style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: '12px', boxShadow: 'var(--shadow-xl)',
              minWidth: '220px', zIndex: 200, overflow: 'hidden',
            }}>
              {/* User info */}
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {session?.user?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {session?.user?.email}
                </div>
                <span style={{
                  display: 'inline-block', marginTop: '0.5rem',
                  padding: '0.125rem 0.5rem', borderRadius: '100px',
                  background: 'var(--accent-light)', color: 'var(--accent)',
                  fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
                }}>
                  {role}
                </span>
              </div>

              {/* Menu items */}
              <div style={{ padding: '0.375rem' }}>
                {role !== 'staff' && (
                  <Link
                    href={`/${role}/profile`}
                    className="sidebar-link"
                    style={{ margin: 0, borderRadius: '8px' }}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={15} />
                    <span>My Profile</span>
                  </Link>
                )}
                {role === 'admin' && (
                  <Link
                    href="/admin/settings"
                    className="sidebar-link"
                    style={{ margin: 0, borderRadius: '8px' }}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings size={15} />
                    <span>Settings</span>
                  </Link>
                )}
                <button
                  className="sidebar-footer-btn danger"
                  style={{ width: '100%', borderRadius: '8px' }}
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
