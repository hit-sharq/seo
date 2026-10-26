'use client';

import { trpc } from '@/lib/trpc';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

interface TechnicalPageProps {}

export default function TechnicalPage() {
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

  const { data: audit } = trpc.technical.getLatestAudit.useQuery(
    { brandId: selectedBrandId || '' },
    { enabled: !!selectedBrandId }
  );
  const { data: cwvTrends, isLoading } = trpc.technical.getCWVTrends.useQuery(
    { brandId: selectedBrandId || '', days: 30 },
    { enabled: !!selectedBrandId }
  );
  const { data: crawlErrors } = trpc.technical.getCrawlErrors.useQuery(
    { brandId: selectedBrandId || '', limit: 10 },
    { enabled: !!selectedBrandId }
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Technical Audit</h1>
        <p className="text-gray-600">Core Web Vitals, crawl errors, and indexation.</p>
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

          <Card className="p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Latest Technical Audit</h3>
                <p className="text-sm text-gray-500">
                  {audit?.checkedAt ? new Date(audit.checkedAt).toLocaleDateString() : 'No audit run yet'}
                </p>
              </div>
              <button className="btn-primary hidden sm:block">Run Audit</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Performance Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {audit?.performanceScore?.toFixed(0) ?? '—'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">LCP</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(audit?.lcp ?? 0).toFixed(1)}s
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">INP</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(audit?.inp ?? 0)}ms
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">CLS</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(audit?.cls ?? 0).toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">TTFB</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(audit?.ttfb ?? 0).toFixed(0)}ms
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Indexation Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(audit?.indexationRate ?? 0).toFixed(0)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crawl Errors</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error Type</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-3 animate-pulse"><div className="h-12 bg-gray-100 rounded w-full" /></td>
                    </tr>
                  ) : (crawlErrors ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">No crawl errors found.</td>
                    </tr>
                    ) : (
                      (crawlErrors ?? []).map((err: any) => (
                      <tr key={err.url} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{err.url}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono text-gray-600">{err.statusCode ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{err.errorType ?? '—'}</td>
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
          <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a brand</h3>
          <p className="text-sm">Choose a brand to view technical audit.</p>
        </div>
      )}
    </div>
  );
}
