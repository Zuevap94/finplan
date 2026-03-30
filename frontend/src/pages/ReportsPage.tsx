import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsApi, clientsApi } from '../services/api';
import type { Report, ClientListItem, ReportType } from '../types';
import { formatDateTime, label } from '../utils/format';
import { FileText, Download, Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const { user } = useAuth();
  const isConsultant = user?.role === 'consultant';
  const [reports, setReports] = useState<Report[]>([]);
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [selectedType, setSelectedType] = useState<ReportType>('full_plan');

  useEffect(() => {
    if (isConsultant) {
      clientsApi.list().then(res => {
        setClients(res.data);
        if (res.data.length > 0) {
          setSelectedClient(res.data[0].id);
        }
      }).finally(() => setLoading(false));
    } else if (user) {
      reportsApi.list(user.id)
        .then(res => setReports(res.data))
        .finally(() => setLoading(false));
    }
  }, [user]);

  useEffect(() => {
    if (selectedClient) {
      reportsApi.list(selectedClient)
        .then(res => setReports(res.data))
        .catch(() => setReports([]));
    }
  }, [selectedClient]);

  const handleGenerate = async () => {
    const userId = isConsultant ? selectedClient : user?.id;
    if (!userId) return;
    setGeneratingReport(true);
    try {
      await reportsApi.generate(userId, selectedType);
      const res = await reportsApi.list(userId);
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownload = async (reportId: number, title: string) => {
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
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Отчёты</h1>
      <p className="text-slate-500 mb-8">Генерация и управление отчётами</p>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Создать отчёт</h2>
        <div className="flex flex-wrap gap-4 items-end">
          {isConsultant && (
            <div>
              <label className="label">Клиент</label>
              <select
                value={selectedClient || ''}
                onChange={e => setSelectedClient(Number(e.target.value))}
                className="select-field"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">Тип отчёта</label>
            <select value={selectedType} onChange={e => setSelectedType(e.target.value as ReportType)} className="select-field">
              <option value="full_plan">Полный план</option>
              <option value="net_worth">Чистый капитал</option>
              <option value="portfolio">Структура портфеля</option>
              <option value="income_expense">Доходы и расходы</option>
              <option value="goal_progress">Прогресс целей</option>
              <option value="tax_summary">Налоговый обзор</option>
            </select>
          </div>
          <button onClick={handleGenerate} disabled={generatingReport} className="btn-primary flex items-center gap-2">
            {generatingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Сгенерировать
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">История отчётов</h2>
        {reports.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Нет отчётов</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.id} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{r.title}</p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(r.created_at)} · {label(r.type)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(r.id, r.title)}
                  className="btn-secondary !py-1.5 !px-3 text-sm flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
