'use client';

import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/Card';

interface CompetitorViewProps {
  brandId: string;
  className?: string;
}

export function CompetitorView({ brandId, className }: CompetitorViewProps) {
  const { data: brand } = trpc.brand.getById.useQuery({ id: brandId }, { enabled: !!brandId });
  const { data: keywords } = trpc.keyword.getAll.useQuery({
    brandId,
    limit: 20,
  }, { enabled: !!brandId });
  const { data: competitorOverviews, isLoading: competitorsLoading } =
    trpc.brand.getCompetitorsOverview.useQuery(
      {
        brandId,
        competitorDomains: brand?.competitors || [],
      },
      {
        enabled: !!brand?.competitors?.length,
      }
    );

  const competitors = brand?.competitors || [];
  const ourKeywords = keywords?.keywords || [];

  return (
    <Card className={`p-0 border overflow-hidden ${className || ''}`}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Competitor Comparison</h3>
      </div>

      {competitors.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500">No competitors configured for this brand.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border-b border-gray-200">
          <table className="table">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Competitor
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Keywords
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Est. Traffic
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Top Pages
                </th>
              </tr>
            </thead>
            <tbody>
              {competitorsLoading ? (
                competitors.map((domain: string) => (
                  <tr key={domain} className="animate-pulse">
                    <td className="px-6 py-4">{domain}</td>
                    <td className="px-6 py-4 text-right"><div className="h-5 bg-gray-100 rounded w-1/3" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-5 bg-gray-100 rounded w-1/3" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-5 bg-gray-100 rounded w-1/3" /></td>
                  </tr>
                ))
              ) : (
                competitors.map((domain: string, i: number) => {
                  const overview = competitorOverviews?.[i];
                  return (
                    <tr key={domain} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{domain}</td>
                      <td className="px-6 py-4 text-right font-mono text-gray-900">
                        {overview?.totalKeywords?.toLocaleString() || '—'}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-green-600">
                        {overview?.estimatedTraffic?.toLocaleString() || '—'}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-gray-600">
                        {overview?.topPages?.length || 0}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Our Keyword Positions</h4>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Keyword
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                </tr>
              </thead>
              <tbody>
                {ourKeywords.map((kw: any) => (
                  <tr key={kw.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">
                      {kw.keyword}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-gray-900">
                      {kw.currentPosition !== null && kw.currentPosition !== undefined
                        ? kw.currentPosition
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-gray-600">
                      {(kw.volume ?? 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {kw.difficulty?.toFixed(1) || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}
    </Card>
  );
}
