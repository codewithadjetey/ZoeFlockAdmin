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

interface ExpensesChartProps {
  data: Array<{
    month: string;
    [key: string]: number | string;
  }>;
  budgetData?: Array<{
    month: string;
    budget: number;
    actual: number;
  }>;
  type: 'line' | 'area' | 'bar' | 'stacked' | 'budget-comparison';
  height?: number;
  categories?: string[];
  showTotal?: boolean;
}

const COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#84CC16', // Lime
  '#6366F1'  // Indigo
];

export const ExpensesChart: React.FC<ExpensesChartProps> = ({ 
  data, 
  budgetData,
  type = 'line', 
  height = 400,
  categories,
  showTotal = true
}) => {
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  // Extract categories from data if not provided
  const chartCategories = categories || 
    (data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'month' && key !== 'total') : []);

  // Filter out 'total' from categories if showTotal is false
  const displayCategories = showTotal ? chartCategories : chartCategories.filter(cat => cat !== 'total');



  // Add safety check for empty data
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

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
              formatter={(value: number) => [formatCurrency(value), 'Amount']}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            {displayCategories.map((category, index) => (
              <Line 
                key={category}
                type="monotone" 
                dataKey={category} 
                stroke={COLORS[index % COLORS.length]} 
                strokeWidth={category === 'total' ? 4 : 3}
                dot={{ 
                  fill: COLORS[index % COLORS.length], 
                  strokeWidth: 2, 
                  r: category === 'total' ? 5 : 4 
                }}
                activeDot={{ 
                  r: category === 'total' ? 7 : 6, 
                  stroke: COLORS[index % COLORS.length], 
                  strokeWidth: 2 
                }}
              />
            ))}
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
              formatter={(value: number) => [formatCurrency(value), 'Amount']}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            {displayCategories.map((category, index) => (
              <Area 
                key={category}
                type="monotone" 
                dataKey={category} 
                stackId="1"
                stroke={COLORS[index % COLORS.length]} 
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.6}
              />
            ))}
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
              formatter={(value: number) => [formatCurrency(value), 'Amount']}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            {displayCategories.map((category, index) => (
              <Bar 
                key={category}
                dataKey={category} 
                fill={COLORS[index % COLORS.length]} 
                radius={[4, 4, 0, 0]} 
              />
            ))}
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
              formatter={(value: number) => [formatCurrency(value), 'Amount']}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            {displayCategories.filter(cat => cat !== 'total').map((category, index) => (
              <Bar 
                key={category}
                dataKey={category} 
                stackId="a" 
                fill={COLORS[index % COLORS.length]} 
                radius={[4, 4, 0, 0]} 
              />
            ))}
          </BarChart>
        );

      case 'budget-comparison':
        if (!budgetData) return null;
        return (
          <ComposedChart data={budgetData}>
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
              formatter={(value: number) => [formatCurrency(value), 'Amount']}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Bar 
              dataKey="budget" 
              fill="#10B981" 
              radius={[4, 4, 0, 0]}
              fillOpacity={0.7}
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#EF4444" 
              strokeWidth={3}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
            />
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
        <p className="text-gray-500">No data available for this chart type</p>
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