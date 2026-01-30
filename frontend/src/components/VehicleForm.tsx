import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { vehiclesApi } from '../services/api';
import { Vehicle } from '../types';
import toast from 'react-hot-toast';

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VehicleForm({ vehicle, onSuccess, onCancel }: VehicleFormProps) {
  const [formData, setFormData] = useState({
    bus_number: vehicle?.bus_number || '',
    plate_number: vehicle?.plate_number || '',
    plate_code: vehicle?.plate_code || '',
    chassis_number: vehicle?.chassis_number || '',
    engine_number: vehicle?.engine_number || '',
    type: vehicle?.type || 'bus',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year?.toString() || '',
    seating_capacity: vehicle?.seating_capacity?.toString() || '',
    color: vehicle?.color || '',
    owner_name: vehicle?.owner_name || '',
    owner_contact: vehicle?.owner_contact || '',
    purchase_date: vehicle?.purchase_date || '',
    purchase_price: vehicle?.purchase_price?.toString() || '',
    status: vehicle?.status || 'active',
    current_km: vehicle?.current_km?.toString() || '0',
    notes: vehicle?.notes || '',
  });

  const mutation = useMutation({
    mutationFn: (data: typeof formData) =>
      vehicle ? vehiclesApi.update(vehicle.id, data) : vehiclesApi.create(data),
    onSuccess: () => {
      toast.success(vehicle ? 'Vehicle updated successfully' : 'Vehicle added successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Something went wrong');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Bus Number *</label>
          <input
            type="text"
            name="bus_number"
            value={formData.bus_number}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">Plate Number *</label>
          <input
            type="text"
            name="plate_number"
            value={formData.plate_number}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">Plate Code</label>
          <input
            type="text"
            name="plate_code"
            value={formData.plate_code}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div>
          <label className="label">Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="bus">Bus</option>
            <option value="minibus">Minibus</option>
            <option value="coaster">Coaster</option>
            <option value="van">Van</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Make</label>
          <input
            type="text"
            name="make"
            value={formData.make}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Toyota"
          />
        </div>
        <div>
          <label className="label">Model</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Coaster"
          />
        </div>
        <div>
          <label className="label">Year</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="input"
            min="1990"
            max={new Date().getFullYear() + 1}
          />
        </div>
        <div>
          <label className="label">Seating Capacity</label>
          <input
            type="number"
            name="seating_capacity"
            value={formData.seating_capacity}
            onChange={handleChange}
            className="input"
            min="1"
            max="100"
          />
        </div>
        <div>
          <label className="label">Color</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div>
          <label className="label">Current KM</label>
          <input
            type="number"
            name="current_km"
            value={formData.current_km}
            onChange={handleChange}
            className="input"
            min="0"
          />
        </div>
        <div>
          <label className="label">Owner Name</label>
          <input
            type="text"
            name="owner_name"
            value={formData.owner_name}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div>
          <label className="label">Owner Contact</label>
          <input
            type="text"
            name="owner_contact"
            value={formData.owner_contact}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div>
          <label className="label">Purchase Date</label>
          <input
            type="date"
            name="purchase_date"
            value={formData.purchase_date}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div>
          <label className="label">Purchase Price</label>
          <input
            type="number"
            name="purchase_price"
            value={formData.purchase_price}
            onChange={handleChange}
            className="input"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="label">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">In Maintenance</option>
            <option value="sold">Sold</option>
            <option value="scrapped">Scrapped</option>
          </select>
        </div>
        <div>
          <label className="label">Chassis Number</label>
          <input
            type="text"
            name="chassis_number"
            value={formData.chassis_number}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="input"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
      </div>
    </form>
  );
}
