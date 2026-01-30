import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { maintenanceApi } from '../services/api';
import { Plus, Search, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function Maintenance() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance', search, statusFilter],
    queryFn: () => maintenanceApi.getAll({ status: statusFilter || undefined }),
  });

  const logs = data?.data?.data || [];

  const statusColors: Record<string, string> = {
    scheduled: 'badge-info',
    in_progress: 'badge-warning',
    completed: 'badge-success',
    cancelled: 'badge-gray',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Log Maintenance
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No maintenance records found
                  </td>
                </tr>
              ) : (
                logs.map((log: { id: number; vehicle?: { bus_number: string; plate_number: string }; type: string; service_date: string; total_cost: number; status: string }) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Wrench className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{log.vehicle?.bus_number}</p>
                          <p className="text-sm text-gray-500">{log.vehicle?.plate_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">{log.type.replace('_', ' ')}</td>
                    <td className="px-6 py-4">{format(new Date(log.service_date), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4">AED {log.total_cost.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={clsx('badge', statusColors[log.status])}>{log.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
