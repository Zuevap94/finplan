import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clientsApi, financialApi, reportsApi } from '../services/api';
import type { User, FinancialSummary, Report, ReportType } from '../types';
import { formatRub, formatDateTime, label } from '../utils/format';
import StatCard from '../components/common/StatCard';
import PieChartCard from '../components/charts/PieChartCard';
import BarChartCard from '../components/charts/BarChartCard';
import GoalProgressChart from '../components/charts/GoalProgressChart';
import '../components/charts/ChartSetup';
import {
  ArrowLeft, Wallet, TrendingUp, TrendingDown, PiggyBank,
  FileText, Download, Loader2, Plus, RefreshCw
} from 'lucide-react';

const REPORT_TYPES: { type: ReportType; label: string; color: string }[] = [
  { type: 'full_plan', label: 'Полный план', color: 'bg-blue-600 hover:bg-blue-700' },
  { type: 'net_worth', label: 'Чистый капитал', color: 'bg-indigo-600 hover:bg-indigo-700' },
  { type: 'portfolio', label: 'Портфель', color: 'bg-emerald-600 hover:bg-emerald-700' },
  { type: 'income_expense', label: 'Доходы/Расходы', color: 'bg-amber-600 hover:bg-amber-700' },
  { type: 'goal_progress', label: 'Цели', color: 'bg-purple-600 hover:bg-purple-700' },
  { type: 'tax_summary', label: 'Налоги', color: 'bg-red-600 hover:bg-red-700' },
];

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  useAuth();
  const clientId = Number(id);

  const [client, setClient] = useState<User | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      clientsApi.get(clientId),
      financialApi.getSummary(clientId).catch(() => null),
      reportsApi.list(clientId).catch(() => ({ data: [] as Report[] })),
    ]).then(([clientRes, summaryRes, reportsRes]) => {
      setClient(clientRes.data);
      setSummary(summaryRes?.data || null);
      setReports(reportsRes.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [clientId]);

  const handleGenerateReport = async (type: ReportType) => {
    setGeneratingReport(type);
    try {
      await reportsApi.generate(clientId, type);
      const res = await reportsApi.list(clientId);
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadPdf = async (reportId: number, title: string) => {
    try {
      const res = await reportsApi.downloadPdf(reportId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link to="/clients" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{client?.full_name}</h1>
          <p className="text-slate-500">{client?.email} · {client?.phone || 'Нет телефона'}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Обновить
          </button>
          <Link to={`/clients/${clientId}/financial`} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {summary ? 'Обновить профиль' : 'Создать профиль'}
          </Link>
        </div>
      </div>

      {summary ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard label="Чистый капитал" value={formatRub(summary.net_worth)} icon={Wallet} iconColor="text-blue-600" iconBg="bg-blue-50" />
            <StatCard label="Доход (чистый)" value={formatRub(summary.total_monthly_income_net)} icon={TrendingUp} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
            <StatCard label="Расходы" value={formatRub(summary.total_monthly_expenses)} icon={TrendingDown} iconColor="text-red-600" iconBg="bg-red-50" />
            <StatCard label="Накопления / мес" value={formatRub(summary.monthly_savings)} icon={PiggyBank} iconColor="text-purple-600" iconBg="bg-purple-50" />
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
              <BarChartCard title="Расходы по категориям" data={summary.expense_breakdown} color="#EF4444" horizontal />
            )}
            {summary.goal_progress.length > 0 && (
              <GoalProgressChart goals={summary.goal_progress} />
            )}
          </div>
        </>
      ) : (
        <div className="card text-center py-12 mb-8">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">Финансовый профиль не создан</p>
          <Link to={`/clients/${clientId}/financial`} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Создать профиль
          </Link>
        </div>
      )}

      {summary && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">Генерация отчётов</h2>
          <div className="flex flex-wrap gap-3">
            {REPORT_TYPES.map(rt => (
              <button
                key={rt.type}
                onClick={() => handleGenerateReport(rt.type)}
                disabled={!!generatingReport}
                className={`${rt.color} text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50`}
              >
                {generatingReport === rt.type ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                {rt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {reports.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">История отчётов</h2>
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{r.title}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(r.created_at)} · {label(r.type)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadPdf(r.id, r.title)}
                  className="btn-secondary !py-1.5 !px-3 text-sm flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
