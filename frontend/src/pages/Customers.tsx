import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../services/api';
import { Plus, Search, Building2, Phone, Mail } from 'lucide-react';
import clsx from 'clsx';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search, typeFilter],
    queryFn: () => customersApi.getAll({ search, type: typeFilter || undefined }),
  });

  const customers = data?.data?.data || [];

  const typeColors: Record<string, string> = {
    corporate: 'badge-info',
    individual: 'badge-gray',
    school: 'badge-success',
    tour_operator: 'badge-warning',
    other: 'badge-gray',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Customer
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
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
          <option value="corporate">Corporate</option>
          <option value="individual">Individual</option>
          <option value="school">School</option>
          <option value="tour_operator">Tour Operator</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">
            No customers found
          </div>
        ) : (
          customers.map((customer: { id: number; name: string; company_name?: string; contact_person?: string; phone?: string; email?: string; type: string; is_active: boolean }) => (
            <div key={customer.id} className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{customer.name}</h3>
                    {customer.company_name && (
                      <p className="text-sm text-gray-500">{customer.company_name}</p>
                    )}
                  </div>
                </div>
                <span className={clsx('badge', typeColors[customer.type])}>
                  {customer.type.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {customer.contact_person && (
                  <p className="text-sm text-gray-600">Contact: {customer.contact_person}</p>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {customer.phone}
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    {customer.email}
                  </div>
                )}
              </div>

              {!customer.is_active && (
                <div className="mt-3">
                  <span className="badge-danger">Inactive</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
