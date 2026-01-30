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
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'amber' | 'red' | 'accent';
  href?: string;
  trend?: { value: number; label: string };
}

function StatCard({ title, value, subtitle, icon: Icon, color, href, trend }: StatCardProps) {
  const iconStyles = {
    blue: 'stat-icon-blue',
    green: 'stat-icon-green',
    amber: 'stat-icon-amber',
    red: 'stat-icon-red',
    accent: 'stat-icon-accent',
  };

  const Card = href ? Link : 'div';

  return (
    <Card
      to={href || '#'}
      className={clsx(
        'stat-card group animate-fade-in-up',
        href && 'cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between">
        <div className={iconStyles[color]}>
          <Icon className="w-6 h-6" />
        </div>
        {href && (
          <ChevronRight className="w-5 h-5 text-primary-300 group-hover:text-accent-500 group-hover:translate-x-1 transition-all duration-200" />
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-primary-500">{title}</p>
        <p className="text-3xl font-display font-bold text-primary-900 mt-1 tabular-nums">{value}</p>
        {subtitle && (
          <p className="text-sm text-primary-400 mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className={clsx(
            'inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-xs font-semibold',
            trend.value >= 0 ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
          )}>
            {trend.value >= 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(trend.value)}% {trend.label}
          </div>
        )}
      </div>
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
    <div className="expiry-item group">
      <div className="flex items-center gap-3">
        <div className={clsx(
          'w-2 h-2',
          urgency === 'urgent' ? 'bg-danger-500 animate-pulse-soft' :
          urgency === 'warning' ? 'bg-warning-500' : 'bg-primary-300'
        )} />
        <div>
          <p className="font-medium text-primary-800 group-hover:text-accent-600 transition-colors">{reference}</p>
          <p className="text-xs text-primary-500">{type}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={clsx(
          'text-sm font-semibold',
          urgency === 'urgent' ? 'expiry-urgent' : urgency === 'warning' ? 'expiry-warning' : 'expiry-normal'
        )}>
          {daysLeft <= 0 ? 'Expired' : `${daysLeft} days`}
        </p>
        <p className="text-xs text-primary-400">{format(new Date(expiryDate), 'MMM d, yyyy')}</p>
      </div>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  href: string;
  delay?: string;
}

function QuickAction({ icon: Icon, label, href, delay }: QuickActionProps) {
  return (
    <Link
      to={href}
      className={clsx('quick-action group animate-fade-in-up', delay)}
    >
      <div className="quick-action-icon group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6" />
      </div>
      <span className="quick-action-text group-hover:text-accent-600 transition-colors">{label}</span>
    </Link>
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
        <div className="text-center">
          <div className="spinner mx-auto" />
          <p className="text-sm text-primary-500 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const allExpiries = [
    ...(expiryData?.mulkiya || []).map((e: { type?: string; reference: string; expiry_date: string; days_left: number }) => ({ ...e, type: 'Mulkiya' })),
    ...(expiryData?.insurance || []).map((e: { type?: string; reference: string; expiry_date: string; days_left: number }) => ({ ...e, type: 'Insurance' })),
    ...(expiryData?.visa || []).map((e: { type?: string; reference: string; expiry_date: string; days_left: number }) => ({ ...e, type: 'Visa' })),
    ...(expiryData?.license || []).map((e: { type?: string; reference: string; expiry_date: string; days_left: number }) => ({ ...e, type: 'License' })),
  ].sort((a, b) => a.days_left - b.days_left).slice(0, 8);

  const profit = (financialData?.this_month?.profit || 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Link to="/reports" className="btn-primary">
          <Zap className="w-4 h-4" />
          View Reports
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          color="amber"
          href="/maintenance"
        />
      </div>

      {/* Alerts Banner */}
      {(dashboardData?.alerts?.urgent_count || 0) > 0 && (
        <div className="alert-danger animate-fade-in">
          <AlertTriangle className="alert-icon" />
          <div>
            <p className="alert-title">
              {dashboardData?.alerts?.urgent_count} urgent alert{dashboardData?.alerts?.urgent_count !== 1 ? 's' : ''} require attention
            </p>
            <p className="alert-text">
              Documents expiring soon. Review and take action to avoid penalties.
            </p>
          </div>
          <Link to="/reports" className="btn-secondary ml-auto text-sm py-2">
            Review All
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Expiries */}
        <div className="lg:col-span-2 card animate-fade-in-up">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-semibold text-primary-900">Upcoming Expiries</h2>
              <p className="text-sm text-primary-500 mt-0.5">Documents expiring in the next 30 days</p>
            </div>
            <span className="badge-warning">
              <Clock className="w-3 h-3" />
              {allExpiries.length} items
            </span>
          </div>
          <div className="card-body">
            {allExpiries.length === 0 ? (
              <div className="empty-state py-12">
                <div className="empty-state-icon">
                  <Calendar className="w-8 h-8" />
                </div>
                <p className="empty-state-title">All Clear!</p>
                <p className="empty-state-text">No documents expiring in the next 30 days</p>
              </div>
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
        <div className="card animate-fade-in-up delay-100">
          <div className="card-header">
            <h2 className="text-lg font-display font-semibold text-primary-900">This Month</h2>
            <p className="text-sm text-primary-500 mt-0.5">Financial overview</p>
          </div>
          <div className="card-body space-y-4">
            <div className="finance-card-positive">
              <div className="stat-icon-green w-10 h-10">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-primary-600">Income</p>
                <p className="text-xl font-bold text-success-600 tabular-nums">
                  AED {(financialData?.this_month?.income || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="finance-card-negative">
              <div className="stat-icon-red w-10 h-10">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-primary-600">Expenses</p>
                <p className="text-xl font-bold text-danger-600 tabular-nums">
                  AED {(financialData?.this_month?.expenses || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="finance-card-neutral">
              <div className={clsx(
                'stat-icon w-10 h-10',
                profit >= 0 ? 'from-success-500 to-success-600' : 'from-danger-500 to-danger-600'
              )}>
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-primary-600">Net Profit</p>
                <p className={clsx(
                  'text-xl font-bold tabular-nums',
                  profit >= 0 ? 'text-success-600' : 'text-danger-600'
                )}>
                  AED {profit.toLocaleString()}
                </p>
              </div>
            </div>

            <Link
              to="/reports"
              className="btn-secondary w-full mt-4"
            >
              View Full Report
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card animate-fade-in-up delay-200">
        <div className="card-header">
          <h2 className="text-lg font-display font-semibold text-primary-900">Quick Actions</h2>
          <p className="text-sm text-primary-500 mt-0.5">Common tasks and shortcuts</p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickAction
              icon={Bus}
              label="Add Vehicle"
              href="/vehicles?action=add"
              delay="delay-100"
            />
            <QuickAction
              icon={Users}
              label="Add Employee"
              href="/employees?action=add"
              delay="delay-150"
            />
            <QuickAction
              icon={Wrench}
              label="Log Maintenance"
              href="/maintenance?action=add"
              delay="delay-200"
            />
            <QuickAction
              icon={Plus}
              label="Add Expense"
              href="/expenses?action=add"
              delay="delay-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
