import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { vehiclesApi } from '../services/api';
import { Vehicle } from '../types';
import { Plus, Search, Filter, Bus, Eye, Edit, Trash2, CheckCircle2, XCircle, Wrench as WrenchIcon } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import VehicleForm from '../components/VehicleForm';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

export default function Vehicles() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const queryClient = useQueryClient();
  const { isManager } = useAuth();

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

  const statusConfig: Record<string, { badge: string; icon: React.ElementType; label: string }> = {
    active: { badge: 'badge-success', icon: CheckCircle2, label: 'Active' },
    inactive: { badge: 'badge-gray', icon: XCircle, label: 'Inactive' },
    maintenance: { badge: 'badge-warning', icon: WrenchIcon, label: 'Maintenance' },
    sold: { badge: 'badge-info', icon: Bus, label: 'Sold' },
    scrapped: { badge: 'badge-danger', icon: XCircle, label: 'Scrapped' },
  };

  const getExpiryStatus = (expiryDate: string) => {
    const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { class: 'text-danger-600 font-semibold', label: 'Expired' };
    if (days <= 30) return { class: 'text-warning-600 font-medium', label: `${days}d left` };
    return { class: 'text-primary-700', label: format(new Date(expiryDate), 'MMM d, yyyy') };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicles</h1>
          <p className="page-subtitle">{vehicles.length} total vehicles in your fleet</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="input-group flex-1">
          <Search className="input-group-icon" />
          <input
            type="text"
            placeholder="Search by bus number, plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
        <div className="input-group sm:w-48">
          <Filter className="input-group-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input appearance-none cursor-pointer"
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
      <div className="table-container animate-fade-in">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Mulkiya Expiry</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
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
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Bus className="w-8 h-8" />
                      </div>
                      <p className="empty-state-title">No vehicles found</p>
                      <p className="empty-state-text">
                        {search || statusFilter
                          ? 'Try adjusting your search or filter criteria'
                          : 'Get started by adding your first vehicle'}
                      </p>
                      {!search && !statusFilter && (
                        <button
                          onClick={() => setShowForm(true)}
                          className="btn-primary mt-4"
                        >
                          <Plus className="w-4 h-4" />
                          Add Vehicle
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle: Vehicle, index: number) => {
                  const status = statusConfig[vehicle.status] || statusConfig.active;
                  const StatusIcon = status.icon;

                  return (
                    <tr
                      key={vehicle.id}
                      className="group animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td>
                        <div className="flex items-center gap-4">
                          <div className="stat-icon-blue w-10 h-10">
                            <Bus className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-primary-900 group-hover:text-accent-600 transition-colors">
                              {vehicle.bus_number}
                            </p>
                            <p className="text-xs text-primary-500 font-mono">{vehicle.plate_number}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span className="capitalize font-medium">{vehicle.type}</span>
                          {vehicle.make && (
                            <p className="text-xs text-primary-500">{vehicle.make} {vehicle.model}</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-primary-700">{vehicle.owner_name || '-'}</span>
                      </td>
                      <td>
                        {vehicle.mulkiya ? (
                          <span className={getExpiryStatus(vehicle.mulkiya.expiry_date).class}>
                            {getExpiryStatus(vehicle.mulkiya.expiry_date).label}
                          </span>
                        ) : (
                          <span className="text-primary-400 text-sm">Not set</span>
                        )}
                      </td>
                      <td>
                        <span className={clsx(status.badge, 'inline-flex items-center gap-1.5')}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/vehicles/${vehicle.id}`}
                            className="btn-icon"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setEditingVehicle(vehicle)}
                            className="btn-icon"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isManager && (
                            <button
                              onClick={() => setDeletingVehicle(vehicle)}
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
