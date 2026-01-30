import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incomeApi } from '../services/api';
import { Plus, Search, DollarSign, TrendingUp, Edit, Trash2, Filter, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import IncomeForm from '../components/IncomeForm';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Income() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [deletingIncome, setDeletingIncome] = useState<any>(null);
  const queryClient = useQueryClient();
  const { isManager } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['income', search, categoryFilter],
    queryFn: () => incomeApi.getAll({ search, category_id: categoryFilter || undefined }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['income-categories'],
    queryFn: () => incomeApi.getCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => incomeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      toast.success('Income deleted successfully');
      setDeletingIncome(null);
    },
    onError: () => {
      toast.error('Failed to delete income');
    },
  });

  const incomeRecords = data?.data?.data || [];
  const categories = categoriesData?.data || [];

  const totalAmount = incomeRecords.reduce((sum: number, inc: any) => sum + (parseFloat(inc.amount) || 0), 0);
  const pendingAmount = incomeRecords
    .filter((inc: any) => inc.status !== 'received')
    .reduce((sum: number, inc: any) => sum + (parseFloat(inc.amount) || 0), 0);

  const statusConfig: Record<string, { badge: string; label: string }> = {
    received: { badge: 'badge-success', label: 'Received' },
    pending: { badge: 'badge-warning', label: 'Pending' },
    partial: { badge: 'badge-info', label: 'Partial' },
  };

  const handleEdit = (income: any) => {
    setEditingIncome(income);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingIncome(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Income</h1>
          <p className="page-subtitle">{incomeRecords.length} income records</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Add Income
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="input-group flex-1">
          <Search className="input-group-icon" />
          <input
            type="text"
            placeholder="Search income..."
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stat-card animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="stat-icon-green">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-500">Total Income</p>
              <p className="text-2xl font-display font-bold text-success-600 tabular-nums">
                AED {totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card animate-fade-in-up delay-100">
          <div className="flex items-center gap-4">
            <div className="stat-icon-amber">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-500">Pending Collection</p>
              <p className="text-2xl font-display font-bold text-warning-600 tabular-nums">
                AED {pendingAmount.toLocaleString()}
              </p>
            </div>
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
                <th>Customer</th>
                <th>Category</th>
                <th className="text-right">Amount</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12">
                    <div className="flex items-center justify-center">
                      <div className="spinner" />
                    </div>
                  </td>
                </tr>
              ) : incomeRecords.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <DollarSign className="w-8 h-8" />
                      </div>
                      <p className="empty-state-title">No income records found</p>
                      <p className="empty-state-text">
                        {search || categoryFilter
                          ? 'Try adjusting your search or filter criteria'
                          : 'Get started by adding your first income record'}
                      </p>
                      {!search && !categoryFilter && (
                        <button
                          onClick={() => setShowForm(true)}
                          className="btn-primary mt-4"
                        >
                          <Plus className="w-4 h-4" />
                          Add Income
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                incomeRecords.map((income: any, index: number) => {
                  const status = statusConfig[income.status] || statusConfig.pending;

                  return (
                    <tr
                      key={income.id}
                      className="group animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary-400" />
                          <span className="font-medium">{format(new Date(income.income_date), 'MMM d, yyyy')}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="stat-icon-green w-8 h-8">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-primary-800 group-hover:text-accent-600 transition-colors">
                            {income.description}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="text-primary-600">{income.customer?.name || '-'}</span>
                      </td>
                      <td>
                        <span className="badge-gray">{income.category?.name || '-'}</span>
                      </td>
                      <td className="text-right">
                        <span className="font-bold text-success-600 tabular-nums">
                          AED {parseFloat(income.amount).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className={status.badge}>{status.label}</span>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(income)}
                            className="btn-icon"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isManager && (
                            <button
                              onClick={() => setDeletingIncome(income)}
                              className="btn-icon hover:!bg-danger-50 hover:!text-danger-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <IncomeForm
        isOpen={showForm}
        onClose={handleCloseForm}
        income={editingIncome}
      />

      <ConfirmDialog
        isOpen={!!deletingIncome}
        onClose={() => setDeletingIncome(null)}
        onConfirm={() => deletingIncome && deleteMutation.mutate(deletingIncome.id)}
        title="Delete Income"
        message={`Are you sure you want to delete this income of AED ${deletingIncome?.amount}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
