import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { incomeApi } from '../services/api';
import { Plus, Search, DollarSign, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function Income() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['income', search, categoryFilter],
    queryFn: () => incomeApi.getAll({ search, category_id: categoryFilter || undefined }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['income-categories'],
    queryFn: () => incomeApi.getCategories(),
  });

  // Handle paginated response format
  const incomeRecords = data?.data?.data || [];
  const categories = categoriesData?.data || [];

  const totalAmount = incomeRecords.reduce((sum: number, inc: { amount: number }) => sum + inc.amount, 0);
  const pendingAmount = incomeRecords
    .filter((inc: { status: string }) => inc.status !== 'received')
    .reduce((sum: number, inc: { amount: number }) => sum + inc.amount, 0);

  const statusColors: Record<string, string> = {
    received: 'badge-success',
    pending: 'badge-warning',
    partial: 'badge-info',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Income</h1>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Income
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search income..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map((cat: { id: number; name: string }) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-green-600">AED {totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Collection</p>
              <p className="text-2xl font-bold text-yellow-600">AED {pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : incomeRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No income records found
                  </td>
                </tr>
              ) : (
                incomeRecords.map((income: { id: number; income_date: string; description: string; customer?: { name: string }; category?: { name: string }; amount: number; status: string }) => (
                  <tr key={income.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{format(new Date(income.income_date), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        {income.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">{income.customer?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="badge-gray">{income.category?.name || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-green-600">
                      AED {income.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx('badge', statusColors[income.status])}>{income.status}</span>
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
