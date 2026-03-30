import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsApi } from '../services/api';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function CreateClientPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await clientsApi.create({ ...form, role: 'client' });
      navigate(`/clients/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при создании клиента');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/clients')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Назад к списку
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Новый клиент</h1>
      <p className="text-slate-500 mb-8">Создайте учётную запись для клиента</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label">ФИО *</label>
          <input
            value={form.full_name}
            onChange={e => setForm({ ...form, full_name: e.target.value })}
            className="input-field"
            placeholder="Иванов Иван Иванович"
            required
          />
        </div>
        <div>
          <label className="label">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="input-field"
            placeholder="client@example.ru"
            required
          />
        </div>
        <div>
          <label className="label">Телефон</label>
          <input
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className="input-field"
            placeholder="+7 (___) ___-__-__"
          />
        </div>
        <div>
          <label className="label">Пароль *</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="input-field"
            placeholder="Минимум 8 символов"
            required
            minLength={6}
          />
          <p className="text-xs text-slate-500 mt-1">Клиент сможет войти с этим паролем</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Создать клиента
          </button>
          <button type="button" onClick={() => navigate('/clients')} className="btn-secondary">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
