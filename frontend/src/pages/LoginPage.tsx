import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, Zap,
  ArrowRight, Code2, GitBranch, Layers3,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const PERSONAS = [
  {
    label: 'Developer',
    sub: 'Full-Stack Eng.',
    email: 'dev@devflow.com',
    pass: 'Developer123!',
    Icon: Zap,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,.12)',
    border: 'rgba(251,191,36,.3)',
  },
  {
    label: 'PM',
    sub: 'Project Manager',
    email: 'pm@devflow.com',
    pass: 'Manager123!',
    Icon: ShieldCheck,
    color: '#22d3a5',
    bg: 'rgba(34,211,165,.12)',
    border: 'rgba(34,211,165,.3)',
  },
  {
    label: 'Admin',
    sub: 'System Admin',
    email: 'admin@devflow.com',
    pass: 'Admin123!',
    Icon: Sparkles,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,.12)',
    border: 'rgba(167,139,250,.3)',
  },
];

const FEATURES = [
  { icon: Code2, text: 'React + TypeScript + Vite' },
  { icon: GitBranch, text: 'Real-time Kanban + AI Standups' },
  { icon: Layers3, text: 'MySQL 8.0 + JWT Auth + RBAC' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activePersona, setActivePersona] = useState('');

  const quickFill = (p: typeof PERSONAS[0]) => {
    setForm({ email: p.email, password: p.pass });
    setActivePersona(p.email);
    setErrors({});
    clearError();
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await login(form);
      toast.success('Welcome to DevFlow!');
      navigate('/dashboard');
    } catch {
      toast.error(error || 'Login failed');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'var(--bg-root)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* ══════════════════════════════════════════
          LEFT — Hero Panel
          ══════════════════════════════════════════ */}
      <div
        style={{
          display: 'none',
          flexBasis: '52%',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #0a0118 0%, #0d111a 40%, #060e14 100%)',
        }}
        className="lg-hero"
      >
        {/* Orbs */}
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'float-orb 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '5%',
          width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,165,.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'float-orb 8s ease-in-out infinite reverse',
        }} />
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.12,
          backgroundImage: 'linear-gradient(rgba(99,102,241,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.4) 1px,transparent 1px)',
          backgroundSize: '44px 44px',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column',
          height: '100%', padding: '52px 56px', justifyContent: 'center',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #22d3a5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(99,102,241,.4)',
            }}>
              <Layers3 size={20} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#e2e8f0', fontWeight: 800, fontSize: 18, lineHeight: 1.1 }}>DevFlow</div>
              <div style={{ color: '#6366f1', fontSize: 11, fontWeight: 600, letterSpacing: '.05em' }}>ENTERPRISE</div>
            </div>
          </div>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 14px', borderRadius: 100, marginBottom: 24,
            background: 'rgba(99,102,241,.12)',
            border: '1px solid rgba(99,102,241,.3)',
            color: '#a5b4fc', fontSize: 11, fontWeight: 700, letterSpacing: '.08em',
          }}>
            <Sparkles size={12} />
            MNC-GRADE PORTFOLIO PROJECT
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 40, fontWeight: 800, lineHeight: 1.2,
            color: '#e2e8f0', marginBottom: 16, letterSpacing: '-0.02em',
          }}>
            Manage Projects<br />
            with{' '}
            <span style={{
              background: 'linear-gradient(135deg,#a78bfa,#6366f1,#22d3a5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              AI Precision
            </span>
          </h1>

          <p style={{ color: '#8892a4', fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 380 }}>
            A production-ready project management platform designed
            to showcase full-stack engineering to MNC recruiters.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(99,102,241,.12)',
                  border: '1px solid rgba(99,102,241,.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={15} color="#a5b4fc" />
                </div>
                <span style={{ color: '#cbd5e1', fontSize: 13.5, fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { val: '99.99%', lbl: 'Uptime', color: '#6366f1' },
              { val: 'MySQL 8', lbl: 'Database', color: '#22d3a5' },
              { val: 'JWT+RBAC', lbl: 'Auth Model', color: '#a78bfa' },
            ].map(s => (
              <div key={s.lbl} style={{
                padding: '14px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,.03)',
                border: '1px solid rgba(255,255,255,.07)',
              }}>
                <div style={{ color: s.color, fontWeight: 700, fontSize: 15 }}>{s.val}</div>
                <div style={{ color: '#5c6b80', fontSize: 11, marginTop: 3 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT — Login Form
          ══════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: 'var(--bg-primary)',
      }}>
        <div
          className="animate-slide-up"
          style={{ width: '100%', maxWidth: 400 }}
        >
          {/* Logo (visible on mobile / always-right panels) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #22d3a5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(99,102,241,.3)',
            }}>
              <Layers3 size={18} color="#fff" />
            </div>
            <div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 17, lineHeight: 1.1 }}>DevFlow</div>
              <div style={{ color: 'var(--accent)', fontSize: 10, fontWeight: 700, letterSpacing: '.06em' }}>ENTERPRISE PLATFORM</div>
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.01em' }}>
              Sign in to your workspace
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginTop: 5 }}>
              Pick a demo persona or enter your credentials below
            </p>
          </div>

          {/* Persona selector */}
          <div style={{ marginBottom: 22 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '.07em',
              textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10,
            }}>
              ⚡ Quick Demo Access
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
              {PERSONAS.map(p => {
                const isActive = activePersona === p.email;
                return (
                  <button
                    key={p.email}
                    onClick={() => quickFill(p)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 12,
                      border: `1.5px solid ${isActive ? p.border : 'var(--border)'}`,
                      background: isActive ? p.bg : 'var(--bg-elevated)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all .15s ease',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = p.border;
                        (e.currentTarget as HTMLButtonElement).style.background = p.bg;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-elevated)';
                      }
                    }}
                  >
                    <p.Icon size={16} color={p.color} />
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 12.5, marginTop: 8 }}>
                      {p.label}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10.5, marginTop: 2 }}>{p.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 16,
              background: 'var(--red-bg)', border: '1px solid var(--red-border)',
              color: 'var(--red)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 12.5, fontWeight: 500, marginBottom: 6 }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="df-input"
                  style={{
                    paddingLeft: 36,
                    borderColor: errors.email ? 'var(--red)' : 'var(--border)',
                  }}
                />
              </div>
              {errors.email && <p style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 12.5, fontWeight: 500, marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="df-input"
                  style={{
                    paddingLeft: 36,
                    paddingRight: 40,
                    borderColor: errors.password ? 'var(--red)' : 'var(--border)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    padding: 0, display: 'flex',
                  }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="df-btn df-btn-primary"
              style={{
                width: '100%', height: 44, fontSize: 14, borderRadius: 11,
                marginTop: 4, opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? (
                <div style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin .7s linear infinite',
                }} />
              ) : (
                <>Sign in to Platform <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 12.5, color: 'var(--text-muted)',
          }}>
            <span>New to DevFlow?</span>
            <Link
              to="/register"
              style={{
                color: 'var(--accent-light)', fontWeight: 600,
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              Create account <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Hero panel shows on lg screens */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-hero { display: flex !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default LoginPage;
