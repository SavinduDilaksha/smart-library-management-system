'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard, BookOpen, Users, UserCog, ArrowLeftRight,
  DollarSign, FileText, Bell, Settings, LogOut, ChevronLeft,
  ChevronRight, Library,
} from 'lucide-react';
import { useState } from 'react';

const adminLinks = [
  { href: '/admin/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/books',        label: 'Books',          icon: BookOpen },
  { href: '/admin/users',        label: 'Members',        icon: Users },
  { href: '/admin/staff',        label: 'Staff',          icon: UserCog },
  { href: '/admin/issue-return', label: 'Issue / Return', icon: ArrowLeftRight },
  { href: '/admin/fines',        label: 'Fines',          icon: DollarSign },
  { href: '/admin/reports',      label: 'Reports',        icon: FileText },
  { href: '/admin/notifications',label: 'Notifications',  icon: Bell },
  { href: '/admin/settings',     label: 'Settings',       icon: Settings },
];

function getInitials(name?: string | null) {
  if (!name) return 'A';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="sidebar-root" style={{ width: collapsed ? '68px' : 'var(--sidebar-width)' }}>
      {/* Header */}
      <div className="sidebar-header" style={{ justifyContent: collapsed ? 'center' : undefined }}>
        <div className="sidebar-logo">
          <Library size={20} color="white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <div className="sidebar-title">Library Admin</div>
            <div className="sidebar-subtitle">Management System</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="sidebar-nav">
        {!collapsed && <div className="sidebar-nav-section-label">Main Menu</div>}
        {adminLinks.slice(0, 5).map(link => {
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
              {active && <div className="sidebar-link-indicator" />}
              <Icon size={17} className="sidebar-link-icon" style={{ flexShrink: 0 }} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}

        {!collapsed && <div className="sidebar-nav-section-label">Finance & Reports</div>}
        {adminLinks.slice(5, 8).map(link => {
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
              {active && <div className="sidebar-link-indicator" />}
              <Icon size={17} className="sidebar-link-icon" style={{ flexShrink: 0 }} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}

        {!collapsed && <div className="sidebar-nav-section-label">System</div>}
        {adminLinks.slice(8).map(link => {
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
              {active && <div className="sidebar-link-indicator" />}
              <Icon size={17} className="sidebar-link-icon" style={{ flexShrink: 0 }} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && session?.user && (
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">{getInitials(session.user.name)}</div>
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
