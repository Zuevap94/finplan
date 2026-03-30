import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientsApi } from '../services/api';
import type { ClientListItem } from '../types';
import { formatDate } from '../utils/format';
import { Plus, Search, Users } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientsApi.list()
      .then(res => setClients(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Клиенты</h1>
          <p className="text-slate-500 mt-1">{clients.length} клиентов</p>
        </div>
        <Link to="/clients/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Добавить клиента
        </Link>
      </div>

      <div className="card">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по имени или email..."
            className="input-field pl-10"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{search ? 'Ничего не найдено' : 'Нет клиентов'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3">Клиент</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3">Телефон</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3">Дата создания</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3">Профиль</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3">Последний отчёт</th>
                  <th className="py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                          {c.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{c.full_name}</p>
                          <p className="text-xs text-slate-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-slate-600">{c.phone || '—'}</td>
                    <td className="py-3 text-sm text-slate-600">{formatDate(c.created_at)}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        c.has_profile ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {c.has_profile ? 'Заполнен' : 'Не создан'}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-600">
                      {c.last_report_date ? formatDate(c.last_report_date) : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <Link to={`/clients/${c.id}`} className="btn-secondary text-sm !py-1.5 !px-3">
                        Открыть
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
