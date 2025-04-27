import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SpecialtyDistributionChart = ({ specialtyData }) => {
  if (!specialtyData || !specialtyData.length) {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-4">
        <p className="text-[var(--text-500)]">No specialty distribution data available</p>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = specialtyData.map(specialty => ({
    name: specialty._id,
    value: specialty.count
  }));

  // Generate colors for each specialty
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold mb-4 text-[var(--text-900)] dark:text-[var(--text-100)]">
        Appointments by Specialty
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [value, 'Appointments']}
            contentStyle={{ 
              backgroundColor: 'var(--background-50)',
              borderColor: 'var(--background-300)',
              color: 'var(--text-900)'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpecialtyDistributionChart; 