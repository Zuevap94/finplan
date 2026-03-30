import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type: 'consultant' | 'client') => {
    if (type === 'consultant') {
      setEmail('consultant@finplan.ru');
    } else {
      setEmail('client1@example.ru');
    }
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white flex-col justify-center px-16">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-10 h-10" />
          <h1 className="text-3xl font-bold tracking-tight">
            ФинПлан Pro
          </h1>
        </div>
        <h2 className="text-4xl font-bold leading-tight mb-6">
          Платформа личного<br />финансового<br />планирования
        </h2>
        <p className="text-blue-200 text-lg leading-relaxed max-w-md">
          Профессиональный инструмент для финансовых консультантов.
          Управляйте портфелями клиентов, создавайте отчёты и визуализируйте
          финансовые данные в одном месте.
        </p>
        <div className="mt-10 grid grid-cols-3 gap-6">
          {[
            { num: '13%', desc: 'Расчёт НДФЛ' },
            { num: 'PDF', desc: 'Экспорт отчётов' },
            { num: 'RUB', desc: 'Рос. инструменты' },
          ].map((item) => (
            <div key={item.desc} className="text-center">
              <div className="text-2xl font-bold text-blue-300">{item.num}</div>
              <div className="text-sm text-blue-300/70">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">ФинПлан Pro</h1>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Вход в систему</h2>
          <p className="text-slate-500 mb-8">Введите ваши учётные данные</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="your@email.ru"
                required
              />
            </div>
            <div>
              <label className="label">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Войти
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center mb-3">Демо-доступ:</p>
            <div className="flex gap-3">
              <button onClick={() => fillDemo('consultant')} className="btn-secondary flex-1 text-sm">
                Консультант
              </button>
              <button onClick={() => fillDemo('client')} className="btn-secondary flex-1 text-sm">
                Клиент
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
