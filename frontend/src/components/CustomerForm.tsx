import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../services/api';
import Modal from './Modal';
import toast from 'react-hot-toast';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: any;
}

const customerTypes = [
  { value: 'corporate', label: 'Corporate' },
  { value: 'individual', label: 'Individual' },
  { value: 'school', label: 'School' },
  { value: 'tour_operator', label: 'Tour Operator' },
  { value: 'other', label: 'Other' },
];

export default function CustomerForm({ isOpen, onClose, customer }: CustomerFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!customer;

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    type: 'corporate',
    contact_person: '',
    phone: '',
    phone_alternate: '',
    email: '',
    address: '',
    trn_number: '',
    credit_limit: '',
    payment_terms: '30',
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        company_name: customer.company_name || '',
        type: customer.type || 'corporate',
        contact_person: customer.contact_person || '',
        phone: customer.phone || '',
        phone_alternate: customer.phone_alternate || '',
        email: customer.email || '',
        address: customer.address || '',
        trn_number: customer.trn_number || '',
        credit_limit: customer.credit_limit?.toString() || '',
        payment_terms: customer.payment_terms?.toString() || '30',
        notes: customer.notes || '',
        is_active: customer.is_active !== false,
      });
    } else {
      setFormData({
        name: '',
        company_name: '',
        type: 'corporate',
        contact_person: '',
        phone: '',
        phone_alternate: '',
        email: '',
        address: '',
        trn_number: '',
        credit_limit: '',
        payment_terms: '30',
        notes: '',
        is_active: true,
      });
    }
  }, [customer, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEdit && customer) {
        return customersApi.update(customer.id, data);
      }
      return customersApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(isEdit ? 'Customer updated!' : 'Customer added!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to save customer');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit) : null,
      payment_terms: formData.payment_terms ? parseInt(formData.payment_terms) : 30,
    };
    mutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Customer' : 'Add Customer'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Name *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Company Name</label>
            <input
              type="text"
              className="input"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Type *</label>
            <select
              className="input"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              {customerTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Contact Person</label>
            <input
              type="text"
              className="input"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              type="tel"
              className="input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+971 XX XXX XXXX"
            />
          </div>
          <div>
            <label className="label">Alternate Phone</label>
            <input
              type="tel"
              className="input"
              value={formData.phone_alternate}
              onChange={(e) => setFormData({ ...formData, phone_alternate: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">TRN Number</label>
            <input
              type="text"
              className="input"
              value={formData.trn_number}
              onChange={(e) => setFormData({ ...formData, trn_number: e.target.value })}
              placeholder="Tax Registration Number"
            />
          </div>
          <div>
            <label className="label">Credit Limit (AED)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={formData.credit_limit}
              onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Payment Terms (Days)</label>
            <input
              type="number"
              className="input"
              value={formData.payment_terms}
              onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <textarea
            className="input"
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          />
          <label htmlFor="is_active" className="text-sm">Active Customer</label>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Add Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
