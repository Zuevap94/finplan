import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, FileText, Bell, LogOut,
  TrendingUp, PieChart, Target, Calculator
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const isConsultant = user?.role === 'consultant';

  const consultantLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Панель управления' },
    { to: '/clients', icon: Users, label: 'Клиенты' },
    { to: '/reports', icon: FileText, label: 'Отчёты' },
    { to: '/notifications', icon: Bell, label: 'Уведомления' },
  ];

  const clientLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Мой план' },
    { to: '/finances', icon: TrendingUp, label: 'Финансы' },
    { to: '/portfolio', icon: PieChart, label: 'Портфель' },
    { to: '/goals', icon: Target, label: 'Цели' },
    { to: '/tax', icon: Calculator, label: 'Налоги' },
    { to: '/reports', icon: FileText, label: 'Отчёты' },
    { to: '/notifications', icon: Bell, label: 'Уведомления' },
  ];

  const links = isConsultant ? consultantLinks : clientLinks;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white flex flex-col z-30">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-blue-400">Фин</span>План Pro
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {isConsultant ? 'Кабинет консультанта' : 'Личный кабинет'}
        </p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
            {user?.full_name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-2 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </div>
    </aside>
  );
}
