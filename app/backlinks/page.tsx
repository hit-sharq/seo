'use client';

import { trpc } from '@/lib/trpc';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/Card';
import { LinkIcon } from '@heroicons/react/24/outline';

interface BacklinksPageProps {}

export default function BacklinksPage() {
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

  const { data: summary } = trpc.backlinks.getSummary.useQuery(
    { brandId: selectedBrandId || '' },
    { enabled: !!selectedBrandId }
  );
  const { data: backlinks, isLoading } = trpc.backlinks.getAll.useQuery(
    { brandId: selectedBrandId || '', limit: 20 },
    { enabled: !!selectedBrandId }
  );

  const backlinkList = backlinks?.backlinks || [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Backlink Audit</h1>
        <p className="text-gray-600">Monitor new, lost, and toxic backlinks.</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Backlinks</p>
                <p className="text-2xl font-bold text-gray-900">{summary?.total?.toLocaleString() || 0}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs font-medium text-green-600 uppercase tracking-wider mb-1">New This Week</p>
                <p className="text-2xl font-bold text-green-600">{summary?.new?.toLocaleString() || 0}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-xs font-medium text-red-600 uppercase tracking-wider mb-1">Lost</p>
                <p className="text-2xl font-bold text-red-600">{summary?.lost?.toLocaleString() || 0}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-xs font-medium text-orange-600 uppercase tracking-wider mb-1">Toxic</p>
                <p className="text-2xl font-bold text-orange-600">{summary?.toxic?.toLocaleString() || 0}</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Backlinks</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source URL</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target URL</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Domain Rating</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Toxicity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 animate-pulse"><div className="h-12 bg-gray-100 rounded w-full" /></td>
                    </tr>
                  ) : backlinkList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No backlinks found.</td>
                    </tr>
                  ) : (
                    backlinkList.map((bl: any) => (
                      <tr key={bl.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{bl.sourceUrl}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{bl.targetUrl}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono text-gray-600">{bl.domainRating}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono">
                          {bl.toxicityScore >= 50 ? (
                            <span className="text-red-600">{bl.toxicityScore.toFixed(0)}</span>
                          ) : (
                            <span className="text-green-600">{bl.toxicityScore.toFixed(0)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {bl.isNew ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">New</span>
                          ) : bl.isLost ? (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Lost</span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Active</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <LinkIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a brand</h3>
          <p className="text-sm">Choose a brand to view backlink audit.</p>
        </div>
      )}
    </div>
  );
}
