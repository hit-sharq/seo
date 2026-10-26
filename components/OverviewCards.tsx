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

const cardVariants: Record<string, { bg: string; text: string; glow: string; icon: string }> = {
  keywords: { bg: 'bg-primary-50', text: 'text-primary-600', glow: 'shadow-[0_0_20px_rgba(79,70,229,0.15)]', icon: 'text-primary-600' },
  position: { bg: 'bg-green-50', text: 'text-green-600', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]', icon: 'text-green-600' },
  traffic: { bg: 'bg-blue-50', text: 'text-blue-600', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]', icon: 'text-blue-600' },
  backlinks: { bg: 'bg-orange-50', text: 'text-orange-600', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]', icon: 'text-orange-600' },
};

export function OverviewCards({ brandId }: OverviewCardsProps) {
  const { data: brand } = trpc.brand.getById.useQuery({ id: brandId }, { enabled: !!brandId });
  const { data: keywords } = trpc.keyword.getAll.useQuery({
    brandId,
    limit: 100,
  }, { enabled: !!brandId });
  const { data: backlinks } = trpc.backlinks.getSummary.useQuery({ brandId }, { enabled: !!brandId });

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

  const cards = [
    {
      variant: 'keywords',
      label: 'Total Keywords',
      value: totalKeywords.toLocaleString(),
      subLabel: 'live from API',
      subValue: '',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      variant: 'position',
      label: 'Avg Position',
      value: avgPosition > 0 ? avgPosition.toFixed(1) : '—',
      subLabel: `${positionsWithData.length} keywords with positions`,
      subValue: '',
      icon: <ArrowUpIcon className="h-6 w-6" />,
    },
    {
      variant: 'traffic',
      label: 'Est. Traffic',
      value: Math.round(estTraffic).toLocaleString(),
      subLabel: 'based on volume & position',
      subValue: '',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      variant: 'backlinks',
      label: 'Backlinks',
      value: totalBacklinks.toLocaleString(),
      subLabel: `${backlinks?.new || 0} new this week`,
      subValue: '',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card) => {
        const vars = cardVariants[card.variant];
        return (
          <Card key={card.variant} className={`p-6 ${vars.bg} border ${vars.glow} hover:shadow-xl transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${vars.bg.replace('-50', '-100')} ${vars.icon}`}>
                {card.icon}
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500 flex items-center gap-1">
              {card.subLabel}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
