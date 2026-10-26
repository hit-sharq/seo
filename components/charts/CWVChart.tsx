'use client';

import { trpc } from '@/lib/trpc';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { format } from 'date-fns';

interface CWVChartProps {
  brandId: string;
}

export function CWVChart({ brandId }: CWVChartProps) {
  const { data, isLoading } = trpc.technical.getCWVTrends.useQuery({
    brandId,
    days: 30,
  }, { enabled: !!brandId });

  const chartData = (data || []).map((a: any) => ({
    date: format(new Date(a.date), 'MMM d'),
    lcp: a.lcp,
    inp: a.inp,
    cls: a.cls,
  }));

  const latest = chartData.length > 0 ? chartData[chartData.length - 1] : null;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse h-80 bg-gray-100 rounded-xl" />
      </Card>
    );
  }

  return (
    <Card className="p-6 border overflow-hidden">
      <div className="p-0">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 px-6">
          Core Web Vitals Trend (30 days)
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 'auto']} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                }}
                itemStyle={{ color: '#1f2937', fontSize: 12 }}
                labelStyle={{ color: '#6b7280', fontSize: 12 }}
              />
              <Legend verticalAlign="top" align="right" height={36} />
              <Line
                type="monotone"
                dataKey="lcp"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#ef4444' }}
                activeDot={{ r: 6 }}
                name="LCP (s)"
              />
              <Line
                type="monotone"
                dataKey="inp"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#0ea5e9' }}
                activeDot={{ r: 6 }}
                name="INP (ms)"
                yAxisId="right"
              />
              <Line
                type="monotone"
                dataKey="cls"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#22c55e' }}
                activeDot={{ r: 6 }}
                name="CLS"
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4 px-6">
        {latest ? (
          <>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">LCP</p>
              <p className="text-2xl font-bold text-red-600">{latest.lcp.toFixed(1)}s</p>
              <p className="text-xs text-gray-500">Good {'<'} 2.5s</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">INP</p>
              <p className="text-2xl font-bold text-blue-600">{Math.round(latest.inp)}ms</p>
              <p className="text-xs text-gray-500">Good {'<'} 200ms</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">CLS</p>
              <p className="text-2xl font-bold text-green-600">{latest.cls.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Good {'<'} 0.1</p>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">LCP</p>
              <p className="text-2xl font-bold text-red-600">—</p>
              <p className="text-xs text-gray-500">Good {'<'} 2.5s</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">INP</p>
              <p className="text-2xl font-bold text-blue-600">—</p>
              <p className="text-xs text-gray-500">Good {'<'} 200ms</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">CLS</p>
              <p className="text-2xl font-bold text-green-600">—</p>
              <p className="text-xs text-gray-500">Good {'<'} 0.1</p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
