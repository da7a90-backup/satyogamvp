'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UserGrowthChartProps {
  data: Array<{
    date: string;
    new_users: number;
    total_users: number;
  }>;
}

export default function UserGrowthChart({ data }: UserGrowthChartProps) {
  // Format data for display
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={formattedData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7D1A13" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#7D1A13" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis
          dataKey="date"
          stroke="#737373"
          style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: 12 }}
        />
        <YAxis
          stroke="#737373"
          style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: 14,
          }}
          formatter={(value: number, name: string) => {
            const label = name === 'total_users' ? 'Total Users' : 'New Users';
            return [value.toLocaleString(), label];
          }}
        />
        <Area
          type="monotone"
          dataKey="total_users"
          stroke="#7D1A13"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorUsers)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
