import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../services/api';
import { Plus, Search, Receipt, TrendingDown, Edit, Trash2, Filter, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import ExpenseForm from '../components/ExpenseForm';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Expenses() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [deletingExpense, setDeletingExpense] = useState<any>(null);
  const queryClient = useQueryClient();
  const { isManager } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', search, categoryFilter],
    queryFn: () => expensesApi.getAll({ search, category_id: categoryFilter || undefined }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => expensesApi.getCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => expensesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense deleted successfully');
      setDeletingExpense(null);
    },
    onError: () => {
      toast.error('Failed to delete expense');
    },
  });

  const expenses = data?.data?.data || [];
  const categories = categoriesData?.data || [];

  const totalAmount = expenses.reduce((sum: number, exp: any) => sum + (parseFloat(exp.amount) || 0), 0);

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">{expenses.length} expense records</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="input-group flex-1">
          <Search className="input-group-icon" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
        <div className="input-group sm:w-56">
          <Filter className="input-group-icon" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat: { id: number; name: string }) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Card */}
      <div className="stat-card animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="stat-icon-red">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-primary-500">Total Expenses</p>
            <p className="text-3xl font-display font-bold text-primary-900 tabular-nums">
              AED {totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <span className="badge-gray">{expenses.length} records</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container animate-fade-in">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Vehicle</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <div className="flex items-center justify-center">
                      <div className="spinner" />
                    </div>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Receipt className="w-8 h-8" />
                      </div>
                      <p className="empty-state-title">No expenses found</p>
                      <p className="empty-state-text">
                        {search || categoryFilter
                          ? 'Try adjusting your search or filter criteria'
                          : 'Get started by adding your first expense'}
                      </p>
                      {!search && !categoryFilter && (
                        <button
                          onClick={() => setShowForm(true)}
                          className="btn-primary mt-4"
                        >
                          <Plus className="w-4 h-4" />
                          Add Expense
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((expense: any, index: number) => (
                  <tr
                    key={expense.id}
                    className="group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary-400" />
                        <span className="font-medium">{format(new Date(expense.expense_date), 'MMM d, yyyy')}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="stat-icon-red w-8 h-8">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-primary-800 group-hover:text-accent-600 transition-colors">
                          {expense.description}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge-gray">{expense.category?.name || '-'}</span>
                    </td>
                    <td>
                      <span className="text-primary-600">{expense.vehicle?.bus_number || '-'}</span>
                    </td>
                    <td className="text-right">
                      <span className="font-bold text-danger-600 tabular-nums">
                        AED {parseFloat(expense.amount).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="btn-icon"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {isManager && (
                          <button
                            onClick={() => setDeletingExpense(expense)}
                            className="btn-icon hover:!bg-danger-50 hover:!text-danger-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseForm
        isOpen={showForm}
        onClose={handleCloseForm}
        expense={editingExpense}
      />

      <ConfirmDialog
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={() => deletingExpense && deleteMutation.mutate(deletingExpense.id)}
        title="Delete Expense"
        message={`Are you sure you want to delete this expense of AED ${deletingExpense?.amount}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
