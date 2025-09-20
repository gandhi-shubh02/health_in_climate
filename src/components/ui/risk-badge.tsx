import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  risk: number;
  className?: string;
}

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 90) return { level: 'Critical', color: 'bg-risk-critical text-white' };
    if (score >= 75) return { level: 'High', color: 'bg-risk-high text-white' };
    if (score >= 50) return { level: 'Medium', color: 'bg-risk-medium text-foreground' };
    return { level: 'Low', color: 'bg-risk-low text-white' };
  };

  const { level, color } = getRiskLevel(risk);

  return (
    <Badge 
      className={cn(color, className)}
      variant="outline"
    >
      {level} ({risk.toFixed(1)})
    </Badge>
  );
}