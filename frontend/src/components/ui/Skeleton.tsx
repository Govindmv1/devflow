import React from 'react';
import clsx from 'clsx';

/**
 * Skeleton loading components for better UX during data fetching.
 */

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, width, height }) => (
  <div
    className={clsx('animate-pulse rounded-lg bg-surface-200 dark:bg-surface-700', className)}
    style={{ width, height }}
  />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <div className={clsx('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height="14px"
        className={i === lines - 1 ? 'w-3/4' : 'w-full'}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC = () => (
  <div
    className="rounded-xl border p-6 space-y-4"
    style={{
      backgroundColor: 'var(--bg-primary)',
      borderColor: 'var(--border-color)',
    }}
  >
    <div className="flex items-center justify-between">
      <Skeleton width="120px" height="20px" />
      <Skeleton width="80px" height="24px" className="rounded-full" />
    </div>
    <SkeletonText lines={2} />
    <div className="flex items-center gap-2">
      <Skeleton width="32px" height="32px" className="rounded-full" />
      <Skeleton width="100px" height="14px" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => (
  <div className="space-y-3">
    <div className="flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height="16px" className="flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} height="40px" className="flex-1" />
        ))}
      </div>
    ))}
  </div>
);
