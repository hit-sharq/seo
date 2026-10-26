'use client';

import { trpc } from '@/lib/trpc';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/Card';
import { DocumentChartBarIcon } from '@heroicons/react/24/outline';

interface ReportsPageProps {}

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

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

  const { data: reports, isLoading } = trpc.reports.getAll.useQuery(
    { brandId: selectedBrandId || '', limit: 20 },
    { enabled: !!selectedBrandId }
  );

  const reportList = reports ?? [];

  const generateWeeklyMutation = trpc.reports.generateWeekly.useMutation();

  const handleGenerate = async (type: 'weekly' | 'monthly') => {
    if (!selectedBrandId) return;
    setGenerating(type);
    try {
      await generateWeeklyMutation.mutateAsync({ brandId: selectedBrandId });
    } catch (e) {
      // report will refresh via query
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">Generate and view weekly and monthly SEO reports.</p>
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

          <Card className="p-6 mb-6 border-blue-200 bg-blue-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleGenerate('weekly')}
                disabled={generating === 'weekly'}
                className="flex-1 btn-primary py-3"
              >
                {generating === 'weekly' ? 'Generating...' : 'Generate Weekly Report'}
              </button>
              <button
                onClick={() => handleGenerate('monthly')}
                disabled={generating === 'monthly'}
                className="flex-1 btn-primary py-3"
              >
                {generating === 'monthly' ? 'Generating...' : 'Generate Monthly Report'}
              </button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Generated At</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-3 animate-pulse"><div className="h-12 bg-gray-100 rounded w-full" /></td>
                    </tr>
                  ) : reportList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">No reports generated yet.</td>
                    </tr>
                  ) : (
                    reportList.map((report: any) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 capitalize">{report.type}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            report.status === 'ready'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono text-gray-600">
                          {report.generatedAt ? new Date(report.generatedAt).toLocaleDateString() : '—'}
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
          <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a brand</h3>
          <p className="text-sm">Choose a brand to view reports.</p>
        </div>
      )}
    </div>
  );
}
