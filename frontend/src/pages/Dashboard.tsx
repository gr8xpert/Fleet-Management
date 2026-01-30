import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import {
  Bus,
  Users,
  AlertTriangle,
  Wrench,
  DollarSign,
  FileWarning,
  Calendar,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  href?: string;
}

function StatCard({ title, value, subtitle, icon: Icon, color, href }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const Card = href ? Link : 'div';

  return (
    <Card
      to={href || '#'}
      className={clsx(
        'card p-6 flex items-start gap-4',
        href && 'hover:shadow-md transition-shadow'
      )}
    >
      <div className={clsx('p-3 rounded-lg', colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {href && <ChevronRight className="w-5 h-5 text-gray-400" />}
    </Card>
  );
}

interface ExpiryItemProps {
  type: string;
  reference: string;
  expiryDate: string;
  daysLeft: number;
}

function ExpiryItem({ type, reference, expiryDate, daysLeft }: ExpiryItemProps) {
  const urgency = daysLeft <= 7 ? 'urgent' : daysLeft <= 15 ? 'warning' : 'normal';

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium text-gray-900">{reference}</p>
        <p className="text-sm text-gray-500">{type}</p>
      </div>
      <div className="text-right">
        <p className={clsx(
          'text-sm font-medium',
          urgency === 'urgent' ? 'text-red-600' : urgency === 'warning' ? 'text-yellow-600' : 'text-gray-600'
        )}>
          {daysLeft <= 0 ? 'Expired' : `${daysLeft} days left`}
        </p>
        <p className="text-xs text-gray-500">{format(new Date(expiryDate), 'MMM d, yyyy')}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getOverview(),
  });

  const { data: expiries } = useQuery({
    queryKey: ['dashboard-expiries'],
    queryFn: () => dashboardApi.getUpcomingExpiries(30),
  });

  const { data: financials } = useQuery({
    queryKey: ['dashboard-financials'],
    queryFn: () => dashboardApi.getFinancialSummary(),
  });

  const dashboardData = overview?.data;
  const expiryData = expiries?.data;
  const financialData = financials?.data;

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const allExpiries = [
    ...(expiryData?.mulkiya || []).map((e: { type?: string; reference: string; expiry_date: string; days_left: number }) => ({ ...e, type: 'Mulkiya' })),
    ...(expiryData?.insurance || []).map((e: { type?: string; reference: string; expiry_date: string; days_left: number }) => ({ ...e, type: 'Insurance' })),
    ...(expiryData?.visa || []).map((e: { type?: string; reference: string; expiry_date: string; days_left: number }) => ({ ...e, type: 'Visa' })),
    ...(expiryData?.license || []).map((e: { type?: string; reference: string; expiry_date: string; days_left: number }) => ({ ...e, type: 'License' })),
  ].sort((a, b) => a.days_left - b.days_left).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Vehicles"
          value={dashboardData?.fleet?.total_vehicles || 0}
          subtitle={`${dashboardData?.fleet?.active_vehicles || 0} active`}
          icon={Bus}
          color="blue"
          href="/vehicles"
        />
        <StatCard
          title="Employees"
          value={dashboardData?.employees?.total_employees || 0}
          subtitle={`${dashboardData?.employees?.drivers || 0} drivers`}
          icon={Users}
          color="green"
          href="/employees"
        />
        <StatCard
          title="Pending Fines"
          value={`AED ${(dashboardData?.fines?.pending_amount || 0).toLocaleString()}`}
          subtitle={`${dashboardData?.fines?.pending_count || 0} unpaid`}
          icon={FileWarning}
          color="red"
          href="/fines"
        />
        <StatCard
          title="In Maintenance"
          value={dashboardData?.fleet?.in_maintenance || 0}
          subtitle={`${dashboardData?.maintenance?.scheduled || 0} scheduled`}
          icon={Wrench}
          color="yellow"
          href="/maintenance"
        />
      </div>

      {/* Alerts Banner */}
      {(dashboardData?.alerts?.urgent_count || 0) > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">
              {dashboardData?.alerts?.urgent_count} urgent alert{dashboardData?.alerts?.urgent_count !== 1 ? 's' : ''} require your attention
            </p>
            <p className="text-sm text-red-600">
              Documents expiring soon. Please review and take action.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Expiries */}
        <div className="lg:col-span-2 card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Expiries</h2>
            <span className="badge-warning">
              {allExpiries.length} items
            </span>
          </div>
          <div className="card-body">
            {allExpiries.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No documents expiring in the next 30 days
              </p>
            ) : (
              <div className="space-y-1">
                {allExpiries.map((item, index) => (
                  <ExpiryItem
                    key={index}
                    type={item.type}
                    reference={item.reference}
                    expiryDate={item.expiry_date}
                    daysLeft={item.days_left}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">This Month</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Income</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                AED {(financialData?.this_month?.income || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Expenses</span>
              </div>
              <span className="text-lg font-bold text-red-600">
                AED {(financialData?.this_month?.expenses || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Net Profit</span>
              </div>
              <span className={clsx(
                'text-lg font-bold',
                (financialData?.this_month?.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                AED {(financialData?.this_month?.profit || 0).toLocaleString()}
              </span>
            </div>

            <Link
              to="/reports"
              className="btn-secondary w-full mt-4"
            >
              View Full Report
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              to="/vehicles?action=add"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Bus className="w-8 h-8 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Add Vehicle</span>
            </Link>
            <Link
              to="/employees?action=add"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Users className="w-8 h-8 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Add Employee</span>
            </Link>
            <Link
              to="/maintenance?action=add"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Wrench className="w-8 h-8 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Log Maintenance</span>
            </Link>
            <Link
              to="/expenses?action=add"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Calendar className="w-8 h-8 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Add Expense</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
