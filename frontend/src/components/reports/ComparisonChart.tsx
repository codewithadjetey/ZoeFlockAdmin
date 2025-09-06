import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';

interface ComparisonChartProps {
  data: Array<{
    month: string;
    income: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  }>;
  type: 'line' | 'area' | 'bar' | 'stacked' | 'waterfall';
  height?: number;
}

const COLORS = {
  income: '#10B981',
  expenses: '#EF4444',
  profit: '#3B82F6',
  profitMargin: '#8B5CF6'
};

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ 
  data, 
  type = 'line', 
  height = 400 
}) => {
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'profitMargin' ? formatPercentage(value) : formatCurrency(value), 
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke={COLORS.income} 
              strokeWidth={3}
              dot={{ fill: COLORS.income, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: COLORS.income, strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke={COLORS.expenses} 
              strokeWidth={3}
              dot={{ fill: COLORS.expenses, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: COLORS.expenses, strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke={COLORS.profit} 
              strokeWidth={3}
              dot={{ fill: COLORS.profit, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: COLORS.profit, strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'profitMargin' ? formatPercentage(value) : formatCurrency(value), 
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="income" 
              stackId="1"
              stroke={COLORS.income} 
              fill={COLORS.income}
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="expenses" 
              stackId="1"
              stroke={COLORS.expenses} 
              fill={COLORS.expenses}
              fillOpacity={0.6}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'profitMargin' ? formatPercentage(value) : formatCurrency(value), 
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Bar dataKey="income" fill={COLORS.income} radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill={COLORS.expenses} radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" fill={COLORS.profit} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'stacked':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'profitMargin' ? formatPercentage(value) : formatCurrency(value), 
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Bar dataKey="income" stackId="a" fill={COLORS.income} radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" stackId="a" fill={COLORS.expenses} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'waterfall':
        // Create waterfall chart data
        const waterfallData = data.map((item, index) => ({
          month: item.month,
          income: item.income,
          expenses: -item.expenses, // Negative for waterfall effect
          profit: item.profit,
          profitMargin: item.profitMargin
        }));

        return (
          <ComposedChart data={waterfallData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'profitMargin' ? formatPercentage(value) : formatCurrency(Math.abs(value)), 
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Bar dataKey="income" fill={COLORS.income} radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill={COLORS.expenses} radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" fill={COLORS.profit} radius={[4, 4, 0, 0]} />
          </ComposedChart>
        );

      default:
        return null;
    }
  };

  const chartElement = renderChart();
  
  if (!chartElement) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">No chart data available</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {chartElement}
      </ResponsiveContainer>
    </div>
  );
}; 