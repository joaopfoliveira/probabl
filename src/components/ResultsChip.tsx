/**
 * Component to display tip results with appropriate styling
 */

import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, MinusCircle, Clock } from 'lucide-react';
import type { Result } from '@/lib/types';

interface ResultsChipProps {
  result?: Result;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const resultConfig = {
  win: {
    colorClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800',
    icon: CheckCircle,
    label: 'Win' as const,
  },
  loss: {
    colorClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800',
    icon: XCircle,
    label: 'Loss' as const,
  },
  void: {
    colorClass: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-800',
    icon: MinusCircle,
    label: 'Void' as const,
  },
  pending: {
    colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    icon: Clock,
    label: 'Pending' as const,
  },
} as const;

export function ResultsChip({ result = 'pending', showIcon = true, size = 'md' }: ResultsChipProps) {
  const config = resultConfig[result];
  const IconComponent = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  
  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.colorClass} ${sizeClasses[size]} font-medium inline-flex items-center gap-1.5`}
    >
      {showIcon && (
        <IconComponent size={iconSizes[size]} className="flex-shrink-0" />
      )}
      <span>{config.label}</span>
    </Badge>
  );
}
