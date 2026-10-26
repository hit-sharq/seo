'use client';

import { trpc } from '@/lib/trpc';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/Card';
import { ArrowUpIcon, ArrowDownIcon, ChartBarIcon, MinusIcon } from '@heroicons/react/24/outline';

interface CompetitorsPageProps {}

export default function CompetitorsPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />
      </div>
    );
  }

  const { data: brand } = trpc.brand.getById.useQuery({ id: selectedBrandId || '' }, { enabled: !!selectedBrandId });
  const { data: competitors, isLoading } =
    trpc.brand.getCompetitorsOverview.useQuery(
      { brandId: selectedBrandId || '', competitorDomains: brand?.competitors || [] },
      { enabled: !!selectedBrandId && (brand?.competitors?.length ?? 0) > 0 }
    );

  const competitorsList = brand?.competitors || [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Competitor Analysis</h1>
        <p className="text-gray-600">Compare your SEO performance against competitors.</p>
      </div>

      {selectedBrandId ? (
        <>
          <div className="mb-6">
            <label htmlFor="brand-select" className="label">
              Select Brand
            </label>
            <select
              id="brand-select"
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="input w-full"
            >
              <option value="">Select a brand...</option>
            </select>
          </div>

          {competitorsList.length === 0 ? (
            <Card className="p-6">
              <p className="text-sm text-gray-500">
                No competitors configured for this brand.
              </p>
            </Card>
          ) : (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Competitor Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Competitor
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Keywords
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Est. Traffic
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Top Pages
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      competitorsList.map((domain: string) => (
                        <tr key={domain} className="animate-pulse">
                          <td className="px-4 py-3">{domain}</td>
                          <td className="px-4 py-3 text-right"><div className="h-4 bg-gray-100 rounded w-1/2" /></td>
                          <td className="px-4 py-3 text-right"><div className="h-4 bg-gray-100 rounded w-1/2" /></td>
                          <td className="px-4 py-3 text-right"><div className="h-4 bg-gray-100 rounded w-1/2" /></td>
                        </tr>
                      ))
                    ) : (
                      (competitors ?? []).map((overview: any, i: number) => (
                        <tr key={competitorsList[i]} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{competitorsList[i]}</td>
                          <td className="px-4 py-3 text-right font-mono">{overview?.totalKeywords?.toLocaleString() || '—'}</td>
                          <td className="px-4 py-3 text-right font-mono text-green-600">{overview?.estimatedTraffic?.toLocaleString() || '—'}</td>
                          <td className="px-4 py-3 text-right font-mono">{overview?.topPages?.length || 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a brand</h3>
          <p className="text-sm">Choose a brand to view competitor analysis.</p>
        </div>
      )}
    </div>
  );
}
