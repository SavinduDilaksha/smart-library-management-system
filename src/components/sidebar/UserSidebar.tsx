'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard, BookOpen, History, BookPlus,
  RotateCcw, DollarSign, Bell, UserCircle, LogOut,
  Library, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const userLinks = [
  { href: '/user/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/user/catalog',       label: 'Browse Books',  icon: BookOpen },
  { href: '/user/history',       label: 'Borrow History',icon: History },
  { href: '/user/borrow',        label: 'My Requests',   icon: BookPlus },
  { href: '/user/return',        label: 'Return Status', icon: RotateCcw },
  { href: '/user/fines',         label: 'My Fines',      icon: DollarSign },
  { href: '/user/notifications', label: 'Notifications', icon: Bell },
  { href: '/user/profile',       label: 'My Profile',    icon: UserCircle },
];

function getInitials(name?: string | null) {
  if (!name) return 'M';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function UserSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="sidebar-root" style={{ width: collapsed ? '68px' : 'var(--sidebar-width)' }}>
      {/* Header */}
      <div className="sidebar-header" style={{ justifyContent: collapsed ? 'center' : undefined }}>
        <div className="sidebar-logo" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
          <Library size={20} color="white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <div className="sidebar-title">My Library</div>
            <div className="sidebar-subtitle">Member Portal</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="sidebar-nav">
        {!collapsed && <div className="sidebar-nav-section-label">My Account</div>}
        {userLinks.slice(0, 2).map(link => {
          const active = pathname === link.href || (link.href === '/user/catalog' && pathname.startsWith('/user/books'));
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

        {!collapsed && <div className="sidebar-nav-section-label">Books</div>}
        {userLinks.slice(2, 5).map(link => {
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

        {!collapsed && <div className="sidebar-nav-section-label">More</div>}
        {userLinks.slice(5).map(link => {
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
