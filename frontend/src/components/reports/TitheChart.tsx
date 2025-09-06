'use client';

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
} from 'recharts';

interface TitheChartProps {
  data: any[];
  type: 'line' | 'bar' | 'pie';
  title: string;
  height?: number;
  colors?: string[];
}

const TitheChart: React.FC<TitheChartProps> = ({
  data,
  type,
  title,
  height = 400,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTooltip = (value: any, name: string) => {
    if (name.includes('amount') || name.includes('Amount')) {
      return [formatCurrency(value), name];
    }
    return [value, name];
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={formatTooltip} />
            <Legend />
            <Line
              type="monotone"
              dataKey="total_amount"
              stroke="#3B82F6"
              strokeWidth={3}
              name="Total Amount"
            />
            <Line
              type="monotone"
              dataKey="total_paid"
              stroke="#10B981"
              strokeWidth={3}
              name="Total Paid"
            />
            <Line
              type="monotone"
              dataKey="total_outstanding"
              stroke="#F59E0B"
              strokeWidth={3}
              name="Total Outstanding"
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={formatTooltip} />
            <Legend />
            <Bar dataKey="total_amount" fill="#3B82F6" name="Total Amount" />
            <Bar dataKey="total_paid" fill="#10B981" name="Total Paid" />
            <Bar dataKey="total_outstanding" fill="#F59E0B" name="Total Outstanding" />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={formatTooltip} />
            <Legend />
          </PieChart>
        );

      default:
        return null;
    }
  };

  const chartElement = renderChart();
  
  if (!chartElement) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-gray-500">No chart data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {chartElement}
      </ResponsiveContainer>
    </div>
  );
};

export default TitheChart; 