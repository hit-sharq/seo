'use client';

import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface BrandSelectorProps {
  onChange: (brandId: string | null) => void;
}

export function BrandSelector({ onChange }: BrandSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: brands } = trpc.brand.getAll.useQuery();

  return (
    <div className="mb-6">
      <label htmlFor="brand-select" className="label">
        Select Brand
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="input flex items-center justify-between w-full"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="truncate">
            {brands?.find((b: any) => b.id === '')?.name || 'Select a brand...'}
          </span>
          <ChevronDownIcon
            className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <ul className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-auto animate-slide-in">
            <li
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              All Brands
            </li>
            {brands?.map((brand: any) => (
              <li
                key={brand.id}
                onClick={() => {
                  onChange(brand.id);
                  setOpen(false);
                }}
                className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="font-medium">{brand.name}</div>
                <div className="text-xs text-gray-500">{brand.domain}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
