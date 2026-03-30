import type { GoalProgress } from '../../types';
import { formatRub, label } from '../../utils/format';

interface Props {
  goals: GoalProgress[];
}

export default function GoalProgressChart({ goals }: Props) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Прогресс достижения целей</h3>
      <div className="space-y-5">
        {goals.map((g) => (
          <div key={g.id}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">{g.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  g.priority === 'high' ? 'bg-red-100 text-red-700' :
                  g.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {label(g.priority)}
                </span>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                g.on_track ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {g.on_track ? 'В графике' : 'Отставание'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  g.on_track ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(g.progress_pct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-slate-500">
              <span>{formatRub(g.current_amount)} из {formatRub(g.target_amount)}</span>
              <span>{g.progress_pct.toFixed(1)}% · {g.months_remaining} мес.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
