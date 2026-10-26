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

interface PositionChartProps {
  brandId: string;
}

export function PositionChart({ brandId }: PositionChartProps) {
  const { data, isLoading } = trpc.keyword.getAggregatePositionHistory.useQuery({
    brandId,
    days: 30,
  }, { enabled: !!brandId });

  const chartData = (data || []).map((a: any) => ({
    date: format(new Date(a.date), 'MMM d'),
    avgPosition: a.avgPosition,
  }));

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
          Average Position Trend (30 days)
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 'auto']} reversed tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                }}
                formatter={(value: number) => `${value.toFixed(1)} Avg Position`}
                itemStyle={{ color: '#1f2937', fontSize: 12 }}
                labelStyle={{ color: '#6b7280', fontSize: 12 }}
              />
              <Legend verticalAlign="top" align="right" height={36} />
              <Line
                type="monotone"
                dataKey="avgPosition"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#0ea5e9' }}
                activeDot={{ r: 6 }}
                name="Avg Position"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {chartData.length > 0 && (
        <div className="mt-6 px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Latest avg position</p>
            <span className="font-semibold text-gray-900 text-lg">
              {chartData[chartData.length - 1].avgPosition.toFixed(1)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
