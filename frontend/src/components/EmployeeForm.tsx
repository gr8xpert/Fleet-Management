import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../services/api';
import Modal from './Modal';
import toast from 'react-hot-toast';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: any;
}

const employeeTypes = [
  { value: 'driver', label: 'Driver' },
  { value: 'mechanic', label: 'Mechanic' },
  { value: 'cleaner', label: 'Cleaner' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'admin', label: 'Admin' },
  { value: 'other', label: 'Other' },
];

const nationalities = [
  'Pakistani', 'Indian', 'Bangladeshi', 'Sri Lankan', 'Nepali',
  'Filipino', 'Egyptian', 'Jordanian', 'Syrian', 'Lebanese',
  'Emirati', 'Saudi', 'Omani', 'Yemeni', 'Other'
];

export default function EmployeeForm({ isOpen, onClose, employee }: EmployeeFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!employee;

  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    name_arabic: '',
    type: 'driver',
    nationality: '',
    passport_number: '',
    passport_expiry: '',
    emirates_id: '',
    emirates_id_expiry: '',
    license_number: '',
    license_expiry: '',
    phone: '',
    phone_alternate: '',
    address: '',
    join_date: '',
    basic_salary: '',
    salary_card_number: '',
    bank_name: '',
    bank_account: '',
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        employee_id: employee.employee_id || '',
        name: employee.name || '',
        name_arabic: employee.name_arabic || '',
        type: employee.type || 'driver',
        nationality: employee.nationality || '',
        passport_number: employee.passport_number || '',
        passport_expiry: employee.passport_expiry || '',
        emirates_id: employee.emirates_id || '',
        emirates_id_expiry: employee.emirates_id_expiry || '',
        license_number: employee.license_number || '',
        license_expiry: employee.license_expiry || '',
        phone: employee.phone || '',
        phone_alternate: employee.phone_alternate || '',
        address: employee.address || '',
        join_date: employee.join_date || '',
        basic_salary: employee.basic_salary?.toString() || '',
        salary_card_number: employee.salary_card_number || '',
        bank_name: employee.bank_name || '',
        bank_account: employee.bank_account || '',
        status: employee.status || 'active',
        notes: employee.notes || '',
      });
    } else {
      setFormData({
        employee_id: '',
        name: '',
        name_arabic: '',
        type: 'driver',
        nationality: '',
        passport_number: '',
        passport_expiry: '',
        emirates_id: '',
        emirates_id_expiry: '',
        license_number: '',
        license_expiry: '',
        phone: '',
        phone_alternate: '',
        address: '',
        join_date: '',
        basic_salary: '',
        salary_card_number: '',
        bank_name: '',
        bank_account: '',
        status: 'active',
        notes: '',
      });
    }
  }, [employee, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (isEdit && employee) {
        return employeesApi.update(employee.id, data);
      }
      return employeesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(isEdit ? 'Employee updated!' : 'Employee added!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to save employee');
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Employee' : 'Add Employee'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Employee ID</label>
              <input
                type="text"
                className="input"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                placeholder="Auto-generated if empty"
              />
            </div>
            <div>
              <label className="label">Name (English) *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Name (Arabic)</label>
              <input
                type="text"
                className="input"
                value={formData.name_arabic}
                onChange={(e) => setFormData({ ...formData, name_arabic: e.target.value })}
                dir="rtl"
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
                {employeeTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Nationality</label>
              <select
                className="input"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              >
                <option value="">Select Nationality</option>
                {nationalities.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Passport Number</label>
              <input
                type="text"
                className="input"
                value={formData.passport_number}
                onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Passport Expiry</label>
              <input
                type="date"
                className="input"
                value={formData.passport_expiry}
                onChange={(e) => setFormData({ ...formData, passport_expiry: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Emirates ID</label>
              <input
                type="text"
                className="input"
                value={formData.emirates_id}
                onChange={(e) => setFormData({ ...formData, emirates_id: e.target.value })}
                placeholder="784-XXXX-XXXXXXX-X"
              />
            </div>
            <div>
              <label className="label">Emirates ID Expiry</label>
              <input
                type="date"
                className="input"
                value={formData.emirates_id_expiry}
                onChange={(e) => setFormData({ ...formData, emirates_id_expiry: e.target.value })}
              />
            </div>
            <div>
              <label className="label">License Number</label>
              <input
                type="text"
                className="input"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              />
            </div>
            <div>
              <label className="label">License Expiry</label>
              <input
                type="date"
                className="input"
                value={formData.license_expiry}
                onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="md:col-span-2">
              <label className="label">Address</label>
              <textarea
                className="input"
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Employment */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Employment & Salary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Join Date</label>
              <input
                type="date"
                className="input"
                value={formData.join_date}
                onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Basic Salary (AED)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={formData.basic_salary}
                onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Salary Card Number</label>
              <input
                type="text"
                className="input"
                value={formData.salary_card_number}
                onChange={(e) => setFormData({ ...formData, salary_card_number: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Bank Name</label>
              <input
                type="text"
                className="input"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Bank Account</label>
              <input
                type="text"
                className="input"
                value={formData.bank_account}
                onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
              />
            </div>
          </div>
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
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Add Employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
