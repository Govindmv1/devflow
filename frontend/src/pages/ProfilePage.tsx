import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Shield, Calendar, Mail, UserCheck } from 'lucide-react';
import { Card, Badge } from '../components/ui';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>User Profile</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>View your active credentials and organization details.</p>
      </div>

      <Card className="p-6 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-accent-500" />
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-md">
            {user.first_name[0]}{user.last_name[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {user.first_name} {user.last_name}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="info">{user.role.replace('_', ' ').toLowerCase()}</Badge>
              {user.is_active && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Account
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6" style={{ borderColor: 'var(--border-color)' }}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail size={16} className="text-surface-400" />
              <div>
                <span className="block text-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>Email Address</span>
                <span className="text-white font-medium">{user.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <UserCheck size={16} className="text-surface-400" />
              <div>
                <span className="block text-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>User ID</span>
                <span className="text-white font-mono text-xs">{user.id}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Shield size={16} className="text-surface-400" />
              <div>
                <span className="block text-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>Role Authorization</span>
                <span className="text-white font-medium">{user.role}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-surface-400" />
              <div>
                <span className="block text-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>Joined Since</span>
                <span className="text-white font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
