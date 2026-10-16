// src/routes/AppRoutes.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '@/components/layout/Layout';
import LoginPage from '@/features/auth/pages/LoginPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import MedicineListPage from '@/features/medicines/pages/MedicineListPage';
import InventoryPage from '@/features/inventory/pages/InventoryPage';
import PurchaseListPage from '@/features/purchases/pages/PurchaseListPage';
import POSPage from '@/features/pos/pages/POSPage';
import SalesListPage from '@/features/sales/pages/SalesListPage';
import CustomerListPage from '@/features/customers/pages/CustomerListPage';
import SupplierListPage from '@/features/suppliers/pages/SupplierListPage';
import ReturnsPage from '@/features/returns/pages/ReturnsPage';
import FinancePage from '@/features/finance/pages/FinancePage';
import ReportsPage from '@/features/reports/pages/ReportsPage';
import NotificationsPage from '@/features/notifications/pages/NotificationsPage';
import UserListPage from '@/features/users/pages/UserListPage';
import AuditLogListPage from '@/features/audit-logs/pages/AuditLogListPage';
import SettingsPage from '@/features/settings/pages/SettingsPage';
import ProfilePage from '@/features/profile/pages/ProfilePage';
import SearchPage from '@/features/search/pages/SearchPage'; // ✅ NEW
import EmptyState from '@/components/common/EmptyState';

// eslint-disable-next-line no-unused-vars
const Placeholder = ({ title }) => (
  <EmptyState title={title} description="This page is under construction." />
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/medicines" element={<MedicineListPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/purchases" element={<PurchaseListPage />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/sales" element={<SalesListPage />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/suppliers" element={<SupplierListPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/users" element={<UserListPage />} />
        <Route path="/audit-logs" element={<AuditLogListPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* ✅ NEW: Search route */}
        <Route path="/search" element={<SearchPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}