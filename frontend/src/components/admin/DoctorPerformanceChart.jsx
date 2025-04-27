import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DoctorPerformanceChart = ({ doctorsData }) => {
  if (!doctorsData || !doctorsData.length) {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-4">
        <p className="text-[var(--text-500)]">No doctor performance data available</p>
      </div>
    );
  }

  console.log('Doctors data: ', doctorsData);
  // Transform data for the chart
  const chartData = doctorsData.map(doctor => ({
    name: doctor.name, // First name only to save space
    Appointments: doctor.appointmentCount,
    Rating: parseFloat(doctor.averageRating) * 20 // Scale rating (1-5) to be visible on same chart as appointments
  }));

  return (
    <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold mb-4 text-[var(--text-900)] dark:text-[var(--text-100)]">
        Top Doctors Performance
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barGap={0}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--background-300)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'var(--text-700)' }}
          />
          <YAxis 
            yAxisId="left"
            orientation="left"
            tick={{ fill: 'var(--text-700)' }}
            label={{ value: 'Appointments', angle: -90, position: 'insideLeft', fill: 'var(--text-700)' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fill: 'var(--text-700)' }}
            label={{ value: 'Rating (x20)', angle: 90, position: 'insideRight', fill: 'var(--text-700)' }}
            domain={[0, 100]} // 5 * 20 = 100 max
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--background-50)',
              borderColor: 'var(--background-300)',
              color: 'var(--text-900)'
            }}
            formatter={(value, name) => {
              if (name === 'Rating') {
                return [(value / 20).toFixed(1), 'Rating']; // Convert back to 1-5 scale
              }
              return [value, name];
            }}
          />
          <Legend />
          <Bar 
            yAxisId="left"
            dataKey="Appointments" 
            fill="var(--primary-500)" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            yAxisId="right"
            dataKey="Rating" 
            fill="var(--secondary-500)" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DoctorPerformanceChart; 