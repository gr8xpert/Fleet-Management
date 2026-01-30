import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incomeApi, vehiclesApi, customersApi } from '../services/api';
import Modal from './Modal';
import toast from 'react-hot-toast';

interface IncomeFormProps {
  isOpen: boolean;
  onClose: () => void;
  income?: any;
}

export default function IncomeForm({ isOpen, onClose, income }: IncomeFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!income;

  const [formData, setFormData] = useState({
    category_id: '',
    customer_id: '',
    vehicle_id: '',
    income_date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    invoice_number: '',
    status: 'received',
    notes: '',
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['income-categories'],
    queryFn: () => incomeApi.getCategories(),
  });
  const categories = categoriesData?.data || [];

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.getAll(),
  });
  const vehicles = vehiclesData?.data?.data || vehiclesData?.data || [];

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
  });
  const customers = customersData?.data?.data || customersData?.data || [];

  useEffect(() => {
    if (income) {
      setFormData({
        category_id: income.category_id?.toString() || '',
        customer_id: income.customer_id?.toString() || '',
        vehicle_id: income.vehicle_id?.toString() || '',
        income_date: income.income_date || new Date().toISOString().split('T')[0],
        description: income.description || '',
        amount: income.amount?.toString() || '',
        payment_method: income.payment_method || 'cash',
        reference_number: income.reference_number || '',
        invoice_number: income.invoice_number || '',
        status: income.status || 'received',
        notes: income.notes || '',
      });
    } else {
      setFormData({
        category_id: '',
        customer_id: '',
        vehicle_id: '',
        income_date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        payment_method: 'cash',
        reference_number: '',
        invoice_number: '',
        status: 'received',
        notes: '',
      });
    }
  }, [income, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEdit && income) {
        return incomeApi.update(income.id, data);
      }
      return incomeApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      toast.success(isEdit ? 'Income updated!' : 'Income added!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to save income');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      customer_id: formData.customer_id ? parseInt(formData.customer_id) : null,
      vehicle_id: formData.vehicle_id ? parseInt(formData.vehicle_id) : null,
      amount: parseFloat(formData.amount),
    };
    mutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Income' : 'Add Income'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select
              className="input"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date *</label>
            <input
              type="date"
              className="input"
              value={formData.income_date}
              onChange={(e) => setFormData({ ...formData, income_date: e.target.value })}
              required
            />
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
            <label className="label">Status</label>
            <select
              className="input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="received">Received</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
            </select>
          </div>
          <div>
            <label className="label">Customer (Optional)</label>
            <select
              className="input"
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
            >
              <option value="">No Customer</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Vehicle (Optional)</label>
            <select
              className="input"
              value={formData.vehicle_id}
              onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
            >
              <option value="">No Vehicle</option>
              {vehicles.map((v: any) => (
                <option key={v.id} value={v.id}>{v.bus_number} - {v.plate_number}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Payment Method</label>
            <select
              className="input"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className="label">Invoice Number</label>
            <input
              type="text"
              className="input"
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Reference Number</label>
            <input
              type="text"
              className="input"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
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
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Add Income'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
