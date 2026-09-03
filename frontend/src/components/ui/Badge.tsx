import React from 'react';
import clsx from 'clsx';
import { TaskPriority, ProjectPriority, TaskStatus, ProjectStatus, UserRole } from '../../types';

/**
 * Badge component for statuses, priorities, and roles.
 */
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className,
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full mr-1.5',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'danger' && 'bg-red-500',
            variant === 'info' && 'bg-blue-500',
            variant === 'purple' && 'bg-purple-500',
            variant === 'default' && 'bg-surface-500'
          )}
        />
      )}
      {children}
    </span>
  );
};

// Helper functions for mapping enums to badge variants
export const getPriorityVariant = (priority: TaskPriority | ProjectPriority): BadgeProps['variant'] => {
  switch (priority) {
    case 'LOW': return 'default';
    case 'MEDIUM': return 'info';
    case 'HIGH': return 'warning';
    case 'CRITICAL': return 'danger';
    default: return 'default';
  }
};

export const getStatusVariant = (status: TaskStatus | ProjectStatus): BadgeProps['variant'] => {
  switch (status) {
    case 'TODO':
    case 'PLANNING': return 'default';
    case 'IN_PROGRESS':
    case 'ACTIVE': return 'info';
    case 'IN_REVIEW':
    case 'ON_HOLD': return 'warning';
    case 'BLOCKED': return 'danger';
    case 'DONE':
    case 'COMPLETED': return 'success';
    case 'ARCHIVED': return 'purple';
    default: return 'default';
  }
};

export const getRoleVariant = (role: UserRole): BadgeProps['variant'] => {
  switch (role) {
    case UserRole.ADMIN: return 'danger';
    case UserRole.PROJECT_MANAGER: return 'purple';
    case UserRole.DEVELOPER: return 'info';
    default: return 'default';
  }
};
