import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { financialApi } from '../services/api';
import type { FinancialSummary } from '../types';
import { formatRub, label } from '../utils/format';
import GoalProgressChart from '../components/charts/GoalProgressChart';
import { Loader2, Target } from 'lucide-react';

export default function GoalsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    financialApi.getSummary(user.id)
      .then(res => setSummary(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (!summary || summary.goal_progress.length === 0) {
    return (
      <div className="text-center py-20">
        <Target className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500">Цели не заданы</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Финансовые цели</h1>
      <p className="text-slate-500 mb-8">Отслеживание прогресса</p>

      <div className="mb-8">
        <GoalProgressChart goals={summary.goal_progress} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summary.goal_progress.map(g => (
          <div key={g.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">{g.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                g.priority === 'high' ? 'bg-red-100 text-red-700' :
                g.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>{label(g.priority)}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{g.progress_pct.toFixed(0)}%</div>
            <p className="text-sm text-slate-500 mb-3">
              {formatRub(g.current_amount)} из {formatRub(g.target_amount)}
            </p>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
              <div className={`h-full rounded-full ${g.on_track ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.min(g.progress_pct, 100)}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-slate-500">Осталось мес.</p>
                <p className="font-semibold text-slate-900">{g.months_remaining}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-slate-500">Нужно / мес</p>
                <p className="font-semibold text-slate-900">{formatRub(g.required_monthly)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-slate-500">Вносите / мес</p>
                <p className="font-semibold text-slate-900">{formatRub(g.monthly_contribution)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-slate-500">Статус</p>
                <p className={`font-semibold ${g.on_track ? 'text-emerald-600' : 'text-red-600'}`}>
                  {g.on_track ? 'В графике' : 'Отстаёте'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
