import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi, vehicleDocumentsApi } from '../services/api';
import { ArrowLeft, Bus, FileText, Wrench, Receipt, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDocForm, setShowDocForm] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesApi.getById(Number(id)),
    enabled: !!id,
  });

  const { data: historyData } = useQuery({
    queryKey: ['vehicle-history', id],
    queryFn: () => vehiclesApi.getHistory(Number(id)),
    enabled: !!id,
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId: number) => vehicleDocumentsApi.delete(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
      toast.success('Document deleted');
      setDeletingDoc(null);
    },
  });

  const vehicle = data?.data;
  const history = historyData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vehicle not found</p>
        <Link to="/vehicles" className="btn-primary mt-4">
          Back to Vehicles
        </Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'badge-success',
    inactive: 'badge-gray',
    maintenance: 'badge-warning',
    sold: 'badge-info',
    scrapped: 'badge-danger',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/vehicles')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Bus className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{vehicle.bus_number}</h1>
              <p className="text-gray-500">{vehicle.plate_number}</p>
            </div>
            <span className={clsx('badge ml-4', statusColors[vehicle.status])}>
              {vehicle.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Vehicle Details</h2>
            </div>
            <div className="card-body">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Type</dt>
                  <dd className="font-medium capitalize">{vehicle.type}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Make / Model</dt>
                  <dd className="font-medium">{vehicle.make || '-'} {vehicle.model}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Year</dt>
                  <dd className="font-medium">{vehicle.year || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Seating Capacity</dt>
                  <dd className="font-medium">{vehicle.seating_capacity || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Color</dt>
                  <dd className="font-medium">{vehicle.color || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Current KM</dt>
                  <dd className="font-medium">{vehicle.current_km?.toLocaleString()} km</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Chassis Number</dt>
                  <dd className="font-medium">{vehicle.chassis_number || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Engine Number</dt>
                  <dd className="font-medium">{vehicle.engine_number || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Owner</dt>
                  <dd className="font-medium">{vehicle.owner_name || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Owner Contact</dt>
                  <dd className="font-medium">{vehicle.owner_contact || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Purchase Date</dt>
                  <dd className="font-medium">
                    {vehicle.purchase_date ? format(new Date(vehicle.purchase_date), 'MMM d, yyyy') : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Purchase Price</dt>
                  <dd className="font-medium">
                    {vehicle.purchase_price ? `AED ${vehicle.purchase_price.toLocaleString()}` : '-'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold">Documents</h2>
              <button
                onClick={() => setShowDocForm(true)}
                className="btn-primary text-sm py-1.5"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Document
              </button>
            </div>
            <div className="card-body">
              {vehicle.documents?.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No documents added yet</p>
              ) : (
                <div className="space-y-3">
                  {vehicle.documents?.map((doc: { id: number; document_type: string; document_number?: string; expiry_date: string }) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium capitalize">{doc.document_type}</p>
                          <p className="text-sm text-gray-500">{doc.document_number || 'No number'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={clsx(
                            'text-sm font-medium',
                            new Date(doc.expiry_date) < new Date() ? 'text-red-600' : 'text-gray-600'
                          )}>
                            Expires: {format(new Date(doc.expiry_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <button
                          onClick={() => setDeletingDoc(doc.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Maintenance History */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Maintenance</h2>
              <Link to={`/maintenance?vehicle=${id}`} className="text-primary-600 text-sm hover:underline">
                View All
              </Link>
            </div>
            <div className="card-body">
              {history?.maintenance?.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No maintenance records</p>
              ) : (
                <div className="space-y-3">
                  {history?.maintenance?.slice(0, 5).map((log: { id: number; type: string; service_date: string; total_cost: number; description?: string }) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Wrench className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium capitalize">{log.type.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-500">{format(new Date(log.service_date), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">AED {log.total_cost.toLocaleString()}</p>
                        {log.description && (
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">{log.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Quick Stats</h2>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Maintenance</span>
                <span className="font-semibold">{history?.maintenance?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Fines</span>
                <span className="font-semibold">{vehicle.fines?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Documents</span>
                <span className="font-semibold">{vehicle.documents?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </div>
            <div className="card-body space-y-2">
              <Link
                to={`/maintenance?action=add&vehicle=${id}`}
                className="btn-secondary w-full justify-start"
              >
                <Wrench className="w-4 h-4 mr-2" />
                Log Maintenance
              </Link>
              <Link
                to={`/expenses?action=add&vehicle=${id}`}
                className="btn-secondary w-full justify-start"
              >
                <Receipt className="w-4 h-4 mr-2" />
                Add Expense
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Document Form Modal */}
      <Modal
        isOpen={showDocForm}
        onClose={() => setShowDocForm(false)}
        title="Add Document"
      >
        <DocumentForm
          vehicleId={Number(id)}
          onSuccess={() => {
            setShowDocForm(false);
            queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
          }}
          onCancel={() => setShowDocForm(false)}
        />
      </Modal>

      {/* Delete Document Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingDoc}
        onClose={() => setDeletingDoc(null)}
        onConfirm={() => deletingDoc && deleteDocMutation.mutate(deletingDoc)}
        title="Delete Document"
        message="Are you sure you want to delete this document?"
        confirmText="Delete"
        isLoading={deleteDocMutation.isPending}
      />
    </div>
  );
}

// Simple Document Form Component
function DocumentForm({ vehicleId, onSuccess, onCancel }: { vehicleId: number; onSuccess: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    document_type: 'mulkiya',
    document_number: '',
    issue_date: '',
    expiry_date: '',
    cost: '',
    notes: '',
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => vehicleDocumentsApi.create(vehicleId, data),
    onSuccess: () => {
      toast.success('Document added successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to add document');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Document Type *</label>
        <select
          value={formData.document_type}
          onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
          className="input"
          required
        >
          <option value="mulkiya">Mulkiya</option>
          <option value="registration">Registration</option>
          <option value="insurance">Insurance</option>
          <option value="permit">Permit</option>
          <option value="fitness">Fitness Certificate</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className="label">Document Number</label>
        <input
          type="text"
          value={formData.document_number}
          onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
          className="input"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Issue Date</label>
          <input
            type="date"
            value={formData.issue_date}
            onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label">Expiry Date *</label>
          <input
            type="date"
            value={formData.expiry_date}
            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            className="input"
            required
          />
        </div>
      </div>
      <div>
        <label className="label">Cost</label>
        <input
          type="number"
          value={formData.cost}
          onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
          className="input"
          min="0"
          step="0.01"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? 'Saving...' : 'Add Document'}
        </button>
      </div>
    </form>
  );
}
