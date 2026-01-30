import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visasApi } from '../services/api';
import { Plus, Search, CreditCard, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import VisaForm from '../components/VisaForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

export default function Visas() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVisa, setEditingVisa] = useState<any>(null);
  const [deletingVisa, setDeletingVisa] = useState<any>(null);
  const queryClient = useQueryClient();
  const { isManager } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['visas', search, statusFilter],
    queryFn: () => visasApi.getAll({ search, status: statusFilter || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => visasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visas'] });
      toast.success('Visa deleted successfully');
      setDeletingVisa(null);
    },
    onError: () => {
      toast.error('Failed to delete visa');
    },
  });

  const visas = data?.data?.data || [];

  const statusColors: Record<string, string> = {
    active: 'badge-success',
    expired: 'badge-danger',
    cancelled: 'badge-gray',
    pending_renewal: 'badge-warning',
  };

  const handleEdit = (visa: any) => {
    setEditingVisa(visa);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVisa(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Visa Management</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Visa
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by employee name or visa number..."
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
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="pending_renewal">Pending Renewal</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visa Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
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
              ) : visas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No visas found. Click "Add Visa" to create one.
                  </td>
                </tr>
              ) : (
                visas.map((visa: any) => {
                  const daysLeft = Math.ceil((new Date(visa.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const isExpiringSoon = daysLeft > 0 && daysLeft <= 30;

                  return (
                    <tr key={visa.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          <span className="font-medium">{visa.employee?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{visa.visa_number || '-'}</td>
                      <td className="px-6 py-4 capitalize">{visa.visa_type}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isExpiringSoon && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                          <span className={clsx(
                            daysLeft <= 0 ? 'text-red-600 font-medium' :
                            isExpiringSoon ? 'text-yellow-600' : ''
                          )}>
                            {format(new Date(visa.expiry_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx('badge', statusColors[visa.status])}>{visa.status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(visa)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isManager && (
                            <button
                              onClick={() => setDeletingVisa(visa)}
                              className="p-1 text-gray-400 hover:text-red-600"
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

      <VisaForm
        isOpen={showForm}
        onClose={handleCloseForm}
        visa={editingVisa}
      />

      <ConfirmDialog
        isOpen={!!deletingVisa}
        onClose={() => setDeletingVisa(null)}
        onConfirm={() => deletingVisa && deleteMutation.mutate(deletingVisa.id)}
        title="Delete Visa"
        message={`Are you sure you want to delete this visa record for ${deletingVisa?.employee?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
