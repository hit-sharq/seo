'use client';

import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/Card';

interface CompetitorViewProps {
  brandId: string;
}

export function CompetitorView({ brandId }: CompetitorViewProps) {
  const { data: brand } = trpc.brand.getById.useQuery({ id: brandId });
  const { data: keywords } = trpc.keyword.getAll.useQuery({
    brandId,
    limit: 20,
  });
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
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Competitor Comparison
      </h3>

      {competitors.length === 0 ? (
        <p className="text-sm text-gray-500">
          No competitors configured for this brand.
        </p>
      ) : (
        <div className="overflow-x-auto mb-6">
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
              {competitorsLoading ? (
                competitors.map((domain) => (
                  <tr key={domain} className="animate-pulse">
                    <td className="px-4 py-3">{domain}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                    </td>
                  </tr>
                ))
              ) : (
                competitors.map((domain, i) => {
                  const overview = competitorOverviews?.[i];
                  return (
                    <tr key={domain} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {domain}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {overview?.totalKeywords?.toLocaleString() || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-green-600">
                        {overview?.estimatedTraffic?.toLocaleString() || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {overview?.topPages?.length || 0}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <h4 className="text-md font-semibold text-gray-900 mb-3">
        Our Keyword Positions
      </h4>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keyword
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volume
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
            </tr>
          </thead>
          <tbody>
            {ourKeywords.map((kw) => (
              <tr key={kw.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                  {kw.keyword}
                </td>
                <td className="px-4 py-3 text-center font-mono">
                  {kw.currentPosition !== null && kw.currentPosition !== undefined
                    ? kw.currentPosition
                    : '—'}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-600">
                  {kw.volume.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {kw.difficulty?.toFixed(1) || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
