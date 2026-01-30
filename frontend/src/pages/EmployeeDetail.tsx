import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../services/api';
import { ArrowLeft, CreditCard, FileText } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesApi.getById(Number(id)),
    enabled: !!id,
  });

  const employee = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Employee not found</p>
        <Link to="/employees" className="btn-primary mt-4">Back to Employees</Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'badge-success',
    inactive: 'badge-gray',
    terminated: 'badge-danger',
    on_leave: 'badge-warning',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/employees')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-bold text-2xl">
              {employee.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
            <p className="text-gray-500 capitalize">{employee.type}</p>
          </div>
          <span className={clsx('badge ml-4', statusColors[employee.status])}>
            {employee.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Personal Information</h2>
            </div>
            <div className="card-body">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Employee ID</dt>
                  <dd className="font-medium">{employee.employee_id || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Nationality</dt>
                  <dd className="font-medium">{employee.nationality || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Phone</dt>
                  <dd className="font-medium">{employee.phone || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Alt. Phone</dt>
                  <dd className="font-medium">{employee.phone_alternate || '-'}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-sm text-gray-500">Address</dt>
                  <dd className="font-medium">{employee.address || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Join Date</dt>
                  <dd className="font-medium">
                    {employee.join_date ? format(new Date(employee.join_date), 'MMM d, yyyy') : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Basic Salary</dt>
                  <dd className="font-medium">
                    {employee.basic_salary ? `AED ${employee.basic_salary.toLocaleString()}` : '-'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Documents</h2>
            </div>
            <div className="card-body">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Passport Number</dt>
                  <dd className="font-medium">{employee.passport_number || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Passport Expiry</dt>
                  <dd className={clsx(
                    'font-medium',
                    employee.passport_expiry && new Date(employee.passport_expiry) < new Date() && 'text-red-600'
                  )}>
                    {employee.passport_expiry ? format(new Date(employee.passport_expiry), 'MMM d, yyyy') : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Emirates ID</dt>
                  <dd className="font-medium">{employee.emirates_id || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Emirates ID Expiry</dt>
                  <dd className={clsx(
                    'font-medium',
                    employee.emirates_id_expiry && new Date(employee.emirates_id_expiry) < new Date() && 'text-red-600'
                  )}>
                    {employee.emirates_id_expiry ? format(new Date(employee.emirates_id_expiry), 'MMM d, yyyy') : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">License Number</dt>
                  <dd className="font-medium">{employee.license_number || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">License Expiry</dt>
                  <dd className={clsx(
                    'font-medium',
                    employee.license_expiry && new Date(employee.license_expiry) < new Date() && 'text-red-600'
                  )}>
                    {employee.license_expiry ? format(new Date(employee.license_expiry), 'MMM d, yyyy') : '-'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Visa Info */}
          {employee.current_visa && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold">Current Visa</h2>
              </div>
              <div className="card-body">
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Visa Number</dt>
                    <dd className="font-medium">{employee.current_visa.visa_number || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Visa Type</dt>
                    <dd className="font-medium capitalize">{employee.current_visa.visa_type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Expiry Date</dt>
                    <dd className={clsx(
                      'font-medium',
                      new Date(employee.current_visa.expiry_date) < new Date() && 'text-red-600'
                    )}>
                      {format(new Date(employee.current_visa.expiry_date), 'MMM d, yyyy')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Status</dt>
                    <dd>
                      <span className={clsx(
                        'badge',
                        employee.current_visa.status === 'active' ? 'badge-success' : 'badge-danger'
                      )}>
                        {employee.current_visa.status}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </div>
            <div className="card-body space-y-2">
              <Link to={`/visas?employee=${id}`} className="btn-secondary w-full justify-start">
                <CreditCard className="w-4 h-4 mr-2" />
                View Visas
              </Link>
              <Link to={`/fines?driver=${id}`} className="btn-secondary w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                View Fines
              </Link>
            </div>
          </div>

          {/* Bank Info */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Bank Details</h2>
            </div>
            <div className="card-body space-y-3">
              <div>
                <p className="text-sm text-gray-500">Bank Name</p>
                <p className="font-medium">{employee.bank_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Number</p>
                <p className="font-medium">{employee.bank_account || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
