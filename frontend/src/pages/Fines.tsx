import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { finesApi } from '../services/api';
import { Plus, Search, FileWarning, Check } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export default function Fines() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['fines', search, statusFilter],
    queryFn: () => finesApi.getAll({ status: statusFilter || undefined }),
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: number) => finesApi.markAsPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fines'] });
      toast.success('Fine marked as paid');
    },
  });

  const fines = data?.data?.data || [];

  const statusColors: Record<string, string> = {
    pending: 'badge-warning',
    paid: 'badge-success',
    disputed: 'badge-info',
    waived: 'badge-gray',
  };

  const typeColors: Record<string, string> = {
    traffic: 'text-red-600',
    parking: 'text-orange-600',
    speeding: 'text-red-700',
    salik: 'text-blue-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Fines & Penalties</h1>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Fine
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
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="disputed">Disputed</option>
          <option value="waived">Waived</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            AED {fines.filter((f: { status: string }) => f.status === 'pending').reduce((sum: number, f: { amount: number }) => sum + f.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Pending Count</p>
          <p className="text-2xl font-bold text-gray-900">
            {fines.filter((f: { status: string }) => f.status === 'pending').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total This Month</p>
          <p className="text-2xl font-bold text-gray-900">
            AED {fines.reduce((sum: number, f: { amount: number }) => sum + f.amount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : fines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No fines found
                  </td>
                </tr>
              ) : (
                fines.map((fine: { id: number; fine_date: string; vehicle?: { bus_number: string }; driver?: { name: string }; type: string; amount: number; black_points: number; status: string }) => (
                  <tr key={fine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{format(new Date(fine.fine_date), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileWarning className="w-4 h-4 text-gray-400" />
                        {fine.vehicle?.bus_number || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">{fine.driver?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4">
                      <span className={clsx('capitalize', typeColors[fine.type] || 'text-gray-600')}>
                        {fine.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">AED {fine.amount.toLocaleString()}</span>
                      {fine.black_points > 0 && (
                        <span className="ml-2 text-xs text-red-600">+{fine.black_points} pts</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx('badge', statusColors[fine.status])}>{fine.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      {fine.status === 'pending' && (
                        <button
                          onClick={() => markPaidMutation.mutate(fine.id)}
                          disabled={markPaidMutation.isPending}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Mark as Paid"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
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
