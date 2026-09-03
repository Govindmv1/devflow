import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Search, LogOut, Settings, ChevronDown, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useTaskStore } from '../../store/taskStore';

export const TopNav: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const { unreadNotificationsCount, fetchNotifications } = useTaskStore();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [query, setQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const t = setInterval(fetchNotifications, 120_000);
    return () => clearInterval(t);
  }, [fetchNotifications]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/tasks?search=${encodeURIComponent(query.trim())}`);
  };

  const initials = user ? `${user.first_name[0]}${user.last_name[0]}` : 'U';

  return (
    <header className="df-topnav" style={{
      height: 56, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 20px',
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      {/* Search */}
      <form onSubmit={handleSearch} style={{ maxWidth: 320, flex: 1 }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{
            position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search tasks or projects..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="df-input"
            style={{ paddingLeft: 32, paddingTop: 8, paddingBottom: 8, fontSize: 13 }}
          />
          <span style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)',
            padding: '2px 6px', borderRadius: 5,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}>⌘K</span>
        </div>
      </form>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="icon-btn"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark
            ? <Sun size={16} style={{ color: 'var(--amber)' }} />
            : <Moon size={16} style={{ color: 'var(--accent)' }} />
          }
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="icon-btn"
          style={{ position: 'relative' }}
        >
          <Bell size={16} />
          {unreadNotificationsCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--red)', color: '#fff',
              fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--bg-primary)',
            }}>
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 10px 5px 5px',
              borderRadius: 10,
              border: '1.5px solid var(--border)',
              background: 'var(--bg-elevated)',
              cursor: 'pointer',
              transition: 'border-color .15s ease, background .15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)';
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-elevated)';
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'linear-gradient(135deg, #6366f1, #22d3a5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 11, letterSpacing: '.02em',
            }}>
              {initials}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 600, lineHeight: 1.2 }}>
                {user ? `${user.first_name} ${user.last_name}` : 'User'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                {user?.role}
              </div>
            </div>
            <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
          </button>

          {showMenu && (
            <div
              className="animate-slide-up"
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                width: 200, borderRadius: 12, overflow: 'hidden', zIndex: 50,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {/* User info */}
              <div style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 600 }}>{user?.email}</div>
                <div style={{
                  marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 8px', borderRadius: 100,
                  background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                  color: 'var(--accent-light)', fontSize: 10, fontWeight: 700,
                }}>
                  {user?.role}
                </div>
              </div>

              {/* Menu items */}
              {[
                { label: 'Profile', Icon: User, path: '/profile' },
                { label: 'Settings', Icon: Settings, path: '/settings' },
              ].map(item => (
                <button key={item.path}
                  onClick={() => { navigate(item.path); setShowMenu(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', border: 'none', background: 'none',
                    cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13,
                    transition: 'background .12s ease, color .12s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'none';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                  }}
                >
                  <item.Icon size={14} />
                  {item.label}
                </button>
              ))}

              <div style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={async () => { await logout(); navigate('/login'); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', border: 'none', background: 'none',
                    cursor: 'pointer', color: 'var(--red)', fontSize: 13,
                    transition: 'background .12s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--red-bg)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
