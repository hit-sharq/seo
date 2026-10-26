'use client';

import { trpc } from '@/lib/trpc';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/Card';
import { DocumentChartBarIcon } from '@heroicons/react/24/outline';

interface ContentPageProps {}

export default function ContentPage() {
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

  const { data: pages, isLoading } = trpc.content.getAll.useQuery(
    { brandId: selectedBrandId || '', limit: 50 },
    { enabled: !!selectedBrandId }
  );
  const { data: opportunities } = trpc.content.getOptimizationOpportunities.useQuery(
    { brandId: selectedBrandId || '' },
    { enabled: !!selectedBrandId }
  );

  const pageList = pages?.pages || [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Optimization</h1>
        <p className="text-gray-600">Manage content pages and optimization opportunities.</p>
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

          <Card className="p-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Content Pages</h3>
                <p className="text-sm text-gray-500">{pageList.length} pages tracked</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Keyword</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Word Count</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 animate-pulse"><div className="h-12 bg-gray-100 rounded w-full" /></td>
                    </tr>
                  ) : pageList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No content pages found.</td>
                    </tr>
                  ) : (
                    pageList.map((page: any) => (
                      <tr key={page.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{page.url}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{page.targetKeyword}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono text-gray-600">{page.wordCount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono">
                          {(page.optimizationScore ?? 0).toFixed(0)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            page.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : page.status === 'draft'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {page.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {opportunities?.length && opportunities.length > 0 && (
            <Card className="p-6 mt-6 border-orange-200 bg-orange-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="h-5 w-5 text-orange-600">!</span>
                Optimization Opportunities
              </h3>
              <p className="text-sm text-orange-700 mb-4">
                {opportunities.length} pages with optimization score below 70.
              </p>
              <ul className="space-y-2">
                {opportunities.slice(0, 10).map((page: any) => (
                  <li key={page.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 max-w-xs truncate">{page.title || page.url}</span>
                    <span className="text-gray-600 font-mono">Score: {(page.optimizationScore ?? 0).toFixed(0)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a brand</h3>
          <p className="text-sm">Choose a brand to view content optimization.</p>
        </div>
      )}
    </div>
  );
}
