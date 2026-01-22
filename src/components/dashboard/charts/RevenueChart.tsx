'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
  }>;
}

export default function RevenueChart({ data }: RevenueChartProps) {
  // Format data for display
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={formattedData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis
          dataKey="date"
          stroke="#737373"
          style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: 12 }}
        />
        <YAxis
          stroke="#737373"
          style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: 12 }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: 14,
          }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#7D1A13"
          strokeWidth={2}
          dot={{ fill: '#7D1A13', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
