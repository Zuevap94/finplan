import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { financialApi } from '../services/api';
import type { FinancialSummary } from '../types';
import { formatRub } from '../utils/format';
import StatCard from '../components/common/StatCard';
import PieChartCard from '../components/charts/PieChartCard';
import BarChartCard from '../components/charts/BarChartCard';
import GoalProgressChart from '../components/charts/GoalProgressChart';
import '../components/charts/ChartSetup';
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank,
  Landmark, CreditCard, BarChart3, Loader2
} from 'lucide-react';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    financialApi.getSummary(user.id)
      .then(res => setSummary(res.data))
      .catch(() => setError('Финансовый профиль ещё не создан'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="text-center py-20">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Финансовый профиль не найден</h2>
        <p className="text-slate-500">Обратитесь к вашему консультанту для создания финансового плана</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Мой финансовый план</h1>
        <p className="text-slate-500 mt-1">Обзор вашей финансовой ситуации</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Чистый капитал"
          value={formatRub(summary.net_worth)}
          icon={Wallet}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Доход (чистый)"
          value={formatRub(summary.total_monthly_income_net)}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend={`${summary.savings_rate}% норма`}
          trendUp={summary.savings_rate > 20}
        />
        <StatCard
          label="Расходы"
          value={formatRub(summary.total_monthly_expenses)}
          icon={TrendingDown}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
        <StatCard
          label="Накопления / мес"
          value={formatRub(summary.monthly_savings)}
          icon={PiggyBank}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          trend={summary.monthly_savings > 0 ? '+' : ''}
          trendUp={summary.monthly_savings > 0}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Всего активов"
          value={formatRub(summary.total_assets)}
          icon={Landmark}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          label="Всего обязательств"
          value={formatRub(summary.total_liabilities)}
          icon={CreditCard}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          label="Налоги (год)"
          value={formatRub(summary.tax_summary.total_annual_tax)}
          icon={BarChart3}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {Object.keys(summary.asset_allocation).length > 0 && (
          <PieChartCard title="Структура портфеля" data={summary.asset_allocation} />
        )}
        {Object.keys(summary.income_breakdown).length > 0 && (
          <PieChartCard title="Структура доходов" data={summary.income_breakdown} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {Object.keys(summary.expense_breakdown).length > 0 && (
          <BarChartCard
            title="Расходы по категориям"
            data={summary.expense_breakdown}
            color="#EF4444"
            horizontal
          />
        )}
        {summary.goal_progress.length > 0 && (
          <GoalProgressChart goals={summary.goal_progress} />
        )}
      </div>
    </div>
  );
}
