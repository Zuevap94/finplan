import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { financialApi } from '../services/api';
import type { FinancialSummary, FinancialProfile } from '../types';
import { formatRub, label } from '../utils/format';
import PieChartCard from '../components/charts/PieChartCard';
import BarChartCard from '../components/charts/BarChartCard';
import '../components/charts/ChartSetup';
import StatCard from '../components/common/StatCard';
import { Loader2, TrendingUp, TrendingDown, PiggyBank, Edit } from 'lucide-react';

export default function FinancesPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      financialApi.getSummary(user.id).catch(() => null),
      financialApi.getProfile(user.id).catch(() => null),
    ]).then(([s, p]) => {
      setSummary(s?.data || null);
      setProfile(p?.data || null);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (!summary) {
    return (
      <div className="text-center py-20">
        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500">Финансовые данные не найдены</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Мои финансы</h1>
          <p className="text-slate-500 mt-1">Доходы, расходы и баланс</p>
        </div>
        <Link to={`/clients/${user?.id}/financial`} className="btn-secondary flex items-center gap-2">
          <Edit className="w-4 h-4" />
          Редактировать
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Чистый доход / мес" value={formatRub(summary.total_monthly_income_net)} icon={TrendingUp} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard label="Расходы / мес" value={formatRub(summary.total_monthly_expenses)} icon={TrendingDown} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatCard label="Накопления / мес" value={formatRub(summary.monthly_savings)} icon={PiggyBank} iconColor="text-blue-600" iconBg="bg-blue-50" trend={`${summary.savings_rate}%`} trendUp={summary.savings_rate > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {Object.keys(summary.income_breakdown).length > 0 && (
          <PieChartCard title="Структура доходов" data={summary.income_breakdown} />
        )}
        {Object.keys(summary.expense_breakdown).length > 0 && (
          <BarChartCard title="Расходы по категориям" data={summary.expense_breakdown} color="#EF4444" horizontal />
        )}
      </div>

      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Доходы</h2>
            <div className="space-y-2">
              {profile.incomes.map(inc => (
                <div key={inc.id} className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div>
                    <p className="text-sm font-medium">{inc.name}</p>
                    <p className="text-xs text-slate-500">{label(inc.type)}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatRub(inc.amount_monthly)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Расходы</h2>
            <div className="space-y-2">
              {profile.expenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div>
                    <p className="text-sm font-medium">{exp.name}</p>
                    <p className="text-xs text-slate-500">{label(exp.category)}</p>
                  </div>
                  <p className="text-sm font-semibold text-red-600">{formatRub(exp.amount_monthly)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
