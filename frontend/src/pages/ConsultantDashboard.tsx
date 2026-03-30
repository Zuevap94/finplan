import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientsApi } from '../services/api';
import type { ClientListItem } from '../types';
import { formatDate } from '../utils/format';
import StatCard from '../components/common/StatCard';
import { Users, UserCheck, FileText, Clock, Plus, ChevronRight } from 'lucide-react';

export default function ConsultantDashboard() {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientsApi.list()
      .then((res) => setClients(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const withProfile = clients.filter(c => c.has_profile).length;
  const withReports = clients.filter(c => c.last_report_date).length;
  const recentClients = [...clients].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-64" />
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Панель управления</h1>
          <p className="text-slate-500 mt-1">Обзор клиентов и активности</p>
        </div>
        <Link to="/clients/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Добавить клиента
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Всего клиентов"
          value={String(clients.length)}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          label="С фин. профилем"
          value={String(withProfile)}
          icon={UserCheck}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="С отчётами"
          value={String(withReports)}
          icon={FileText}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          label="Без профиля"
          value={String(clients.length - withProfile)}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Последние клиенты</h2>
          <Link to="/clients" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Все клиенты <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {recentClients.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Нет клиентов. Создайте первого!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3">Клиент</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3">Телефон</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3">Профиль</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3">Последний отчёт</th>
                  <th className="py-3"></th>
                </tr>
              </thead>
              <tbody>
                {recentClients.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                          {c.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{c.full_name}</p>
                          <p className="text-xs text-slate-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-slate-600">{c.phone || '—'}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        c.has_profile ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {c.has_profile ? 'Заполнен' : 'Не создан'}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-600">
                      {c.last_report_date ? formatDate(c.last_report_date) : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <Link to={`/clients/${c.id}`} className="text-sm text-blue-600 hover:text-blue-700">
                        Подробнее →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
