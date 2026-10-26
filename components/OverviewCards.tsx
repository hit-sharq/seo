'use client';

import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/Card';
import { ArrowUpIcon } from '@heroicons/react/24/outline';

interface OverviewCardsProps {
  brandId: string;
}

function estimateTraffic(volume: number, position: number | null): number {
  if (!position || position <= 0) return 0;
  const ctrByPosition: Record<number, number> = {
    1: 0.285, 2: 0.157, 3: 0.11, 4: 0.08, 5: 0.07,
    6: 0.05, 7: 0.04, 8: 0.035, 9: 0.03, 10: 0.025,
  };
  if (position > 10) return 0;
  return volume * (ctrByPosition[position] || 0);
}

export function OverviewCards({ brandId }: OverviewCardsProps) {
  const { data: brand } = trpc.brand.getById.useQuery({ id: brandId });
  const { data: keywords } = trpc.keyword.getAll.useQuery({
    brandId,
    limit: 100,
  });
  const { data: backlinks } = trpc.backlinks.getSummary.useQuery({ brandId });

  const totalKeywords = brand?._count.keywords || 0;
  const totalBacklinks = backlinks?.total || 0;

  const kwList = keywords?.keywords || [];
  const positionsWithData = kwList.filter(
    (k: any) => k.currentPosition !== null && k.currentPosition !== undefined
  );
  const avgPosition =
    positionsWithData.length > 0
      ? positionsWithData.reduce((sum: number, k: any) => sum + (k.currentPosition || 0), 0) /
        positionsWithData.length
      : 0;

  const estTraffic =
    kwList.reduce((sum: number, k: any) => sum + estimateTraffic(k.volume, k.currentPosition), 0) || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Keywords</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {totalKeywords.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
        </div>
        <p className="mt-2 text-sm text-green-600 flex items-center">
          <span className="mr-1">live</span> from API
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Avg Position</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {avgPosition > 0 ? avgPosition.toFixed(1) : '—'}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7 7v18"
              />
            </svg>
          </div>
        </div>
        <p className="mt-2 text-sm text-green-600 flex items-center">
          <ArrowUpIcon className="h-4 w-4 mr-1" />
          {positionsWithData.length} keywords with positions
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Est. Traffic</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {Math.round(estTraffic).toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full text-purple-600">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>
        <p className="mt-2 text-sm text-green-600 flex items-center">
          <span className="mr-1">based on volume & position</span>
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Backlinks</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {totalBacklinks.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-orange-100 rounded-full text-orange-600">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
        </div>
        <p className="mt-2 text-sm text-green-600 flex items-center">
          <span className="mr-1">{backlinks?.new || 0}</span> new this week
        </p>
      </Card>
    </div>
  );
}
