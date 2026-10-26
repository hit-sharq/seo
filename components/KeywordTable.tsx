'use client';

import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell, Badge } from '@/components/ui/Card';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline';

interface KeywordTableProps {
  brandId: string;
}

export function KeywordTable({ brandId }: KeywordTableProps) {
  const { data, isLoading } = trpc.keyword.getAll.useQuery({
    brandId,
    limit: 20,
  });

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-1/4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i: number) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const keywords = data?.keywords || [];

  return (
    <div className="card">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Top Keywords</h3>
        <span className="text-sm text-gray-500">{keywords.length} keywords tracked</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Keyword</TableHeaderCell>
            <TableHeaderCell className="text-right">Position</TableHeaderCell>
            <TableHeaderCell className="text-right">Change</TableHeaderCell>
            <TableHeaderCell className="text-right">Volume</TableHeaderCell>
            <TableHeaderCell className="text-right">Difficulty</TableHeaderCell>
            <TableHeaderCell>Intent</TableHeaderCell>
            <TableHeaderCell>URL</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keywords.map((kw: any) => {
            const currentPos = kw.currentPosition;
            const prevPos = kw.previousPosition;
            let changeIcon = null;
            let changeClass = 'text-gray-500';

            if (currentPos && prevPos) {
              if (currentPos < prevPos) {
                changeIcon = <ArrowUpIcon className="h-4 w-4" />;
                changeClass = 'text-green-600';
              } else if (currentPos > prevPos) {
                changeIcon = <ArrowDownIcon className="h-4 w-4" />;
                changeClass = 'text-red-600';
              } else {
                changeIcon = <MinusIcon className="h-4 w-4" />;
                changeClass = 'text-gray-500';
              }
            }

            return (
              <TableRow key={kw.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-900 max-w-xs truncate">
                  {kw.keyword}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {currentPos ? currentPos : <span className="text-gray-400">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  <span className={`${changeClass} items-center justify-end gap-1`}>
                    {changeIcon}
                    {currentPos && prevPos && Math.abs(currentPos - prevPos)}
                  </span>
                </TableCell>
                <TableCell className="text-right text-gray-600 font-mono">
                  {kw.volume.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-gray-600">
                  {kw.difficulty?.toFixed(1) || '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={kw.intent === 'commercial' ? 'success' : kw.intent === 'transactional' ? 'warning' : 'info'}>
                    {kw.intent}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500 text-sm max-w-xs truncate">
                  {kw.targetUrl || '—'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
