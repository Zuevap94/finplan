import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { financialApi } from '../services/api';
import type {
  Income, Expense, Asset, Liability, FinancialGoal,
  IncomeType, ExpenseCategory, AssetType, LiabilityType, GoalPriority,
  FinancialProfileCreate
} from '../types';
import { label } from '../utils/format';
import { ArrowLeft, Plus, Trash2, Loader2, Save } from 'lucide-react';

const INCOME_TYPES: IncomeType[] = ['salary', 'business', 'rental', 'dividends', 'interest', 'pension', 'other'];
const EXPENSE_CATS: ExpenseCategory[] = ['housing', 'food', 'transport', 'healthcare', 'education', 'entertainment', 'clothing', 'insurance', 'debt_payments', 'savings', 'other'];
const ASSET_TYPES: AssetType[] = ['deposit', 'stocks_ru', 'bonds_ru', 'mutual_funds', 'stocks_foreign', 'bonds_foreign', 'real_estate', 'cash', 'iis', 'pension_fund', 'crypto', 'business_asset', 'other'];
const LIABILITY_TYPES: LiabilityType[] = ['mortgage', 'car_loan', 'consumer_loan', 'credit_card', 'business_loan', 'other'];
const GOAL_PRIORITIES: GoalPriority[] = ['high', 'medium', 'low'];

type Tab = 'income' | 'expenses' | 'assets' | 'liabilities' | 'goals';

