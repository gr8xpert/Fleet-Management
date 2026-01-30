import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chequesApi, customersApi, vendorsApi } from '../services/api';
import Modal from './Modal';
import toast from 'react-hot-toast';

interface ChequeFormProps {
  isOpen: boolean;
  onClose: () => void;
  cheque?: any;
}

const banks = [
  'Emirates NBD',
  'ADCB',
  'FAB',
  'Dubai Islamic Bank',
  'Mashreq Bank',
  'RAKBANK',
  'ENBD',
  'Commercial Bank of Dubai',
  'Other'
];

export default function ChequeForm({ isOpen, onClose, cheque }: ChequeFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!cheque;

  const [formData, setFormData] = useState({
    type: 'received',
    cheque_number: '',
    cheque_date: new Date().toISOString().split('T')[0],
    bank_name: '',
    branch: '',
    amount: '',
    payee_name: '',
    customer_id: '',
    vendor_id: '',
    description: '',
    status: 'pending',
    cleared_date: '',
    deposit_account: '',
    notes: '',
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
  });
  const customers = customersData?.data?.data || customersData?.data || [];

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorsApi.getAll(),
  });
  const vendors = vendorsData?.data?.data || vendorsData?.data || [];

  useEffect(() => {
    if (cheque) {
      setFormData({
        type: cheque.type || 'received',
        cheque_number: cheque.cheque_number || '',
        cheque_date: cheque.cheque_date || new Date().toISOString().split('T')[0],
        bank_name: cheque.bank_name || '',
        branch: cheque.branch || '',
        amount: cheque.amount?.toString() || '',
        payee_name: cheque.payee_name || '',
        customer_id: cheque.customer_id?.toString() || '',
        vendor_id: cheque.vendor_id?.toString() || '',
        description: cheque.description || '',
        status: cheque.status || 'pending',
        cleared_date: cheque.cleared_date || '',
        deposit_account: cheque.deposit_account || '',
        notes: cheque.notes || '',
      });
    } else {
      setFormData({
        type: 'received',
        cheque_number: '',
        cheque_date: new Date().toISOString().split('T')[0],
        bank_name: '',
        branch: '',
        amount: '',
        payee_name: '',
        customer_id: '',
        vendor_id: '',
        description: '',
        status: 'pending',
        cleared_date: '',
        deposit_account: '',
        notes: '',
      });
    }
  }, [cheque, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEdit && cheque) {
        return chequesApi.update(cheque.id, data);
      }
      return chequesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      toast.success(isEdit ? 'Cheque updated!' : 'Cheque added!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to save cheque');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      customer_id: formData.customer_id ? parseInt(formData.customer_id) : null,
      vendor_id: formData.vendor_id ? parseInt(formData.vendor_id) : null,
    };
    mutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Cheque' : 'Add Cheque'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Type *</label>
            <select
              className="input"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <option value="received">Received</option>
              <option value="issued">Issued</option>
            </select>
          </div>
          <div>
            <label className="label">Cheque Number *</label>
            <input
              type="text"
              className="input"
              value={formData.cheque_number}
              onChange={(e) => setFormData({ ...formData, cheque_number: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Cheque Date *</label>
            <input
              type="date"
              className="input"
              value={formData.cheque_date}
              onChange={(e) => setFormData({ ...formData, cheque_date: e.target.value })}
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
            <label className="label">Bank Name *</label>
            <select
              className="input"
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              required
            >
              <option value="">Select Bank</option>
              {banks.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Branch</label>
            <input
              type="text"
              className="input"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Payee Name</label>
            <input
              type="text"
              className="input"
              value={formData.payee_name}
              onChange={(e) => setFormData({ ...formData, payee_name: e.target.value })}
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
              <option value="cleared">Cleared</option>
              <option value="bounced">Bounced</option>
              <option value="cancelled">Cancelled</option>
              <option value="replaced">Replaced</option>
            </select>
          </div>
          {formData.type === 'received' && (
            <div>
              <label className="label">Customer</label>
              <select
                className="input"
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              >
                <option value="">Select Customer</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          {formData.type === 'issued' && (
            <div>
              <label className="label">Vendor</label>
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
          )}
          {formData.status === 'cleared' && (
            <div>
              <label className="label">Cleared Date</label>
              <input
                type="date"
                className="input"
                value={formData.cleared_date}
                onChange={(e) => setFormData({ ...formData, cleared_date: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="label">Deposit Account</label>
            <input
              type="text"
              className="input"
              value={formData.deposit_account}
              onChange={(e) => setFormData({ ...formData, deposit_account: e.target.value })}
              placeholder="Bank account number"
            />
          </div>
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
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Add Cheque'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
