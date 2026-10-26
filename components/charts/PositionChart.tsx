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
  });

  const chartData = (data || []).map((a: any) => ({
    date: format(new Date(a.date), 'MMM d'),
    avgPosition: a.avgPosition,
  }));

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
        Average Position Trend (30 days)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 'auto']} reversed />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [value.toFixed(1), 'Avg Position']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="avgPosition"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name="Avg Position"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {chartData.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Latest avg position:
            <span className="font-medium text-gray-900">
              {(chartData[chartData.length - 1].avgPosition ?? 0).toFixed(1)}
            </span>
          </p>
        </div>
      )}
    </Card>
  );
}
