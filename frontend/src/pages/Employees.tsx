import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { employeesApi } from '../services/api';
import { Employee } from '../types';
import { Plus, Search, Users, Phone } from 'lucide-react';
import clsx from 'clsx';
import EmployeeForm from '../components/EmployeeForm';

export default function Employees() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', search, typeFilter],
    queryFn: () => employeesApi.getAll({ search, type: typeFilter || undefined }),
  });

  const employees = data?.data?.data || [];

  const statusColors: Record<string, string> = {
    active: 'badge-success',
    inactive: 'badge-gray',
    terminated: 'badge-danger',
    on_leave: 'badge-warning',
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Employee
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="">All Types</option>
          <option value="driver">Drivers</option>
          <option value="mechanic">Mechanics</option>
          <option value="cleaner">Cleaners</option>
          <option value="supervisor">Supervisors</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : employees.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">
            No employees found. Click "Add Employee" to create one.
          </div>
        ) : (
          employees.map((employee: Employee) => (
            <Link
              key={employee.id}
              to={`/employees/${employee.id}`}
              className="card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-lg">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{employee.type}</p>
                  </div>
                </div>
                <span className={clsx('badge', statusColors[employee.status])}>
                  {employee.status}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {employee.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {employee.phone}
                  </div>
                )}
                {employee.employee_id && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    ID: {employee.employee_id}
                  </div>
                )}
              </div>

              {employee.nationality && (
                <div className="mt-3">
                  <span className="badge-gray">{employee.nationality}</span>
                </div>
              )}
            </Link>
          ))
        )}
      </div>

      <EmployeeForm
        isOpen={showForm}
        onClose={handleCloseForm}
        employee={editingEmployee}
      />
    </div>
  );
}
