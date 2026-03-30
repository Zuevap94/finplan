import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { financialApi } from '../services/api';
import type { FinancialSummary } from '../types';
import { formatRub } from '../utils/format';
import { Loader2, Calculator, Receipt, Landmark, TrendingUp } from 'lucide-react';
import StatCard from '../components/common/StatCard';

export default function TaxPage() {
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

  if (!summary) {
    return (
      <div className="text-center py-20">
        <Calculator className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500">Данные не найдены</p>
      </div>
    );
  }

  const tax = summary.tax_summary;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Налоговый обзор</h1>
      <p className="text-slate-500 mb-8">Расчёт налогов по российскому законодательству</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="НДФЛ (год)" value={formatRub(tax.annual_ndfl)} icon={Receipt} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatCard label="НДФЛ (мес)" value={formatRub(tax.monthly_ndfl)} icon={Calculator} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard label="Налог на дивиденды" value={formatRub(tax.annual_dividend_tax)} icon={Landmark} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <StatCard label="Налог на инвестиции" value={formatRub(tax.potential_investment_tax)} icon={TrendingUp} iconColor="text-purple-600" iconBg="bg-purple-50" />
      </div>

      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">Итого налогов за год</h2>
        <div className="text-4xl font-bold text-red-600 mb-2">{formatRub(tax.total_annual_tax)}</div>
        <p className="text-slate-500 text-sm">Расчёт произведён на основании текущих данных профиля</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Справка по налогообложению</h2>
        <div className="space-y-4 text-sm text-slate-600">
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-1">НДФЛ (13% / 15%)</h3>
            <p>Стандартная ставка НДФЛ — 13%. Для доходов свыше 5 000 000 ₽ в год применяется повышенная ставка 15% на сумму превышения.</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-1">Налог на дивиденды (13%)</h3>
            <p>Дивиденды от российских компаний облагаются НДФЛ по ставке 13%. Налог удерживается брокером автоматически.</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-1">Льгота долгосрочного владения</h3>
            <p>При владении ценными бумагами более 3 лет предоставляется вычет до 3 000 000 ₽ за каждый год владения.</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-1">ИИС (Индивидуальный инвестиционный счёт)</h3>
            <p>Тип А: вычет до 400 000 ₽ от взноса (возврат до 52 000 ₽). Тип Б: освобождение прибыли от налога по истечении 3 лет.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
