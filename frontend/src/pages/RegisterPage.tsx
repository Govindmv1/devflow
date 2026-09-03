import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.first_name.trim()) errors.first_name = 'First name required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name required';
    if (!formData.email) errors.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email';
    if (!formData.password) errors.password = 'Password required';
    else if (formData.password.length < 8) errors.password = 'Min 8 chars required';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
      });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch {
      toast.error(error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans overflow-hidden">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex lg:w-7/12 relative gradient-hero-bg items-center justify-center p-16 overflow-hidden">
        {/* Ambient Orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl ambient-orb" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl ambient-orb" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-2xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md text-emerald-300 text-xs font-semibold uppercase tracking-wide">
            <Sparkles size={14} className="text-emerald-400" />
            <span>Join 10,000+ Software Engineers</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
              Start Building with <span className="gradient-text-vibrant">DevFlow Workspace</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Create your account to unlock AI-assisted project management, drag-and-drop Kanban tracking, and real-time developer analytics.
            </p>
          </div>

          {/* Value Props */}
          <div className="space-y-3 pt-2">
            {[
              'Unlimited Projects & Drag-and-Drop Kanban Boards',
              'Automated AI Standups & Predictive Sprint Velocity',
              'Enterprise MySQL Database Storage & Role Access Control',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative bg-slate-900/60 backdrop-blur-xl">
        <div className="w-full max-w-md space-y-6 animate-slide-up">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Layers size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">DevFlow</h2>
              <p className="text-xs text-slate-400 font-medium">Enterprise Software Engineering Platform</p>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <h3 className="text-xl font-bold text-slate-100">Create your account</h3>
            <p className="text-xs text-slate-400">Enter your details to get started with your workspace</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">First Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Alex"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                {formErrors.first_name && <p className="text-[11px] text-rose-400">{formErrors.first_name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Last Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Morgan"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                {formErrors.last_name && <p className="text-[11px] text-rose-400">{formErrors.last_name}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  placeholder="alex@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              {formErrors.email && <p className="text-[11px] text-rose-400">{formErrors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formErrors.password && <p className="text-[11px] text-rose-400">{formErrors.password}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              {formErrors.confirmPassword && <p className="text-[11px] text-rose-400">{formErrors.confirmPassword}</p>}
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
              isLoading={isLoading}
            >
              <span>Create Account</span>
              <ArrowRight size={15} />
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Already have an account?</span>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center gap-1">
              Sign In <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
