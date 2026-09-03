import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, CheckSquare, Clock, AlertTriangle,
  Activity, Sparkles, TrendingUp, CheckCircle2, ArrowRight, Calendar,
} from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';

/* ─── Metric Card ───────────────────────────── */
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}> = ({ title, value, icon, color, bgColor }) => (
  <div
    className="df-card df-card-hover"
    style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16, cursor: 'default', transition: 'all .2s ease' }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color }}>{icon}</span>
      </div>
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 3 }}>{title}</div>
    </div>
  </div>
);

/* ─── Main Page ─────────────────────────────── */
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { dashboardStats, recentActivity, fetchDashboardStats, isLoading } = useTaskStore();

  useEffect(() => { fetchDashboardStats(); }, [fetchDashboardStats]);

  const s = dashboardStats || {
    totalProjects: 0, activeProjects: 0, completedProjects: 0,
    totalTasks: 0, completedTasks: 0, pendingTasks: 0,
    overdueTasks: 0, myTasks: 0,
  };

  const rate = s.totalTasks > 0 ? Math.round((s.completedTasks / s.totalTasks) * 100) : 0;
  const v = (n: number) => isLoading ? '—' : n;

  return (
    <div
      className="animate-slide-up"
      style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 48, fontFamily: 'var(--font-sans)' }}
    >
      {/* ── Welcome Banner ── */}
      <div
        className="df-card"
        style={{
          padding: '24px 28px',
          display: 'flex', flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between', gap: 20,
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Subtle radial accent */}
        <div style={{
          position: 'absolute', right: -60, top: -60, width: 280, height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-bg) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 12px', borderRadius: 100, marginBottom: 10,
            background: 'var(--accent-bg)',
            border: '1px solid var(--accent-border)',
            color: 'var(--accent-light)', fontSize: 11, fontWeight: 700, letterSpacing: '.06em',
          }}>
            <Sparkles size={11} /> EXECUTIVE DASHBOARD
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em',
            color: 'var(--text-primary)', lineHeight: 1.2,
          }}>
            Welcome back, {user?.first_name ?? 'Developer'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginTop: 6, maxWidth: 460 }}>
            Real-time project tracking, Kanban velocity metrics, and team performance.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <button className="df-btn df-btn-secondary" onClick={() => navigate('/projects')} style={{ fontSize: 13 }}>
            <FolderKanban size={14} /> Projects
          </button>
          <button className="df-btn df-btn-primary" onClick={() => navigate('/kanban')} style={{ fontSize: 13 }}>
            <CheckSquare size={14} /> Kanban Board
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <MetricCard title="Active Projects"    value={v(s.activeProjects)}  icon={<FolderKanban size={19}/>}  color="var(--accent-light)" bgColor="var(--accent-bg)" />
        <MetricCard title="My Assigned Tasks"  value={v(s.myTasks)}          icon={<CheckSquare size={19}/>}   color="var(--green)"        bgColor="var(--green-bg)" />
        <MetricCard title="Pending Tasks"      value={v(s.pendingTasks)}     icon={<Clock size={19}/>}         color="var(--amber)"        bgColor="var(--amber-bg)" />
        <MetricCard title="Overdue Items"      value={v(s.overdueTasks)}     icon={<AlertTriangle size={19}/>} color="var(--red)"          bgColor="var(--red-bg)" />
      </div>

      {/* ── Lower Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(260px,320px)', gap: 20 }}>

        {/* Activity Feed */}
        <div className="df-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingBottom: 14, borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} style={{ color: 'var(--blue)' }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14 }}>Activity Log</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 100,
              background: 'var(--green-bg)', border: '1px solid var(--green-border)',
              color: 'var(--green)', fontSize: 11, fontWeight: 600,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
              Live
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10 }}>
                    <div className="skeleton" style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
                      <div className="skeleton" style={{ height: 11, width: '65%' }} />
                      <div className="skeleton" style={{ height: 9, width: '40%' }} />
                    </div>
                  </div>
                ))
              : recentActivity.length === 0
                ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <CheckCircle2 size={30} style={{ color: 'var(--green)', opacity: .4, margin: '0 auto 8px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No activity yet today</p>
                  </div>
                )
                : recentActivity.map((a: any) => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '10px 12px', borderRadius: 10,
                      transition: 'background .12s ease', cursor: 'default',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, var(--accent), var(--green))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 800, fontSize: 12, textTransform: 'uppercase',
                    }}>
                      {a.first_name?.charAt(0) ?? 'U'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.4 }}>
                        <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{a.first_name} {a.last_name}</span>
                        {' '}
                        <span style={{ color: 'var(--text-secondary)' }}>{a.action}</span>
                      </p>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 2, display: 'block' }}>
                        {new Date(a.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Sprint progress */}
          <div className="df-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={15} style={{ color: 'var(--green)' }} />
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 13.5 }}>Sprint Completion</span>
              </div>
              <span style={{ color: 'var(--green)', fontWeight: 800, fontSize: 20 }}>
                {isLoading ? '—' : `${rate}%`}
              </span>
            </div>
            <div className="df-progress">
              <div className="df-progress-bar" style={{ width: isLoading ? 0 : `${rate}%` }} />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: 10, color: 'var(--text-muted)', fontSize: 11.5,
            }}>
              <span>{s.completedTasks} completed</span>
              <span>{s.totalTasks} total</span>
            </div>
          </div>

          {/* Session info */}
          <div className="df-card" style={{ padding: 22, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Calendar size={15} style={{ color: 'var(--purple)' }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 13.5 }}>Active Session</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { k: 'Role',     v: user?.role },
                { k: 'Email',    v: user?.email },
                { k: 'Database', v: 'MySQL 8.0' },
              ].map((row, i, arr) => (
                <div key={row.k} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12.5 }}>{row.k}</span>
                  <span style={{
                    color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 600,
                    maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{row.v}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/ai')}
              style={{
                marginTop: 18, width: '100%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '10px 16px', borderRadius: 10,
                background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                color: 'var(--accent-light)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all .15s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,.18)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-bg)'; }}
            >
              <Sparkles size={14} />
              Launch AI Assistant
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
