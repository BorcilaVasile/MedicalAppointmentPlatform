import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaUserMd, FaHospital, FaPlus, FaChartLine, FaStar, FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa';
import UsersList from '../components/admin/UsersList';
import DoctorsList from '../components/admin/DoctorsList';
import ClinicsList from '../components/admin/ClinicsList';
import AddDoctorModal from '../components/admin/AddDoctorModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [doctorStats, setDoctorStats] = useState(null);
  const [activityStats, setActivityStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const { token, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
    fetchDoctorStats();
    fetchActivityStats();
  }, [userRole, navigate]);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchDoctorStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats/doctors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch doctor statistics');
      const data = await response.json();
      setDoctorStats(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchActivityStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats/activity', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch activity statistics');
      const data = await response.json();
      setActivityStats(data);
      setLoading(false); 
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "primary" }) => (
    <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-500)] dark:text-[var(--text-400)]">{title}</p>
          <p className="text-2xl font-semibold text-[var(--text-900)] dark:text-[var(--text-100)]">{value}</p>
        </div>
        <Icon className={`w-8 h-8 text-[var(--${color}-500)]`} />
      </div>
    </div>
  );

  const DoctorStatsCard = ({ doctor }) => (
    <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-900)] dark:text-[var(--text-100)]">{doctor.name}</h3>
          <p className="text-sm text-[var(--text-500)]">{doctor.specialty}</p>
        </div>
        <div className="flex items-center">
          <FaStar className="text-yellow-400 w-5 h-5 mr-1" />
          <span className="text-[var(--text-900)] dark:text-[var(--text-100)]">{doctor.statistics.averageRating}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-[var(--text-500)]">Total Appointments</p>
          <p className="text-lg font-semibold text-[var(--text-900)] dark:text-[var(--text-100)]">
            {doctor.statistics.totalAppointments}
          </p>
        </div>
        <div>
          <p className="text-sm text-[var(--text-500)]">Completion Rate</p>
          <p className="text-lg font-semibold text-[var(--text-900)] dark:text-[var(--text-100)]">
            {doctor.statistics.completionRate}%
          </p>
        </div>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-500)]"></div>
    </div>
  );
  }

  return (
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)]">
            Admin Dashboard
          </h1>
              <button
            onClick={() => setIsAddDoctorModalOpen(true)}
            className="flex items-center px-4 py-2 bg-[var(--primary-500)] text-white rounded-lg hover:bg-[var(--primary-600)]"
          >
            <FaPlus className="mr-2" />
            Add New Doctor
              </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-[var(--error-50)] dark:bg-[var(--error-900)] text-[var(--error-600)] dark:text-[var(--error-200)]">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6">
          {['overview', 'doctors', 'clinics', 'users'].map((tab) => (
              <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-[var(--primary-500)] text-white'
                  : 'bg-[var(--background-100)] dark:bg-[var(--background-800)] text-[var(--text-700)] dark:text-[var(--text-300)]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
          ))}
          </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && stats && activityStats && (
            <>
              {/* Basic Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Patients" value={stats.users} icon={FaUsers} />
                <StatCard title="Total Doctors" value={stats.doctors} icon={FaUserMd} />
                <StatCard title="Total Clinics" value={stats.clinics} icon={FaHospital} />
                <StatCard title="Total Appointments" value={stats.appointments} icon={FaCalendarCheck} />
              </div>

              {/* Growth Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[var(--text-500)]">New Users (Last Week)</p>
                      <p className="text-xl font-semibold">{activityStats.userStats.newLastWeek}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-500)]">Growth Rate</p>
                      <p className="text-xl font-semibold">{activityStats.userStats.growthRateLastMonth}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Appointment Activity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[var(--text-500)]">Last Week</p>
                      <p className="text-xl font-semibold">{activityStats.appointmentStats.lastWeek}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-500)]">Last Month</p>
                      <p className="text-xl font-semibold">{activityStats.appointmentStats.lastMonth}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Doctors */}
              <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Top Performing Doctors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activityStats.topDoctors.map((doctor) => (
                    <div key={doctor._id} className="p-4 bg-[var(--background-50)] dark:bg-[var(--background-900)] rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{doctor.name}</p>
                          <p className="text-sm text-[var(--text-500)]">{doctor.specialty}</p>
                        </div>
                        <div className="flex items-center">
                          <FaStar className="text-yellow-400 w-4 h-4 mr-1" />
                          <span>{doctor.averageRating}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm">
                        <span className="text-[var(--text-500)]">Appointments: </span>
                        <span className="font-medium">{doctor.appointmentCount}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appointment Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Appointments by Status</h3>
                  <div className="space-y-4">
                    {activityStats.appointmentStats.byStatus.map((status) => (
                      <div key={status._id} className="flex justify-between items-center">
                        <span className="capitalize">{status._id}</span>
                        <span className="font-medium">{status.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Appointments by Specialty</h3>
                  <div className="space-y-4">
                    {activityStats.appointmentStats.bySpecialty.map((specialty) => (
                      <div key={specialty._id} className="flex justify-between items-center">
                        <span>{specialty._id}</span>
                        <span className="font-medium">{specialty.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
            )}
            
          {activeTab === 'doctors' && <DoctorsList />}
            {activeTab === 'clinics' && <ClinicsList />}
          {activeTab === 'users' && <UsersList />}
        </div>
      </div>

      <AddDoctorModal
        isOpen={isAddDoctorModalOpen}
        onClose={() => setIsAddDoctorModalOpen(false)}
        onDoctorAdded={fetchStats}
      />
    </div>
  );
};

export default AdminDashboard;