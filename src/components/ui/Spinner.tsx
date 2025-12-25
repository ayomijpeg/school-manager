// src/components/ui/Spinner.tsx
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fullScreen?: boolean;
  text?: string;
}

const sizeMap: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  xl: 'h-12 w-12',
};

export default function Spinner({
  size = 'md',
  className,
  fullScreen = false,
  text,
}: SpinnerProps) {
  const spinnerNode = (
    <div className="flex flex-col items-center gap-3">
      <div className={cn('relative flex items-center justify-center', className)}>
        {/* brighter halo */}
        <div
          className={cn(
            'absolute rounded-full bg-indigo-500/20 blur-xl',
            size === 'sm' && 'h-8 w-8',
            size === 'md' && 'h-10 w-10',
            size === 'lg' && 'h-12 w-12',
            size === 'xl' && 'h-14 w-14',
          )}
        />
        {/* main spinner: thicker + high contrast */}
        <div
          className={cn(
            'relative rounded-full border-4 border-slate-200/70 dark:border-slate-700',
            'border-t-indigo-600 dark:border-t-indigo-400',
            'animate-spin',
            sizeMap[size],
          )}
        />
      </div>
      {text && (
        <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-200">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
        {spinnerNode}
      </div>
    );
  }

  return spinnerNode;
}
