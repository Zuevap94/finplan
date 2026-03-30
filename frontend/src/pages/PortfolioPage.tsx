import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { financialApi } from '../services/api';
import type { FinancialSummary, FinancialProfile } from '../types';
import { formatRub, label } from '../utils/format';
import PieChartCard from '../components/charts/PieChartCard';
import '../components/charts/ChartSetup';
import { Loader2, PieChart } from 'lucide-react';

export default function PortfolioPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      financialApi.getSummary(user.id).catch(() => null),
      financialApi.getProfile(user.id).catch(() => null),
    ]).then(([summaryRes, profileRes]) => {
      setSummary(summaryRes?.data || null);
      setProfile(profileRes?.data || null);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (!summary || !profile) {
    return (
      <div className="text-center py-20">
        <PieChart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500">Портфель не найден</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Мой портфель</h1>
      <p className="text-slate-500 mb-8">Структура инвестиций и активов</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <p className="stat-label">Всего активов</p>
          <p className="stat-value text-blue-600">{formatRub(summary.total_assets)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Обязательства</p>
          <p className="stat-value text-red-600">{formatRub(summary.total_liabilities)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Чистый капитал</p>
          <p className="stat-value text-emerald-600">{formatRub(summary.net_worth)}</p>
        </div>
      </div>

      {Object.keys(summary.asset_allocation).length > 0 && (
        <div className="mb-8">
          <PieChartCard title="Распределение активов" data={summary.asset_allocation} height={350} />
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Детализация активов</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase py-3">Актив</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase py-3">Тип</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase py-3">Стоимость</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase py-3">Доходность</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase py-3">Доля</th>
              </tr>
            </thead>
            <tbody>
              {profile.assets.map(a => (
                <tr key={a.id} className="border-b border-slate-50">
                  <td className="py-3 text-sm font-medium text-slate-900">{a.name}</td>
                  <td className="py-3"><span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{label(a.type)}</span></td>
                  <td className="py-3 text-sm text-right text-slate-900 font-medium">{formatRub(a.current_value)}</td>
                  <td className="py-3 text-sm text-right text-slate-600">{a.annual_return_rate ? `${a.annual_return_rate}%` : '—'}</td>
                  <td className="py-3 text-sm text-right text-slate-600">
                    {summary.total_assets > 0 ? `${((a.current_value / summary.total_assets) * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
