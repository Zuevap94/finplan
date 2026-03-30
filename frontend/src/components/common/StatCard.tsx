import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: string;
  trendUp?: boolean;
}

export default function StatCard({
  label, value, icon: Icon, iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50', trend, trendUp,
}: Props) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}
