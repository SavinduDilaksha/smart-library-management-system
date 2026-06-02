'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard, BookPlus, BookCheck, BookOpen,
  AlertTriangle, FileText, LogOut, Library, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const staffLinks = [
  { href: '/staff/dashboard',      label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/staff/issue-book',     label: 'Issue Book',    icon: BookPlus },
  { href: '/staff/return-book',    label: 'Return Book',   icon: BookCheck },
  { href: '/staff/borrowed-books', label: 'Borrowed Books',icon: BookOpen },
  { href: '/staff/overdue-books',  label: 'Overdue Books', icon: AlertTriangle },
  { href: '/staff/reports',        label: 'Reports',       icon: FileText },
];

function getInitials(name?: string | null) {
  if (!name) return 'S';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function StaffSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="sidebar-root" style={{ width: collapsed ? '68px' : 'var(--sidebar-width)' }}>
      {/* Header */}
      <div className="sidebar-header" style={{ justifyContent: collapsed ? 'center' : undefined }}>
        <div className="sidebar-logo" style={{ background: 'linear-gradient(135deg, #059669, #0D9488)' }}>
          <Library size={20} color="white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <div className="sidebar-title">Staff Panel</div>
            <div className="sidebar-subtitle">Library System</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="sidebar-nav">
        {!collapsed && <div className="sidebar-nav-section-label">Operations</div>}
        {staffLinks.map(link => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={`sidebar-link${active ? ' active' : ''}`}
              style={{ justifyContent: collapsed ? 'center' : undefined }}
            >
              {active && <div className="sidebar-link-indicator" style={{ background: '#059669' }} />}
              <Icon size={17} className="sidebar-link-icon" style={{ flexShrink: 0, color: active ? '#059669' : undefined }} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && session?.user && (
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar" style={{ background: 'linear-gradient(135deg, #059669, #0D9488)' }}>
              {getInitials(session.user.name)}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="sidebar-user-name">{session.user.name}</div>
              <div className="sidebar-user-email">{session.user.email}</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button
            className="sidebar-footer-btn"
            style={{ justifyContent: collapsed ? 'center' : undefined, flex: 1 }}
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
          </button>
          <button
            className="sidebar-footer-btn danger"
            style={{ justifyContent: collapsed ? 'center' : undefined, flex: collapsed ? 1 : 'none' }}
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Sign Out"
          >
            <LogOut size={16} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
