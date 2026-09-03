import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Empty state component shown when no data is available.
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div
        className="p-4 rounded-2xl mb-4"
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      >
        {icon || <Inbox size={40} style={{ color: 'var(--text-tertiary)' }} />}
      </div>
      <h3
        className="text-lg font-semibold mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm max-w-sm text-center mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
