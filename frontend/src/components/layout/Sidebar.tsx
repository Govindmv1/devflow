import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users,
  Bell, BarChart3, Settings, Sparkles, Columns3,
  ChevronLeft, ChevronRight, Zap, Activity,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const NAV = [
  { label: 'Dashboard',    path: '/dashboard',     Icon: LayoutDashboard },
  { label: 'Projects',     path: '/projects',      Icon: FolderKanban },
  { label: 'Tasks',        path: '/tasks',         Icon: CheckSquare },
  { label: 'Kanban Board', path: '/kanban',        Icon: Columns3 },
  { label: 'Team',         path: '/team',          Icon: Users },
  { label: 'Analytics',   path: '/analytics',     Icon: BarChart3 },
  { label: 'AI Assistant', path: '/ai',            Icon: Sparkles, badge: 'AI' },
  { label: 'Notifications',path: '/notifications', Icon: Bell },
  { label: 'Settings',     path: '/settings',      Icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  return (
    <aside
      className="df-sidebar"
      style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 30,
        width: isCollapsed ? 64 : 240,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width .25s cubic-bezier(.16,1,.3,1)',
      }}
    >
      {/* Brand */}
      <div style={{
        height: 56, display: 'flex', alignItems: 'center',
        padding: isCollapsed ? '0 16px' : '0 16px',
        borderBottom: '1px solid var(--sidebar-border)',
        flexShrink: 0,
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, #6366f1, #22d3a5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(99,102,241,.35)',
        }}>
          <Zap size={15} color="#fff" />
        </div>
        {!isCollapsed && (
          <div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 15, lineHeight: 1.1 }}>DevFlow</div>
            <div style={{ color: 'var(--accent)', fontSize: 9.5, fontWeight: 700, letterSpacing: '.07em' }}>ENTERPRISE</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ label, path, Icon, badge }) => {
          const isActive = location.pathname === path ||
            (path !== '/dashboard' && location.pathname.startsWith(path));
          return (
            <NavLink
              key={path}
              to={path}
              title={isCollapsed ? label : undefined}
              className={`df-nav-item ${isActive ? 'active' : ''}`}
              style={isCollapsed ? { justifyContent: 'center', padding: '9px 0' } : {}}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!isCollapsed && (
                <>
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '1px 6px',
                      borderRadius: 4, letterSpacing: '.05em',
                      background: 'var(--accent-bg)',
                      color: 'var(--accent-light)',
                      border: '1px solid var(--accent-border)',
                    }}>
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* DB status badge */}
      {!isCollapsed && (
        <div style={{
          margin: '0 8px 8px',
          padding: '10px 12px',
          borderRadius: 10,
          background: 'var(--green-bg)',
          border: '1px solid var(--green-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
              <span style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'var(--green)', opacity: 0.6,
                animation: 'ping-dot 1.5s ease-in-out infinite',
              }} />
              <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
            </span>
            <span style={{ color: 'var(--green)', fontSize: 11.5, fontWeight: 600 }}>MySQL 8.0 Connected</span>
          </div>
          <Activity size={12} style={{ color: 'var(--green)' }} />
        </div>
      )}

      {/* Collapse toggle */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
        <button
          onClick={onToggle}
          style={{
            width: '100%', height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, border: 'none', background: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            transition: 'background .15s ease, color .15s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'none';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
          }}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </aside>
  );
};
