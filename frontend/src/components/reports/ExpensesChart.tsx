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
    utilities: number;
    maintenance: number;
    office: number;
    events: number;
    tech: number;
    total: number;
  }>;
  budgetData?: Array<{
    month: string;
    budget: number;
    actual: number;
  }>;
  type: 'line' | 'area' | 'bar' | 'stacked' | 'budget-comparison';
  height?: number;
}

const COLORS = ['#EF4444', '#F97316', '#EAB308', '#8B5CF6', '#06B6D4'];

export const ExpensesChart: React.FC<ExpensesChartProps> = ({ 
  data, 
  budgetData,
  type = 'line', 
  height = 400 
}) => {
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

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
            <Line 
              type="monotone" 
              dataKey="utilities" 
              stroke="#EF4444" 
              strokeWidth={3}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="maintenance" 
              stroke="#F97316" 
              strokeWidth={3}
              dot={{ fill: '#F97316', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#F97316', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="office" 
              stroke="#EAB308" 
              strokeWidth={3}
              dot={{ fill: '#EAB308', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#EAB308', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="events" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="tech" 
              stroke="#06B6D4" 
              strokeWidth={3}
              dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#06B6D4', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#F59E0B" 
              strokeWidth={4}
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#F59E0B', strokeWidth: 2 }}
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
            <Area 
              type="monotone" 
              dataKey="utilities" 
              stackId="1"
              stroke="#EF4444" 
              fill="#EF4444"
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="maintenance" 
              stackId="1"
              stroke="#F97316" 
              fill="#F97316"
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="office" 
              stackId="1"
              stroke="#EAB308" 
              fill="#EAB308"
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="events" 
              stackId="1"
              stroke="#8B5CF6" 
              fill="#8B5CF6"
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="tech" 
              stackId="1"
              stroke="#06B6D4" 
              fill="#06B6D4"
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
            <Bar dataKey="utilities" fill="#EF4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="maintenance" fill="#F97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="office" fill="#EAB308" radius={[4, 4, 0, 0]} />
            <Bar dataKey="events" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="tech" fill="#06B6D4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="total" fill="#F59E0B" radius={[4, 4, 0, 0]} />
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
            <Bar dataKey="utilities" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="maintenance" stackId="a" fill="#F97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="office" stackId="a" fill="#EAB308" radius={[4, 4, 0, 0]} />
            <Bar dataKey="events" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="tech" stackId="a" fill="#06B6D4" radius={[4, 4, 0, 0]} />
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

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}; 