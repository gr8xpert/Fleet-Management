import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { expensesApi } from '../services/api';
import { Plus, Search, Receipt, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

export default function Expenses() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', search, categoryFilter],
    queryFn: () => expensesApi.getAll({ search, category_id: categoryFilter || undefined }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => expensesApi.getCategories(),
  });

  // Handle paginated response format
  const expenses = data?.data?.data || [];
  const categories = categoriesData?.data || [];

  const totalAmount = expenses.reduce((sum: number, exp: { amount: number }) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Expense
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
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
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">AED {totalAmount.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">{expenses.length} records</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
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
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No expenses found
                  </td>
                </tr>
              ) : (
                expenses.map((expense: { id: number; expense_date: string; description: string; category?: { name: string }; vehicle?: { bus_number: string }; amount: number }) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{format(new Date(expense.expense_date), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-gray-400" />
                        {expense.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge-gray">{expense.category?.name || '-'}</span>
                    </td>
                    <td className="px-6 py-4">{expense.vehicle?.bus_number || '-'}</td>
                    <td className="px-6 py-4 text-right font-medium">AED {expense.amount.toLocaleString()}</td>
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
