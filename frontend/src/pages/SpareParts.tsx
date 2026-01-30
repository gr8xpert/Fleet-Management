import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sparePartsApi } from '../services/api';
import { Plus, Search, Package, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export default function SpareParts() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['spare-parts', search],
    queryFn: () => sparePartsApi.getAll({ search }),
  });

  const parts = data?.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Spare Parts</h1>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Part
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search parts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : parts.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">
            No spare parts found
          </div>
        ) : (
          parts.map((part: { id: number; name: string; part_number?: string; category?: string; quantity: number; min_quantity: number; unit_price?: number }) => (
            <div key={part.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Package className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{part.name}</h3>
                    <p className="text-sm text-gray-500">{part.part_number || 'No part number'}</p>
                  </div>
                </div>
                {part.quantity <= part.min_quantity && (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className={clsx(
                    'text-lg font-semibold',
                    part.quantity <= part.min_quantity ? 'text-yellow-600' : 'text-gray-900'
                  )}>
                    {part.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Unit Price</p>
                  <p className="text-lg font-semibold">
                    {part.unit_price ? `AED ${part.unit_price}` : '-'}
                  </p>
                </div>
              </div>
              {part.category && (
                <div className="mt-3">
                  <span className="badge-gray">{part.category}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
