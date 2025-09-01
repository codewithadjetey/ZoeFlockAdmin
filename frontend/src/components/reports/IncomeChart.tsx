import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface IncomeChartProps {
  data: Array<{
    month: string;
    tithes: number;
    offerings: number;
    partnerships: number;
    total: number;
  }>;
  type: 'line' | 'area' | 'bar';
  height?: number;
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

export const IncomeChart: React.FC<IncomeChartProps> = ({ 
  data, 
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
            {/* <Line 
              type="monotone" 
              dataKey="tithes" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
            /> */}
            {/* <Line 
              type="monotone" 
              dataKey="offerings" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
            /> */}
            {/* <Line 
              type="monotone" 
              dataKey="partnerships" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
            /> */}
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
            {/* <Area 
              type="monotone" 
              dataKey="tithes" 
              stackId="1"
              stroke="#10B981" 
              fill="#10B981"
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="offerings" 
              stackId="1"
              stroke="#3B82F6" 
              fill="#3B82F6"
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="partnerships" 
              stackId="1"
              stroke="#8B5CF6" 
              fill="#8B5CF6"
              fillOpacity={0.6}
            /> */}
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="#F59E0B" 
              fill="#F59E0B"
              fillOpacity={0.3}
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
            {/* <Bar dataKey="tithes" fill="#10B981" radius={[4, 4, 0, 0]} /> */}
            {/* <Bar dataKey="offerings" fill="#3B82F6" radius={[4, 4, 0, 0]} /> */}
            {/* <Bar dataKey="partnerships" fill="#8B5CF6" radius={[4, 4, 0, 0]} /> */}
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
            {/* <Bar dataKey="tithes" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} /> */}
            {/* <Bar dataKey="offerings" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} /> */}
            {/* <Bar dataKey="partnerships" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} /> */}
            <Bar dataKey="offerings" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="partnerships" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
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