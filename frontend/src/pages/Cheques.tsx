import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chequesApi } from '../services/api';
import { Plus, CreditCard, Check, X, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import ChequeForm from '../components/ChequeForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

export default function Cheques() {
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCheque, setEditingCheque] = useState<any>(null);
  const [deletingCheque, setDeletingCheque] = useState<any>(null);
  const queryClient = useQueryClient();
  const { isManager } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['cheques', typeFilter, statusFilter],
    queryFn: () => chequesApi.getAll({ type: typeFilter || undefined, status: statusFilter || undefined }),
  });

  const clearMutation = useMutation({
    mutationFn: (id: number) => chequesApi.clear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      toast.success('Cheque marked as cleared');
    },
  });

  const bounceMutation = useMutation({
    mutationFn: (id: number) => chequesApi.bounce(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      toast.success('Cheque marked as bounced');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => chequesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      toast.success('Cheque deleted successfully');
      setDeletingCheque(null);
    },
    onError: () => {
      toast.error('Failed to delete cheque');
    },
  });

  const cheques = data?.data?.data || [];

  const statusColors: Record<string, string> = {
    pending: 'badge-warning',
    cleared: 'badge-success',
    bounced: 'badge-danger',
    cancelled: 'badge-gray',
    replaced: 'badge-info',
  };

  const handleEdit = (cheque: any) => {
    setEditingCheque(cheque);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCheque(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Cheques</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Cheque
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="">All Types</option>
          <option value="received">Received</option>
          <option value="issued">Issued</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="cleared">Cleared</option>
          <option value="bounced">Bounced</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Pending Received</p>
          <p className="text-2xl font-bold text-green-600">
            AED {cheques
              .filter((c: any) => c.type === 'received' && c.status === 'pending')
              .reduce((sum: number, c: any) => sum + (parseFloat(c.amount) || 0), 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Pending Issued</p>
          <p className="text-2xl font-bold text-red-600">
            AED {cheques
              .filter((c: any) => c.type === 'issued' && c.status === 'pending')
              .reduce((sum: number, c: any) => sum + (parseFloat(c.amount) || 0), 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Bounced</p>
          <p className="text-2xl font-bold text-yellow-600">
            {cheques.filter((c: any) => c.status === 'bounced').length}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cheque Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
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
              ) : cheques.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No cheques found. Click "Add Cheque" to create one.
                  </td>
                </tr>
              ) : (
                cheques.map((cheque: any) => (
                  <tr key={cheque.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{format(new Date(cheque.cheque_date), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        {cheque.cheque_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">{cheque.bank_name}</td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        'badge',
                        cheque.type === 'received' ? 'badge-success' : 'badge-info'
                      )}>
                        {cheque.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">AED {cheque.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={clsx('badge', statusColors[cheque.status])}>{cheque.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        {cheque.status === 'pending' && (
                          <>
                            <button
                              onClick={() => clearMutation.mutate(cheque.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Mark as Cleared"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => bounceMutation.mutate(cheque.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Mark as Bounced"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(cheque)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {isManager && (
                          <button
                            onClick={() => setDeletingCheque(cheque)}
                            className="p-1 text-gray-400 hover:text-red-600"
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

      <ChequeForm
        isOpen={showForm}
        onClose={handleCloseForm}
        cheque={editingCheque}
      />

      <ConfirmDialog
        isOpen={!!deletingCheque}
        onClose={() => setDeletingCheque(null)}
        onConfirm={() => deletingCheque && deleteMutation.mutate(deletingCheque.id)}
        title="Delete Cheque"
        message={`Are you sure you want to delete cheque #${deletingCheque?.cheque_number}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
