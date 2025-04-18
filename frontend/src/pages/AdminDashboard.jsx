import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaUserMd, FaHospital, FaPlus, FaChartLine, FaStar, FaCalendarCheck, FaCalendarTimes, FaClipboardList } from 'react-icons/fa';
import UsersList from '../components/admin/UsersList';
import DoctorsList from '../components/admin/DoctorsList';
import ClinicsList from '../components/admin/ClinicsList';
import AppointmentsList from '../components/admin/AppointmentsList';
import AddDoctorModal from '../components/admin/AddDoctorModal';
import { apiClient } from '../config/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole !== 'Admin') {
      navigate('/login')
    }
    fetchDashboardData();
  }, [userRole, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, doctorStatsResponse, activityStatsResponse] = await Promise.all([
        apiClient.get('/api/admin/stats'),
        apiClient.get('/api/admin/stats/doctors'),
        apiClient.get('/api/admin/stats/activity')
      ]);

      setDashboardData({
        stats: statsResponse.data,
        doctorStats: doctorStatsResponse.data,
        activityStats: activityStatsResponse.data
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "primary" }) => (
    <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs md:text-sm font-medium text-[var(--text-500)] dark:text-[var(--text-400)]">{title}</p>
          <p className="text-xl md:text-2xl font-semibold text-[var(--text-900)] dark:text-[var(--text-100)]">{value}</p>
        </div>
        <Icon className={`w-6 h-6 md:w-8 md:h-8 text-[var(--${color}-500)]`} />
      </div>
    </div>
  );

  const DoctorStatsCard = ({ doctor }) => (
    <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex justify-between items-start mb-2 md:mb-4">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-[var(--text-900)] dark:text-[var(--text-100)]">{doctor.name}</h3>
          <p className="text-xs md:text-sm text-[var(--text-500)]">{doctor.specialty}</p>
        </div>
        <div className="flex items-center">
          <FaStar className="text-yellow-400 w-4 h-4 md:w-5 md:h-5 mr-1" />
          <span className="text-[var(--text-900)] dark:text-[var(--text-100)]">{doctor.statistics.averageRating}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        <div>
          <p className="text-xs md:text-sm text-[var(--text-500)]">Total Appointments</p>
          <p className="text-base md:text-lg font-semibold text-[var(--text-900)] dark:text-[var(--text-100)]">
            {doctor.statistics.totalAppointments}
          </p>
        </div>
        <div>
          <p className="text-xs md:text-sm text-[var(--text-500)]">Completion Rate</p>
          <p className="text-base md:text-lg font-semibold text-[var(--text-900)] dark:text-[var(--text-100)]">
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
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)] p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 gap-4 md:gap-0">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)]">
            Admin Dashboard
          </h1>
          <button
            onClick={() => setIsAddDoctorModalOpen(true)}
            className="flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-[var(--primary-500)] text-white rounded-lg hover:bg-[var(--primary-600)] text-sm md:text-base"
          >
            <FaPlus className="mr-1 md:mr-2" />
            Add New Doctor
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 md:p-4 rounded-lg bg-[var(--error-50)] dark:bg-[var(--error-900)] text-[var(--error-600)] dark:text-[var(--error-200)] text-sm md:text-base">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap mb-4 md:mb-6 gap-2">
          {['overview', 'doctors', 'clinics', 'users', 'appointments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-xs md:text-sm ${
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
        <div className="space-y-4 md:space-y-6">
          {activeTab === 'overview' && dashboardData && (
            <>
              {/* Basic Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <StatCard title="Total Patients" value={dashboardData.stats.users} icon={FaUsers} />
                <StatCard title="Total Doctors" value={dashboardData.stats.doctors} icon={FaUserMd} />
                <StatCard title="Total Clinics" value={dashboardData.stats.clinics} icon={FaHospital} />
                <StatCard title="Total Appointments" value={dashboardData.stats.appointments} icon={FaCalendarCheck} />
              </div>

              {/* Growth Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-4">User Growth</h3>
                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div>
                      <p className="text-xs md:text-sm text-[var(--text-500)]">New Users (Last Week)</p>
                      <p className="text-lg md:text-xl font-semibold">
                        {dashboardData.activityStats.userStats.newLastWeek}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-[var(--text-500)]">Growth Rate</p>
                      <p className="text-lg md:text-xl font-semibold">
                        {dashboardData.activityStats.userStats.growthRateLastMonth}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-4">Appointment Activity</h3>
                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div>
                      <p className="text-xs md:text-sm text-[var(--text-500)]">Last Week</p>
                      <p className="text-lg md:text-xl font-semibold">{dashboardData.activityStats.appointmentStats.lastWeek}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-[var(--text-500)]">Last Month</p>
                      <p className="text-lg md:text-xl font-semibold">{dashboardData.activityStats.appointmentStats.lastMonth}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Doctors */}
              <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-4">Top Performing Doctors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {dashboardData.activityStats.topDoctors.map((doctor) => (
                    <div key={doctor._id} className="p-3 md:p-4 bg-[var(--background-50)] dark:bg-[var(--background-900)] rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm md:text-base font-medium">{doctor.name}</p>
                          <p className="text-xs md:text-sm text-[var(--text-500)]">{doctor.specialty}</p>
                        </div>
                        <div className="flex items-center">
                          <FaStar className="text-yellow-400 w-3 h-3 md:w-4 md:h-4 mr-1" />
                          <span className="text-xs md:text-sm">{doctor.averageRating}</span>
                        </div>
                      </div>
                      <p className="mt-1 md:mt-2 text-xs md:text-sm">
                        <span className="text-[var(--text-500)]">Appointments: </span>
                        <span className="font-medium">{doctor.appointmentCount}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appointment Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-4">Appointments by Status</h3>
                  <div className="space-y-2 md:space-y-4">
                    {dashboardData.activityStats.appointmentStats.byStatus.map((status) => (
                      <div key={status._id} className="flex justify-between items-center">
                        <span className="capitalize text-xs md:text-sm">{status._id}</span>
                        <span className="font-medium text-xs md:text-sm">{status.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-4">Appointments by Specialty</h3>
                  <div className="space-y-2 md:space-y-4">
                    {dashboardData.activityStats.appointmentStats.bySpecialty.map((specialty) => (
                      <div key={specialty._id} className="flex justify-between items-center">
                        <span className="text-xs md:text-sm">{specialty._id}</span>
                        <span className="font-medium text-xs md:text-sm">{specialty.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
            
          {activeTab === 'doctors' && <DoctorsList onRefresh={fetchDashboardData} />}
          {activeTab === 'clinics' && <ClinicsList onRefresh={fetchDashboardData} />}
          {activeTab === 'users' && <UsersList onRefresh={fetchDashboardData} />}
          {activeTab === 'appointments' && <AppointmentsList onRefresh={fetchDashboardData} />}
        </div>
      </div>

      <AddDoctorModal
        isOpen={isAddDoctorModalOpen}
        onClose={() => setIsAddDoctorModalOpen(false)}
        onSuccess={() => {
          setIsAddDoctorModalOpen(false);
          fetchDashboardData();
        }}
      />
    </div>
  );
};

export default AdminDashboard;