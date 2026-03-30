import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import ConsultantDashboard from './pages/ConsultantDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ClientsPage from './pages/ClientsPage';
import CreateClientPage from './pages/CreateClientPage';
import ClientDetailPage from './pages/ClientDetailPage';
import FinancialFormPage from './pages/FinancialFormPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import PortfolioPage from './pages/PortfolioPage';
import GoalsPage from './pages/GoalsPage';
import TaxPage from './pages/TaxPage';
import FinancesPage from './pages/FinancesPage';

function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return user.role === 'consultant' ? <ConsultantDashboard /> : <ClientDashboard />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/new" element={<CreateClientPage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            <Route path="/clients/:id/financial" element={<FinancialFormPage />} />
            <Route path="/finances" element={<FinancesPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/tax" element={<TaxPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
