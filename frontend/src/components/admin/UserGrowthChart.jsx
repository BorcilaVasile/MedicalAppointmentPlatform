import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const UserGrowthChart = ({ userStats }) => {
  if (!userStats || !userStats.growthData || userStats.growthData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-4">
        <p className="text-[var(--text-500)]">No user growth data available</p>
      </div>
    );
  }

  // Sort data by date
  const chartData = [...userStats.growthData]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(item => ({
      name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Users: item.count
    }));

  return (
    <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold mb-4 text-[var(--text-900)] dark:text-[var(--text-100)]">
        User Growth Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--background-300)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'var(--text-700)' }}
          />
          <YAxis 
            tick={{ fill: 'var(--text-700)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--background-50)',
              borderColor: 'var(--background-300)',
              color: 'var(--text-900)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Users" 
            stroke="var(--secondary-500)" 
            strokeWidth={2} 
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserGrowthChart; 