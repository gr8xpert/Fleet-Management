import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visasApi, employeesApi } from '../services/api';
import Modal from './Modal';
import toast from 'react-hot-toast';

interface VisaFormProps {
  isOpen: boolean;
  onClose: () => void;
  visa?: any;
}

const visaTypes = [
  { value: 'employment', label: 'Employment Visa' },
  { value: 'visit', label: 'Visit Visa' },
  { value: 'tourist', label: 'Tourist Visa' },
  { value: 'transit', label: 'Transit Visa' },
  { value: 'residence', label: 'Residence Visa' },
  { value: 'mission', label: 'Mission Visa' },
  { value: 'student', label: 'Student Visa' },
  { value: 'other', label: 'Other' },
];

export default function VisaForm({ isOpen, onClose, visa }: VisaFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!visa;

  const [formData, setFormData] = useState({
    employee_id: '',
    visa_number: '',
    visa_type: 'employment',
    issue_date: '',
    expiry_date: '',
    sponsor: '',
    uid_number: '',
    file_number: '',
    entry_permit_number: '',
    place_of_issue: '',
    profession: '',
    cost: '',
    status: 'active',
    notes: '',
  });

  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.getAll(),
  });
  const employees = employeesData?.data?.data || employeesData?.data || [];

  useEffect(() => {
    if (visa) {
      setFormData({
        employee_id: visa.employee_id?.toString() || '',
        visa_number: visa.visa_number || '',
        visa_type: visa.visa_type || 'employment',
        issue_date: visa.issue_date || '',
        expiry_date: visa.expiry_date || '',
        sponsor: visa.sponsor || '',
        uid_number: visa.uid_number || '',
        file_number: visa.file_number || '',
        entry_permit_number: visa.entry_permit_number || '',
        place_of_issue: visa.place_of_issue || '',
        profession: visa.profession || '',
        cost: visa.cost?.toString() || '',
        status: visa.status || 'active',
        notes: visa.notes || '',
      });
    } else {
      setFormData({
        employee_id: '',
        visa_number: '',
        visa_type: 'employment',
        issue_date: '',
        expiry_date: '',
        sponsor: '',
        uid_number: '',
        file_number: '',
        entry_permit_number: '',
        place_of_issue: '',
        profession: '',
        cost: '',
        status: 'active',
        notes: '',
      });
    }
  }, [visa, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEdit && visa) {
        return visasApi.update(visa.id, data);
      }
      return visasApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visas'] });
      toast.success(isEdit ? 'Visa updated!' : 'Visa added!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to save visa');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      employee_id: formData.employee_id ? parseInt(formData.employee_id) : null,
      cost: formData.cost ? parseFloat(formData.cost) : null,
    };
    mutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Visa' : 'Add Visa'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Employee *</label>
            <select
              className="input"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Visa Type *</label>
            <select
              className="input"
              value={formData.visa_type}
              onChange={(e) => setFormData({ ...formData, visa_type: e.target.value })}
              required
            >
              {visaTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Visa Number</label>
            <input
              type="text"
              className="input"
              value={formData.visa_number}
              onChange={(e) => setFormData({ ...formData, visa_number: e.target.value })}
            />
          </div>
          <div>
            <label className="label">UID Number</label>
            <input
              type="text"
              className="input"
              value={formData.uid_number}
              onChange={(e) => setFormData({ ...formData, uid_number: e.target.value })}
              placeholder="Unified ID Number"
            />
          </div>
          <div>
            <label className="label">Issue Date</label>
            <input
              type="date"
              className="input"
              value={formData.issue_date}
              onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Expiry Date *</label>
            <input
              type="date"
              className="input"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Sponsor</label>
            <input
              type="text"
              className="input"
              value={formData.sponsor}
              onChange={(e) => setFormData({ ...formData, sponsor: e.target.value })}
              placeholder="Company/Sponsor name"
            />
          </div>
          <div>
            <label className="label">File Number</label>
            <input
              type="text"
              className="input"
              value={formData.file_number}
              onChange={(e) => setFormData({ ...formData, file_number: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Entry Permit Number</label>
            <input
              type="text"
              className="input"
              value={formData.entry_permit_number}
              onChange={(e) => setFormData({ ...formData, entry_permit_number: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Place of Issue</label>
            <input
              type="text"
              className="input"
              value={formData.place_of_issue}
              onChange={(e) => setFormData({ ...formData, place_of_issue: e.target.value })}
              placeholder="e.g., Dubai, Abu Dhabi"
            />
          </div>
          <div>
            <label className="label">Profession (on Visa)</label>
            <input
              type="text"
              className="input"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Cost (AED)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="pending_renewal">Pending Renewal</option>
              <option value="cancelled">Cancelled</option>
            </select>
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
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Add Visa'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
