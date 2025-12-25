// src/components/ui/StatCard.tsx
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Card from './Card'; // Use your existing Card component
import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: number; // e.g., 12 for +12%
    isPositive: boolean;
  };
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  iconBgColor = 'bg-indigo-100', // Default color from your design system
  iconColor = 'text-indigo-600',
  className = '',
}: StatCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)} padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconBgColor)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
        {trend && (
          <span className={cn(
            "text-sm font-medium",
            trend.isPositive ? 'text-success-600' : 'text-error-600' // Use semantic colors
          )}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </Card>
  );
}
