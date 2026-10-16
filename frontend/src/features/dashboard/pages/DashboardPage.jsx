// src/features/dashboard/pages/DashboardPage.jsx
// ✅ Mobile-first responsive

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Download, Calendar, RefreshCw, Sparkles, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import KPIGrid from '../components/KPIGrid';
import AlertStrip from '../components/AlertStrip';
import SalesChart from '../components/SalesChart';
import CategoryChart from '../components/CategoryChart';
import RecentTransactions from '../components/RecentTransactions';
import TopSellingMedicines from '../components/TopSellingMedicines';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { useGetDashboardQuery } from '../dashboardApi';
import { formatDate } from '@/lib/utils';
import { exportDashboardPDF } from '../dashboardPdf';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const branchName = user?.branch?.name || 'Dhanmondi Main';

  const [isExporting, setIsExporting] = useState(false);

  const {
    data: res,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useGetDashboardQuery();

  const dashboardData = res?.data;

  const handleExportDashboard = () => {
    setIsExporting(true);
    try {
      if (!dashboardData) {
        toast.error('Dashboard data not loaded');
        return;
      }

      exportDashboardPDF({
        data: dashboardData,
        company: {
          name: 'PharmaFlow Pharmacy',
          address: 'Dhanmondi, Dhaka, Bangladesh',
          phone: '+8801700000000',
          email: 'info@pharmaflow.com'
        },
        filename: 'dashboard-summary'
      });

      toast.success('Dashboard PDF downloaded');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export dashboard');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title={`${getGreeting()}, ${user?.name?.split(' ')[0] || 'User'} 👋`}
        subtitle={`Here's what's happening across ${branchName} today.`}
        actions={
          <>
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(new Date())}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh"
              className="h-9 w-9 p-0 sm:w-auto sm:px-3"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
              />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportDashboard}
              disabled={isExporting || isLoading || !dashboardData}
              className="h-9"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={() => navigate('/pos')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground h-9"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Sale</span>
            </Button>
          </>
        }
      />

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 lg:p-8 text-center">
          <p className="text-sm text-destructive font-medium">
            Failed to load dashboard data.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Please try again later.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-4 lg:space-y-6">
          {/* KPI Cards */}
          <section>
            <SectionTitle
              icon={Sparkles}
              title="Today's Overview"
              subtitle="Key metrics"
            />
            <KPIGrid data={dashboardData} />
          </section>

          {/* Alerts */}
          <section>
            <AlertStrip data={dashboardData} />
          </section>

          {/* Charts */}
          <section>
            <SectionTitle
              title="Performance"
              subtitle="Sales & category trends"
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
              <div className="lg:col-span-2">
                <SalesChart data={dashboardData} />
              </div>
              <div>
                <CategoryChart data={dashboardData} />
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <SectionTitle
              title="Recent Activity"
              subtitle="Latest transactions"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              <RecentTransactions data={dashboardData} />
              <TopSellingMedicines data={dashboardData} />
            </div>
          </section>
        </div>
      )}
    </>
  );
}

// ===== Section Title =====
function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-2 mb-2 lg:mb-3">
      {Icon && <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-accent" />}
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {subtitle && (
        <span className="text-[10px] lg:text-xs text-muted-foreground">
          — {subtitle}
        </span>
      )}
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}