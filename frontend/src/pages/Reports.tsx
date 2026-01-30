import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../services/api';
import { BarChart3, TrendingUp, TrendingDown, Bus, Users, FileWarning, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import clsx from 'clsx';

export default function Reports() {
  const [reportType, setReportType] = useState('financial');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const { data: financialData } = useQuery({
    queryKey: ['report-financial', startDate, endDate],
    queryFn: () => reportsApi.getFinancial({ start_date: startDate, end_date: endDate }),
    enabled: reportType === 'financial',
  });

  const { data: fleetData } = useQuery({
    queryKey: ['report-fleet'],
    queryFn: () => reportsApi.getFleet(),
    enabled: reportType === 'fleet',
  });

  const { data: finesData } = useQuery({
    queryKey: ['report-fines', startDate, endDate],
    queryFn: () => reportsApi.getFines({ start_date: startDate, end_date: endDate }),
    enabled: reportType === 'fines',
  });

  const { data: expiriesData } = useQuery({
    queryKey: ['report-expiries'],
    queryFn: () => reportsApi.getExpiries({ days: 90 }),
    enabled: reportType === 'expiries',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button className="btn-primary">
          <Download className="w-5 h-5 mr-2" />
          Export Report
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'financial', label: 'Financial', icon: TrendingUp },
          { id: 'fleet', label: 'Fleet', icon: Bus },
          { id: 'fines', label: 'Fines', icon: FileWarning },
          { id: 'expiries', label: 'Expiries', icon: Users },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              reportType === type.id
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            )}
          >
            <type.icon className="w-4 h-4" />
            {type.label}
          </button>
        ))}
      </div>

      {/* Date Range */}
      {(reportType === 'financial' || reportType === 'fines') && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>
        </div>
      )}

      {/* Financial Report */}
      {reportType === 'financial' && financialData?.data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    AED {financialData.data.summary?.total_income?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    AED {financialData.data.summary?.total_expenses?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Net Profit</p>
                  <p className={clsx(
                    'text-2xl font-bold',
                    (financialData.data.summary?.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    AED {financialData.data.summary?.net_profit?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Expenses by Category</h2>
            </div>
            <div className="card-body">
              {Object.entries(financialData.data.expenses_by_category || {}).length === 0 ? (
                <p className="text-center text-gray-500 py-4">No expense data available</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(financialData.data.expenses_by_category || {}).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-gray-700">{category}</span>
                      <span className="font-medium">AED {(amount as number).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fleet Report */}
      {reportType === 'fleet' && fleetData?.data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{fleetData.data.summary?.total_vehicles || 0}</p>
              <p className="text-sm text-gray-500">Total Vehicles</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{fleetData.data.summary?.active || 0}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{fleetData.data.summary?.in_maintenance || 0}</p>
              <p className="text-sm text-gray-500">In Maintenance</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-gray-600">{fleetData.data.summary?.inactive || 0}</p>
              <p className="text-sm text-gray-500">Inactive</p>
            </div>
          </div>

          {/* Vehicles by Type */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Vehicles by Type</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {Object.entries(fleetData.data.by_type || {}).map(([type, count]) => (
                  <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{count as number}</p>
                    <p className="text-sm text-gray-500 capitalize">{type}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fines Report */}
      {reportType === 'fines' && finesData?.data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{finesData.data.summary?.total_count || 0}</p>
              <p className="text-sm text-gray-500">Total Fines</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-red-600">
                AED {finesData.data.summary?.total_amount?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-500">Total Amount</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">
                AED {finesData.data.summary?.pending?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-green-600">
                AED {finesData.data.summary?.paid?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-500">Paid</p>
            </div>
          </div>
        </div>
      )}

      {/* Expiries Report */}
      {reportType === 'expiries' && expiriesData?.data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{expiriesData.data.summary?.mulkiya_count || 0}</p>
              <p className="text-sm text-gray-500">Mulkiya</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-orange-600">{expiriesData.data.summary?.insurance_count || 0}</p>
              <p className="text-sm text-gray-500">Insurance</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{expiriesData.data.summary?.visa_count || 0}</p>
              <p className="text-sm text-gray-500">Visa</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{expiriesData.data.summary?.license_count || 0}</p>
              <p className="text-sm text-gray-500">License</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">{expiriesData.data.summary?.passport_count || 0}</p>
              <p className="text-sm text-gray-500">Passport</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
