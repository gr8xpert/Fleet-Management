import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi, vehiclesApi, employeesApi, vendorsApi } from '../services/api';
import Modal from './Modal';
import toast from 'react-hot-toast';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: any;
}

export default function ExpenseForm({ isOpen, onClose, expense }: ExpenseFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!expense;

  const [formData, setFormData] = useState({
    category_id: '',
    vehicle_id: '',
    employee_id: '',
    vendor_id: '',
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    is_recurring: false,
    recurring_frequency: '',
    notes: '',
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => expensesApi.getCategories(),
  });
  const categories = categoriesData?.data || [];

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.getAll(),
  });
  const vehicles = vehiclesData?.data?.data || vehiclesData?.data || [];

  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.getAll(),
  });
  const employees = employeesData?.data?.data || employeesData?.data || [];

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorsApi.getAll(),
  });
  const vendors = vendorsData?.data?.data || vendorsData?.data || [];

  useEffect(() => {
    if (expense) {
      setFormData({
        category_id: expense.category_id?.toString() || '',
        vehicle_id: expense.vehicle_id?.toString() || '',
        employee_id: expense.employee_id?.toString() || '',
        vendor_id: expense.vendor_id?.toString() || '',
        expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        payment_method: expense.payment_method || 'cash',
        reference_number: expense.reference_number || '',
        is_recurring: expense.is_recurring || false,
        recurring_frequency: expense.recurring_frequency || '',
        notes: expense.notes || '',
      });
    } else {
      setFormData({
        category_id: '',
        vehicle_id: '',
        employee_id: '',
        vendor_id: '',
        expense_date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        payment_method: 'cash',
        reference_number: '',
        is_recurring: false,
        recurring_frequency: '',
        notes: '',
      });
    }
  }, [expense, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (isEdit && expense) {
        return expensesApi.update(expense.id, data);
      }
      return expensesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success(isEdit ? 'Expense updated!' : 'Expense added!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to save expense');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null) {
        data.append(key, value.toString());
      }
    });
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Expense' : 'Add Expense'} size="lg">
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
              value={formData.expense_date}
              onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
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
            <label className="label">Employee (Optional)</label>
            <select
              className="input"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
            >
              <option value="">No Employee</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Vendor (Optional)</label>
            <select
              className="input"
              value={formData.vendor_id}
              onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
            >
              <option value="">No Vendor</option>
              {vendors.map((v: any) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Reference Number</label>
            <input
              type="text"
              className="input"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              placeholder="Invoice/Receipt number"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_recurring"
              checked={formData.is_recurring}
              onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
            />
            <label htmlFor="is_recurring" className="text-sm">Recurring Expense</label>
          </div>
          {formData.is_recurring && (
            <div>
              <label className="label">Frequency</label>
              <select
                className="input"
                value={formData.recurring_frequency}
                onChange={(e) => setFormData({ ...formData, recurring_frequency: e.target.value })}
              >
                <option value="">Select Frequency</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}
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
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
