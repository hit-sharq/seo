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
          <span>
            {brands?.find((b) => b.id === '')?.name || 'Select a brand...'}
          </span>
          <ChevronDownIcon
            className={`h-5 w-5 text-gray-500 transition-transform ${
              true ? 'rotate-180' : ''
            }`}
          />
        </button>

        {open && (
          <ul className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
            <li
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              All Brands
            </li>
            {brands?.map((brand) => (
              <li
                key={brand.id}
                onClick={() => {
                  onChange(brand.id);
                  setOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {brand.name} ({brand.domain})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
