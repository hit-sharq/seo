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
  });

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
        <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Core Web Vitals Trend (30 days)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="lcp"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name="LCP (s)"
            />
            <Line
              type="monotone"
              dataKey="inp"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name="INP (ms)"
              yAxisId="right"
            />
            <Line
              type="monotone"
              dataKey="cls"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name="CLS"
              yAxisId="right"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        {latest ? (
          <>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {(latest?.lcp ?? 0).toFixed(1)}s
              </p>
              <p className="text-xs text-gray-500">LCP (Good {'<'} 2.5s)</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(latest?.inp ?? 0)}ms
              </p>
              <p className="text-xs text-gray-500">INP (Good {'<'} 200ms)</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {(latest?.cls ?? 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">CLS (Good {'<'} 0.1)</p>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">—</p>
              <p className="text-xs text-gray-500">LCP (Good {'<'} 2.5s)</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">—</p>
              <p className="text-xs text-gray-500">INP (Good {'<'} 200ms)</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">—</p>
              <p className="text-xs text-gray-500">CLS (Good {'<'} 0.1)</p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
