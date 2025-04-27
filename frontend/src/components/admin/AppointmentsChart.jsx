import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const AppointmentsChart = ({ appointmentData }) => {

  let chartData = [];

  try {
    if (appointmentData && Array.isArray(appointmentData.byStatus)) {
      chartData = appointmentData.byStatus
        .filter(item => item && typeof item.status === 'string' && typeof item.count === 'number') // filtrăm corect
        .map(item => ({
          name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
          appointments: item.count,
        }));
    }
  } catch (error) {
    console.error('Error processing appointmentData:', error);
  }

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-4">
        <p className="text-[var(--text-500)]">No appointment data available</p>
      </div>
    );
  }

  const colors = {
    pending: '#FFC107',
    confirmed: '#4CAF50',
    completed: '#2196F3',
    cancelled: '#F44336',
  };

  return (
    <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold mb-4 text-[var(--text-900)] dark:text-[var(--text-100)]">
        Appointments by Status
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--background-300)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-700)' }} />
          <YAxis tick={{ fill: 'var(--text-700)' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background-50)',
              borderColor: 'var(--background-300)',
              color: 'var(--text-900)',
            }}
          />
          <Legend />
          <Bar dataKey="appointments" name="Appointments" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[entry.name.toLowerCase()] || '#777777'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AppointmentsChart;
