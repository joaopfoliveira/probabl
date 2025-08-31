/**
 * Component to display risk level with appropriate styling
 */

import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Zap } from 'lucide-react';
import type { Risk } from '@/lib/types';

interface BadgeRiskProps {
  risk: Risk;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const riskConfig = {
  safe: {
    colorClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: Shield,
    label: 'Safe' as const,
  },
  medium: {
    colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    icon: AlertTriangle,
    label: 'Medium' as const,
  },
  high: {
    colorClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: Zap,
    label: 'High' as const,
  },
} as const;

export function BadgeRisk({ risk, showIcon = true, size = 'md' }: BadgeRiskProps) {
  const config = riskConfig[risk];
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
      variant="secondary" 
      className={`${config.colorClass} ${sizeClasses[size]} border-0 font-medium inline-flex items-center gap-1.5`}
    >
      {showIcon && (
        <IconComponent size={iconSizes[size]} className="flex-shrink-0" />
      )}
      <span>{config.label}</span>
    </Badge>
  );
}