export default function FinancialFormPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = id ? Number(id) : user?.id;

  const [activeTab, setActiveTab] = useState<Tab>('income');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');

  const [incomes, setIncomes] = useState<Omit<Income, 'id' | 'profile_id'>[]>([]);
  const [expenses, setExpenses] = useState<Omit<Expense, 'id' | 'profile_id'>[]>([]);
  const [assets, setAssets] = useState<Omit<Asset, 'id' | 'profile_id'>[]>([]);
  const [liabilities, setLiabilities] = useState<Omit<Liability, 'id' | 'profile_id'>[]>([]);
  const [goals, setGoals] = useState<Omit<FinancialGoal, 'id' | 'profile_id'>[]>([]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    financialApi.getProfile(userId)
      .then(res => {
        const p = res.data;
        setNotes(p.notes || '');
        setIncomes(p.incomes.map(({ id: _, profile_id: __, ...rest }) => rest));
        setExpenses(p.expenses.map(({ id: _, profile_id: __, ...rest }) => rest));
        setAssets(p.assets.map(({ id: _, profile_id: __, ...rest }) => rest));
        setLiabilities(p.liabilities.map(({ id: _, profile_id: __, ...rest }) => rest));
        setGoals(p.goals.map(({ id: _, profile_id: __, ...rest }) => rest));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const addIncome = () => setIncomes([...incomes, { type: 'salary', name: '', amount_monthly: 0, is_gross: true, is_regular: true }]);
  const addExpense = () => setExpenses([...expenses, { category: 'housing', name: '', amount_monthly: 0, is_fixed: true }]);
  const addAsset = () => setAssets([...assets, { type: 'deposit', name: '', current_value: 0, currency: 'RUB' }]);
  const addLiability = () => setLiabilities([...liabilities, { type: 'mortgage', name: '', total_amount: 0, remaining_amount: 0, interest_rate: 0, monthly_payment: 0 }]);
  const addGoal = () => setGoals([...goals, { name: '', target_amount: 0, current_amount: 0, target_date: '', priority: 'medium' }]);

  const handleSave = async () => {
    if (!userId) return;
    setError('');
    setSaving(true);
    try {
      const data: FinancialProfileCreate = { notes, incomes, expenses, assets, liabilities, goals };
      await financialApi.createProfile(userId, data);
      if (id) {
        navigate(`/clients/${id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'income', label: 'Доходы', count: incomes.length },
    { key: 'expenses', label: 'Расходы', count: expenses.length },
    { key: 'assets', label: 'Активы', count: assets.length },
    { key: 'liabilities', label: 'Обязательства', count: liabilities.length },
    { key: 'goals', label: 'Цели', count: goals.length },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Финансовый профиль</h1>
          <p className="text-slate-500">Заполните финансовые данные</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-success flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Сохранить
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="card mb-6">
        <label className="label">Заметки</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="input-field" placeholder="Комментарии к профилю..." />
      </div>

      <div className="flex gap-1 mb-6 bg-slate-100 rounded-lg p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === t.key ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label} {t.count > 0 && <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeTab === 'income' && (
          <>
            {incomes.map((inc, i) => (
              <div key={i} className="card">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="label">Тип</label>
                      <select value={inc.type} onChange={e => { const arr = [...incomes]; arr[i] = { ...arr[i], type: e.target.value as IncomeType }; setIncomes(arr); }} className="select-field">
                        {INCOME_TYPES.map(t => <option key={t} value={t}>{label(t)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Название</label>
                      <input value={inc.name} onChange={e => { const arr = [...incomes]; arr[i] = { ...arr[i], name: e.target.value }; setIncomes(arr); }} className="input-field" placeholder="Зарплата" />
                    </div>
                    <div>
                      <label className="label">Сумма / мес (₽)</label>
                      <input type="number" value={inc.amount_monthly || ''} onChange={e => { const arr = [...incomes]; arr[i] = { ...arr[i], amount_monthly: Number(e.target.value) }; setIncomes(arr); }} className="input-field" />
                    </div>
                    <div className="flex items-end gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={inc.is_gross} onChange={e => { const arr = [...incomes]; arr[i] = { ...arr[i], is_gross: e.target.checked }; setIncomes(arr); }} className="rounded" />
                        До налогов
                      </label>
                    </div>
                  </div>
                  <button onClick={() => setIncomes(incomes.filter((_, j) => j !== i))} className="mt-7 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addIncome} className="btn-secondary flex items-center gap-2 w-full justify-center">
              <Plus className="w-4 h-4" /> Добавить доход
            </button>
          </>
        )}

        {activeTab === 'expenses' && (
          <>
            {expenses.map((exp, i) => (
              <div key={i} className="card">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Категория</label>
                      <select value={exp.category} onChange={e => { const arr = [...expenses]; arr[i] = { ...arr[i], category: e.target.value as ExpenseCategory }; setExpenses(arr); }} className="select-field">
                        {EXPENSE_CATS.map(c => <option key={c} value={c}>{label(c)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Название</label>
                      <input value={exp.name} onChange={e => { const arr = [...expenses]; arr[i] = { ...arr[i], name: e.target.value }; setExpenses(arr); }} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Сумма / мес (₽)</label>
                      <input type="number" value={exp.amount_monthly || ''} onChange={e => { const arr = [...expenses]; arr[i] = { ...arr[i], amount_monthly: Number(e.target.value) }; setExpenses(arr); }} className="input-field" />
                    </div>
                  </div>
                  <button onClick={() => setExpenses(expenses.filter((_, j) => j !== i))} className="mt-7 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addExpense} className="btn-secondary flex items-center gap-2 w-full justify-center">
              <Plus className="w-4 h-4" /> Добавить расход
            </button>
          </>
        )}

        {activeTab === 'assets' && (
          <>
            {assets.map((asset, i) => (
              <div key={i} className="card">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="label">Тип актива</label>
                      <select value={asset.type} onChange={e => { const arr = [...assets]; arr[i] = { ...arr[i], type: e.target.value as AssetType }; setAssets(arr); }} className="select-field">
                        {ASSET_TYPES.map(t => <option key={t} value={t}>{label(t)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Название</label>
                      <input value={asset.name} onChange={e => { const arr = [...assets]; arr[i] = { ...arr[i], name: e.target.value }; setAssets(arr); }} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Текущая стоимость (₽)</label>
                      <input type="number" value={asset.current_value || ''} onChange={e => { const arr = [...assets]; arr[i] = { ...arr[i], current_value: Number(e.target.value) }; setAssets(arr); }} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Цена покупки (₽)</label>
                      <input type="number" value={asset.purchase_value || ''} onChange={e => { const arr = [...assets]; arr[i] = { ...arr[i], purchase_value: Number(e.target.value) || undefined }; setAssets(arr); }} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Дата покупки</label>
                      <input type="date" value={asset.purchase_date || ''} onChange={e => { const arr = [...assets]; arr[i] = { ...arr[i], purchase_date: e.target.value || undefined }; setAssets(arr); }} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Годовая доходность (%)</label>
                      <input type="number" step="0.1" value={asset.annual_return_rate || ''} onChange={e => { const arr = [...assets]; arr[i] = { ...arr[i], annual_return_rate: Number(e.target.value) || undefined }; setAssets(arr); }} className="input-field" />
                    </div>
                  </div>
                  <button onClick={() => setAssets(assets.filter((_, j) => j !== i))} className="mt-7 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addAsset} className="btn-secondary flex items-center gap-2 w-full justify-center">
              <Plus className="w-4 h-4" /> Добавить актив
            </button>
          </>
        )}

        {activeTab === 'liabilities' && (
          <>
            {liabilities.map((liab, i) => (
              <div key={i} className="card">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Тип</label>
                      <select value={liab.type} onChange={e => { const arr = [...liabilities]; arr[i] = { ...arr[i], type: e.target.value as LiabilityType }; setLiabilities(arr); }} className="select-field">
                        {LIABILITY_TYPES.map(t => <option key={t} value={t}>{label(t)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Название</label>
                      <input value={liab.name} onChange={e => { const arr = [...liabilities]; arr[i] = { ...arr[i], name: e.target.value }; setLiabilities(arr); }} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Полная сумма (₽)</label>
                      <input type="number" value={liab.total_amount || ''} onChange={e => { const arr = [...liabilities]; arr[i] = { ...arr[i], total_amount: Number(e.target.value) }; setLiabilities(arr); }} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Остаток (₽)</label>
                      <input type="number" value={liab.remaining_amount || ''} onChange={e => { const arr = [...liabilities]; arr[i] = { ...arr[i], remaining_amount: Number(e.target.value) }; setLiabilities(arr); }} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Ставка (%)</label>
                      <input type="number" step="0.1" value={liab.interest_rate || ''} onChange={e => { const arr = [...liabilities]; arr[i] = { ...arr[i], interest_rate: Number(e.target.value) }; setLiabilities(arr); }} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Платёж / мес (₽)</label>
                      <input type="number" value={liab.monthly_payment || ''} onChange={e => { const arr = [...liabilities]; arr[i] = { ...arr[i], monthly_payment: Number(e.target.value) }; setLiabilities(arr); }} className="input-field" />
                    </div>
                  </div>
                  <button onClick={() => setLiabilities(liabilities.filter((_, j) => j !== i))} className="mt-7 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addLiability} className="btn-secondary flex items-center gap-2 w-full justify-center">
              <Plus className="w-4 h-4" /> Добавить обязательство
            </button>
          </>
        )}

        {activeTab === 'goals' && (
          <>
            {goals.map((goal, i) => (
              <div key={i} className="card">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Название цели</label>
                      <input value={goal.name} onChange={e => { const arr = [...goals]; arr[i] = { ...arr[i], name: e.target.value }; setGoals(arr); }} className="input-field" placeholder="Финансовая подушка" />
                    </div>
                    <div>
                      <label className="label">Целевая сумма (₽)</label>
                      <input type="number" value={goal.target_amount || ''} onChange={e => { const arr = [...goals]; arr[i] = { ...arr[i], target_amount: Number(e.target.value) }; setGoals(arr); }} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Текущая сумма (₽)</label>
                      <input type="number" value={goal.current_amount || ''} onChange={e => { const arr = [...goals]; arr[i] = { ...arr[i], current_amount: Number(e.target.value) }; setGoals(arr); }} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Дата достижения</label>
                      <input type="date" value={goal.target_date} onChange={e => { const arr = [...goals]; arr[i] = { ...arr[i], target_date: e.target.value }; setGoals(arr); }} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Приоритет</label>
                      <select value={goal.priority} onChange={e => { const arr = [...goals]; arr[i] = { ...arr[i], priority: e.target.value as GoalPriority }; setGoals(arr); }} className="select-field">
                        {GOAL_PRIORITIES.map(p => <option key={p} value={p}>{label(p)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Взнос / мес (₽)</label>
                      <input type="number" value={goal.monthly_contribution || ''} onChange={e => { const arr = [...goals]; arr[i] = { ...arr[i], monthly_contribution: Number(e.target.value) || undefined }; setGoals(arr); }} className="input-field" />
                    </div>
                  </div>
                  <button onClick={() => setGoals(goals.filter((_, j) => j !== i))} className="mt-7 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addGoal} className="btn-secondary flex items-center gap-2 w-full justify-center">
              <Plus className="w-4 h-4" /> Добавить цель
            </button>
          </>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-success flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Сохранить профиль
        </button>
        <button onClick={() => navigate(-1)} className="btn-secondary">Отмена</button>
      </div>
    </div>
  );
}
