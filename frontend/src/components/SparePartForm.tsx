import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sparePartsApi, vendorsApi } from '../services/api';
import Modal from './Modal';
import toast from 'react-hot-toast';

interface SparePartFormProps {
  isOpen: boolean;
  onClose: () => void;
  sparePart?: {
    id: number;
    name: string;
    part_number?: string;
    category?: string;
    description?: string;
    quantity: number;
    min_quantity: number;
    unit_price?: number;
    location?: string;
    vendor_id?: number;
  };
}

const categories = [
  'Engine',
  'Brake',
  'Transmission',
  'Suspension',
  'Electrical',
  'AC/Cooling',
  'Tyre',
  'Body Parts',
  'Filters',
  'Lubricants',
  'Other'
];

export default function SparePartForm({ isOpen, onClose, sparePart }: SparePartFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!sparePart;

  const [formData, setFormData] = useState({
    name: '',
    part_number: '',
    category: '',
    description: '',
    quantity: 0,
    min_quantity: 5,
    unit_price: '',
    location: '',
    vendor_id: '',
  });

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorsApi.getAll(),
  });
  const vendors = vendorsData?.data?.data || vendorsData?.data || [];

  useEffect(() => {
    if (sparePart) {
      setFormData({
        name: sparePart.name || '',
        part_number: sparePart.part_number || '',
        category: sparePart.category || '',
        description: sparePart.description || '',
        quantity: sparePart.quantity || 0,
        min_quantity: sparePart.min_quantity || 5,
        unit_price: sparePart.unit_price?.toString() || '',
        location: sparePart.location || '',
        vendor_id: sparePart.vendor_id?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        part_number: '',
        category: '',
        description: '',
        quantity: 0,
        min_quantity: 5,
        unit_price: '',
        location: '',
        vendor_id: '',
      });
    }
  }, [sparePart, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const payload = {
        ...data,
        unit_price: data.unit_price ? parseFloat(data.unit_price) : null,
        vendor_id: data.vendor_id ? parseInt(data.vendor_id) : null,
      };
      if (isEdit && sparePart) {
        return sparePartsApi.update(sparePart.id, payload);
      }
      return sparePartsApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spare-parts'] });
      toast.success(isEdit ? 'Spare part updated!' : 'Spare part added!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to save spare part');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Spare Part' : 'Add Spare Part'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Part Name *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Part Number</label>
            <input
              type="text"
              className="input"
              value={formData.part_number}
              onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Vendor</label>
            <select
              className="input"
              value={formData.vendor_id}
              onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
            >
              <option value="">Select Vendor</option>
              {vendors.map((v: { id: number; name: string }) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Quantity *</label>
            <input
              type="number"
              className="input"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              min="0"
              required
            />
          </div>
          <div>
            <label className="label">Minimum Quantity (Reorder Level)</label>
            <input
              type="number"
              className="input"
              value={formData.min_quantity}
              onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>
          <div>
            <label className="label">Unit Price (AED)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={formData.unit_price}
              onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Storage Location</label>
            <input
              type="text"
              className="input"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Shelf A-3"
            />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Add Part'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
