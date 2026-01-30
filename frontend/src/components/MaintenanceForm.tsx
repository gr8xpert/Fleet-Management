import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi, vehiclesApi, vendorsApi } from '../services/api';
import Modal from './Modal';
import toast from 'react-hot-toast';

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  maintenance?: any;
}

const maintenanceTypes = [
  { value: 'preventive', label: 'Preventive Maintenance' },
  { value: 'corrective', label: 'Corrective/Repair' },
  { value: 'scheduled', label: 'Scheduled Service' },
  { value: 'emergency', label: 'Emergency Repair' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'tyre_change', label: 'Tyre Change' },
  { value: 'oil_change', label: 'Oil Change' },
  { value: 'ac_service', label: 'AC Service' },
  { value: 'brake_service', label: 'Brake Service' },
  { value: 'other', label: 'Other' },
];

export default function MaintenanceForm({ isOpen, onClose, maintenance }: MaintenanceFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!maintenance;

  const [formData, setFormData] = useState({
    vehicle_id: '',
    vendor_id: '',
    type: 'preventive',
    service_date: new Date().toISOString().split('T')[0],
    description: '',
    odometer_reading: '',
    labor_cost: '',
    parts_cost: '',
    total_cost: '',
    status: 'scheduled',
    completed_date: '',
    next_service_date: '',
    next_service_odometer: '',
    notes: '',
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.getAll(),
  });
  const vehicles = vehiclesData?.data?.data || vehiclesData?.data || [];

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorsApi.getAll(),
  });
  const vendors = vendorsData?.data?.data || vendorsData?.data || [];

  useEffect(() => {
    if (maintenance) {
      setFormData({
        vehicle_id: maintenance.vehicle_id?.toString() || '',
        vendor_id: maintenance.vendor_id?.toString() || '',
        type: maintenance.type || 'preventive',
        service_date: maintenance.service_date || new Date().toISOString().split('T')[0],
        description: maintenance.description || '',
        odometer_reading: maintenance.odometer_reading?.toString() || '',
        labor_cost: maintenance.labor_cost?.toString() || '',
        parts_cost: maintenance.parts_cost?.toString() || '',
        total_cost: maintenance.total_cost?.toString() || '',
        status: maintenance.status || 'scheduled',
        completed_date: maintenance.completed_date || '',
        next_service_date: maintenance.next_service_date || '',
        next_service_odometer: maintenance.next_service_odometer?.toString() || '',
        notes: maintenance.notes || '',
      });
    } else {
      setFormData({
        vehicle_id: '',
        vendor_id: '',
        type: 'preventive',
        service_date: new Date().toISOString().split('T')[0],
        description: '',
        odometer_reading: '',
        labor_cost: '',
        parts_cost: '',
        total_cost: '',
        status: 'scheduled',
        completed_date: '',
        next_service_date: '',
        next_service_odometer: '',
        notes: '',
      });
    }
  }, [maintenance, isOpen]);

  // Auto calculate total cost
  useEffect(() => {
    const labor = parseFloat(formData.labor_cost) || 0;
    const parts = parseFloat(formData.parts_cost) || 0;
    if (labor > 0 || parts > 0) {
      setFormData(prev => ({ ...prev, total_cost: (labor + parts).toString() }));
    }
  }, [formData.labor_cost, formData.parts_cost]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEdit && maintenance) {
        return maintenanceApi.update(maintenance.id, data);
      }
      return maintenanceApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success(isEdit ? 'Maintenance updated!' : 'Maintenance logged!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to save maintenance');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      vehicle_id: formData.vehicle_id ? parseInt(formData.vehicle_id) : null,
      vendor_id: formData.vendor_id ? parseInt(formData.vendor_id) : null,
      odometer_reading: formData.odometer_reading ? parseInt(formData.odometer_reading) : null,
      labor_cost: formData.labor_cost ? parseFloat(formData.labor_cost) : 0,
      parts_cost: formData.parts_cost ? parseFloat(formData.parts_cost) : 0,
      total_cost: formData.total_cost ? parseFloat(formData.total_cost) : 0,
      next_service_odometer: formData.next_service_odometer ? parseInt(formData.next_service_odometer) : null,
    };
    mutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Maintenance' : 'Log Maintenance'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Vehicle *</label>
            <select
              className="input"
              value={formData.vehicle_id}
              onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
              required
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v: any) => (
                <option key={v.id} value={v.id}>{v.bus_number} - {v.plate_number}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Service Type *</label>
            <select
              className="input"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              {maintenanceTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Service Date *</label>
            <input
              type="date"
              className="input"
              value={formData.service_date}
              onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="label">Vendor/Workshop</label>
            <select
              className="input"
              value={formData.vendor_id}
              onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
            >
              <option value="">Select Vendor</option>
              {vendors.map((v: any) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Odometer Reading (km)</label>
            <input
              type="number"
              className="input"
              value={formData.odometer_reading}
              onChange={(e) => setFormData({ ...formData, odometer_reading: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Labor Cost (AED)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={formData.labor_cost}
              onChange={(e) => setFormData({ ...formData, labor_cost: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Parts Cost (AED)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={formData.parts_cost}
              onChange={(e) => setFormData({ ...formData, parts_cost: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Total Cost (AED)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={formData.total_cost}
              onChange={(e) => setFormData({ ...formData, total_cost: e.target.value })}
            />
          </div>
          {formData.status === 'completed' && (
            <div>
              <label className="label">Completed Date</label>
              <input
                type="date"
                className="input"
                value={formData.completed_date}
                onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="label">Next Service Date</label>
            <input
              type="date"
              className="input"
              value={formData.next_service_date}
              onChange={(e) => setFormData({ ...formData, next_service_date: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Next Service Odometer (km)</label>
            <input
              type="number"
              className="input"
              value={formData.next_service_odometer}
              onChange={(e) => setFormData({ ...formData, next_service_odometer: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label">Description *</label>
          <input
            type="text"
            className="input"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea
            className="input"
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Log Maintenance'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
