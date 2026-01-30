import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { vehiclesApi } from '../services/api';
import { Vehicle } from '../types';
import { Plus, Search, Filter, Bus, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import VehicleForm from '../components/VehicleForm';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Vehicles() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', search, statusFilter],
    queryFn: () => vehiclesApi.getAll({ search, status: statusFilter || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vehiclesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle deleted successfully');
      setDeletingVehicle(null);
    },
    onError: () => {
      toast.error('Failed to delete vehicle');
    },
  });

  const vehicles = data?.data?.data || [];

  const statusColors: Record<string, string> = {
    active: 'badge-success',
    inactive: 'badge-gray',
    maintenance: 'badge-warning',
    sold: 'badge-info',
    scrapped: 'badge-danger',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by bus number, plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input pl-10 pr-8 appearance-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">In Maintenance</option>
            <option value="sold">Sold</option>
            <option value="scrapped">Scrapped</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mulkiya Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No vehicles found
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle: Vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-50 rounded-lg">
                          <Bus className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{vehicle.bus_number}</p>
                          <p className="text-sm text-gray-500">{vehicle.plate_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize">{vehicle.type}</span>
                      {vehicle.make && (
                        <p className="text-sm text-gray-500">{vehicle.make} {vehicle.model}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">{vehicle.owner_name || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vehicle.mulkiya ? (
                        <div>
                          <p className={clsx(
                            'text-sm font-medium',
                            new Date(vehicle.mulkiya.expiry_date) < new Date() ? 'text-red-600' :
                            new Date(vehicle.mulkiya.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'text-yellow-600' :
                            'text-gray-900'
                          )}>
                            {format(new Date(vehicle.mulkiya.expiry_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx('badge', statusColors[vehicle.status])}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/vehicles/${vehicle.id}`}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setEditingVehicle(vehicle)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingVehicle(vehicle)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showForm || !!editingVehicle}
        onClose={() => {
          setShowForm(false);
          setEditingVehicle(null);
        }}
        title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
      >
        <VehicleForm
          vehicle={editingVehicle}
          onSuccess={() => {
            setShowForm(false);
            setEditingVehicle(null);
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingVehicle(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingVehicle}
        onClose={() => setDeletingVehicle(null)}
        onConfirm={() => deletingVehicle && deleteMutation.mutate(deletingVehicle.id)}
        title="Delete Vehicle"
        message={`Are you sure you want to delete vehicle ${deletingVehicle?.bus_number}? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
