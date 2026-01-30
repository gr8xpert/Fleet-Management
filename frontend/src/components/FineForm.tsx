import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { finesApi, vehiclesApi, employeesApi } from '../services/api';
import Modal from './Modal';
import toast from 'react-hot-toast';

interface FineFormProps {
  isOpen: boolean;
  onClose: () => void;
  fine?: any;
}

const fineTypes = [
  { value: 'traffic', label: 'Traffic Violation' },
  { value: 'parking', label: 'Parking' },
  { value: 'speeding', label: 'Speeding' },
  { value: 'salik', label: 'Salik' },
  { value: 'rta', label: 'RTA' },
  { value: 'other', label: 'Other' },
];

export default function FineForm({ isOpen, onClose, fine }: FineFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!fine;

  const [formData, setFormData] = useState({
    vehicle_id: '',
    driver_id: '',
    fine_date: new Date().toISOString().split('T')[0],
    type: 'traffic',
    amount: '',
    black_points: '0',
    fine_number: '',
    location: '',
    description: '',
    status: 'pending',
    paid_date: '',
    paid_amount: '',
    deducted_from_salary: false,
    notes: '',
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.getAll(),
  });
  const vehicles = vehiclesData?.data?.data || vehiclesData?.data || [];

  const { data: employeesData } = useQuery({
    queryKey: ['employees', { type: 'driver' }],
    queryFn: () => employeesApi.getAll({ type: 'driver' }),
  });
  const drivers = employeesData?.data?.data || employeesData?.data || [];

  useEffect(() => {
    if (fine) {
      setFormData({
        vehicle_id: fine.vehicle_id?.toString() || '',
        driver_id: fine.driver_id?.toString() || '',
        fine_date: fine.fine_date || new Date().toISOString().split('T')[0],
        type: fine.type || 'traffic',
        amount: fine.amount?.toString() || '',
        black_points: fine.black_points?.toString() || '0',
        fine_number: fine.fine_number || '',
        location: fine.location || '',
        description: fine.description || '',
        status: fine.status || 'pending',
        paid_date: fine.paid_date || '',
        paid_amount: fine.paid_amount?.toString() || '',
        deducted_from_salary: fine.deducted_from_salary || false,
        notes: fine.notes || '',
      });
    } else {
      setFormData({
        vehicle_id: '',
        driver_id: '',
        fine_date: new Date().toISOString().split('T')[0],
        type: 'traffic',
        amount: '',
        black_points: '0',
        fine_number: '',
        location: '',
        description: '',
        status: 'pending',
        paid_date: '',
        paid_amount: '',
        deducted_from_salary: false,
        notes: '',
      });
    }
  }, [fine, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEdit && fine) {
        return finesApi.update(fine.id, data);
      }
      return finesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fines'] });
      toast.success(isEdit ? 'Fine updated!' : 'Fine added!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to save fine');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      vehicle_id: formData.vehicle_id ? parseInt(formData.vehicle_id) : null,
      driver_id: formData.driver_id ? parseInt(formData.driver_id) : null,
      amount: parseFloat(formData.amount),
      black_points: parseInt(formData.black_points) || 0,
      paid_amount: formData.paid_amount ? parseFloat(formData.paid_amount) : null,
    };
    mutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Fine' : 'Add Fine'} size="lg">
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
            <label className="label">Driver</label>
            <select
              className="input"
              value={formData.driver_id}
              onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
            >
              <option value="">Select Driver</option>
              {drivers.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Fine Date *</label>
            <input
              type="date"
              className="input"
              value={formData.fine_date}
              onChange={(e) => setFormData({ ...formData, fine_date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Fine Type *</label>
            <select
              className="input"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              {fineTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Amount (AED) *</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Black Points</label>
            <input
              type="number"
              className="input"
              value={formData.black_points}
              onChange={(e) => setFormData({ ...formData, black_points: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Fine Number</label>
            <input
              type="text"
              className="input"
              value={formData.fine_number}
              onChange={(e) => setFormData({ ...formData, fine_number: e.target.value })}
              placeholder="Traffic fine reference"
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="disputed">Disputed</option>
              <option value="waived">Waived</option>
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input
              type="text"
              className="input"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Where the fine occurred"
            />
          </div>
          {formData.status === 'paid' && (
            <>
              <div>
                <label className="label">Paid Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.paid_date}
                  onChange={(e) => setFormData({ ...formData, paid_date: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Paid Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.paid_amount}
                  onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                />
              </div>
            </>
          )}
        </div>
        <div>
          <label className="label">Description</label>
          <input
            type="text"
            className="input"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="deducted_from_salary"
            checked={formData.deducted_from_salary}
            onChange={(e) => setFormData({ ...formData, deducted_from_salary: e.target.checked })}
          />
          <label htmlFor="deducted_from_salary" className="text-sm">Deduct from Driver Salary</label>
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
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Add Fine'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
