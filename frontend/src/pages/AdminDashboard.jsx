import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaUserMd, FaHospital, FaPlus, FaChartLine, FaStar, FaCalendarCheck, FaCalendarTimes, FaClipboardList, FaUserPlus } from 'react-icons/fa';
import AdminUsersList from '../components/admin/AdminUsersList';
import AdminClinicsList from '../components/admin/AdminClinicsList';
import AdminAppointmentsList from '../components/admin/AdminAppointmentsList';
import AddDoctorModal from '../components/admin/AddDoctorModal';
import AppointmentsChart from '../components/admin/AppointmentsChart';
import UserGrowthChart from '../components/admin/UserGrowthChart';
import DoctorPerformanceChart from '../components/admin/DoctorPerformanceChart';
import SpecialtyDistributionChart from '../components/admin/SpecialtyDistributionChart';
import { apiClient } from '../config/api';
import AdminDoctorsList from '../components/admin/AdminDoctorsList';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Add debugging information
    console.log('Current user role:', userRole);
    
    // Check for admin role case-insensitively
    if (userRole && userRole.toLowerCase() !== 'admin') {
      console.log('Access denied: Not an admin user');
      navigate('/login');
    } else {
      console.log('Admin access granted, fetching dashboard data');
      fetchDashboardData();
    }
  }, [userRole, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      
      const [statsResponse, doctorStatsResponse, activityStatsResponse] = await Promise.all([
        apiClient.get('/api/admin/stats'),
        apiClient.get('/api/admin/doctors', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }),
        apiClient.get('/api/admin/stats/activity')
      ]);

      console.log('Dashboard data fetched successfully');

      
      
      
      setDashboardData({
        stats: statsResponse.data,
        doctorStats: doctorStatsResponse.data,
        activityStats: activityStatsResponse.data
      });

      console.log('Stats response: ', dashboardData.stats);
      console.log('Doctor stat response', dashboardData.doctorStats);
      console.log('Activity stats response ', dashboardData.activityStats);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Add more detailed error handling
      if (err.response?.status === 403) {
        setError('Access denied. You do not have admin privileges.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        // Redirect to login after 2 seconds
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "primary" }) => (
    <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xs sm:text-xs md:text-sm font-medium text-[var(--text-500)] dark:text-[var(--text-400)]">{title}</p>
          <p className="text-lg sm:text-xl md:text-2xl font-semibold text-[var(--text-900)] dark:text-[var(--text-100)]">{value}</p>
        </div>
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[var(--${color}-500)]`} />
      </div>
    </div>
  );

  const DoctorStatsCard = ({ doctor }) => (
    <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
      <div className="flex justify-between items-start mb-2 md:mb-4">
        <div>
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-[var(--text-900)] dark:text-[var(--text-100)]">{doctor.name}</h3>
          <p className="text-2xs sm:text-xs md:text-sm text-[var(--text-500)]">{doctor.specialty}</p>
        </div>
        <div className="flex items-center">
          <FaStar className="text-yellow-400 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1" />
          <span className="text-xs sm:text-sm text-[var(--text-900)] dark:text-[var(--text-100)]">{doctor.statistics.averageRating}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        <div>
          <p className="text-2xs sm:text-xs md:text-sm text-[var(--text-500)]">Total Appointments</p>
          <p className="text-sm sm:text-base md:text-lg font-semibold text-[var(--text-900)] dark:text-[var(--text-100)]">
            {doctor.statistics.totalAppointments}
          </p>
        </div>
        <div>
          <p className="text-2xs sm:text-xs md:text-sm text-[var(--text-500)]">Completion Rate</p>
          <p className="text-sm sm:text-base md:text-lg font-semibold text-[var(--text-900)] dark:text-[var(--text-100)]">
            {doctor.statistics.completionRate}%
          </p>
        </div>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[var(--primary-500)]"></div>
      </div>
    );
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setShowMobileMenu(false); // Close mobile menu when tab is selected
  };

  return (
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)] p-2 sm:p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-2 sm:p-3 md:p-4 rounded-lg bg-[var(--error-50)] dark:bg-[var(--error-900)] text-[var(--error-600)] dark:text-[var(--error-200)] text-xs sm:text-sm md:text-base">
            {error}
          </div>
        )}

        {/* Mobile Navigation Dropdown */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="w-full flex items-center justify-between p-3 bg-white dark:bg-[var(--background-800)] rounded-lg shadow-md"
          >
            <span className="text-sm font-medium capitalize">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${showMobileMenu ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showMobileMenu && (
            <div className="mt-1 bg-white dark:bg-[var(--background-800)] rounded-lg shadow-lg absolute z-10 w-[calc(100%-1rem)] max-w-7xl">
              {['overview', 'doctors', 'clinics', 'users', 'appointments', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`w-full text-left p-3 text-sm ${
                    activeTab === tab
                      ? 'bg-[var(--primary-50)] dark:bg-[var(--primary-900)] text-[var(--primary-600)] dark:text-[var(--primary-300)]'
                      : 'text-[var(--text-700)] dark:text-[var(--text-300)]'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:flex flex-wrap mb-4 md:mb-6 gap-2">
          {['overview', 'doctors', 'clinics', 'users', 'appointments', 'analytics'].map((tab) => (
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
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {activeTab === 'overview' && dashboardData && (
            <>
              {/* Basic Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-6">
                <StatCard title="Total Patients" value={dashboardData.stats.users} icon={FaUsers} />
                <StatCard title="Total Doctors" value={dashboardData.stats.doctors} icon={FaUserMd} />
                <StatCard title="Total Clinics" value={dashboardData.stats.clinics} icon={FaHospital} />
                <StatCard title="Total Appointments" value={dashboardData.stats.appointments} icon={FaCalendarCheck} />
              </div>

              {/* Data Visualization - First Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div className="overflow-hidden h-[200px] sm:h-[450px] md:h-[500px]">
                  <AppointmentsChart appointmentData={dashboardData.activityStats.appointmentStats} />
                </div>
                <div className="overflow-hidden h-[200px] sm:h-[450px] md:h-[500px]">
                  <SpecialtyDistributionChart specialtyData={dashboardData.activityStats.appointmentStats.bySpecialty} />
                </div>
              </div>

              {/* User Growth Chart */}
              <div className="overflow-hidden h-[250px] sm:h-[300px] md:h-[350px]">
                <UserGrowthChart userStats={dashboardData.activityStats.userStats} />
              </div>

              {/* Top Doctors Performance Chart */}
              <div className="overflow-hidden h-[250px] sm:h-[300px] md:h-[450px]">
                <DoctorPerformanceChart doctorsData={dashboardData.activityStats.topDoctors} />
              </div>

              {/* Growth Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 md:mb-4">User Growth</h3>
                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div>
                      <p className="text-2xs sm:text-xs md:text-sm text-[var(--text-500)]">New Users (Last Week)</p>
                      <p className="text-base sm:text-lg md:text-xl font-semibold">
                        {dashboardData.activityStats.userStats.newLastWeek}
                      </p>
                    </div>
                    <div>
                      <p className="text-2xs sm:text-xs md:text-sm text-[var(--text-500)]">Growth Rate</p>
                      <p className="text-base sm:text-lg md:text-xl font-semibold">
                        {dashboardData.activityStats.userStats.growthRateLastMonth}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 md:mb-4">Appointment Activity</h3>
                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div>
                      <p className="text-2xs sm:text-xs md:text-sm text-[var(--text-500)]">Last Week</p>
                      <p className="text-base sm:text-lg md:text-xl font-semibold">{dashboardData.activityStats.appointmentStats.lastWeek}</p>
                    </div>
                    <div>
                      <p className="text-2xs sm:text-xs md:text-sm text-[var(--text-500)]">Last Month</p>
                      <p className="text-base sm:text-lg md:text-xl font-semibold">{dashboardData.activityStats.appointmentStats.lastMonth}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Doctors */}
              <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 md:mb-4">Top Performing Doctors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  {dashboardData.activityStats.topDoctors.map((doctor) => (
                    <div key={doctor._id} className="p-2 sm:p-3 md:p-4 bg-[var(--background-50)] dark:bg-[var(--background-900)] rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs sm:text-sm md:text-base font-medium">{doctor.name}</p>
                          <p className="text-2xs sm:text-xs md:text-sm text-[var(--text-500)]">{doctor.specialty}</p>
                        </div>
                        <div className="flex items-center">
                          <FaStar className="text-yellow-400 w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-1" />
                          <span className="text-2xs sm:text-xs md:text-sm">{doctor.averageRating}</span>
                        </div>
                      </div>
                      <p className="mt-1 md:mt-2 text-2xs sm:text-xs md:text-sm">
                        <span className="text-[var(--text-500)]">Appointments: </span>
                        <span className="font-medium">{doctor.appointmentCount}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'analytics' && dashboardData && (
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)]">
                Dashboard Analytics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div className="overflow-hidden h-[200px] sm:h-[450px] md:h-[500px]">
                  <AppointmentsChart appointmentData={dashboardData.activityStats.appointmentStats} />
                </div>
                <div className="overflow-hidden h-[200px] sm:h-[450px] md:h-[500px]">
                  <SpecialtyDistributionChart specialtyData={dashboardData.activityStats.appointmentStats.bySpecialty} />
                </div>
              </div>
              
              <div className="overflow-hidden h-[250px] sm:h-[400px] md:h-[450px]">
                <UserGrowthChart userStats={dashboardData.activityStats.userStats} />
              </div>
              
              <div className="overflow-hidden h-[250px] sm:h-[400px] md:h-[450px]">
                <DoctorPerformanceChart doctorsData={dashboardData.activityStats.topDoctors} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 md:mb-4">Appointment Status Details</h3>
                  <div className="space-y-1 sm:space-y-2 md:space-y-4">
                    {dashboardData.activityStats.appointmentStats.byStatus.map((status) => (
                      <div key={status.status} className="flex justify-between items-center">
                        <span className="capitalize text-2xs sm:text-xs md:text-sm">{status.status}</span>
                        <span className="font-medium text-2xs sm:text-xs md:text-sm">{status.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-[var(--background-800)] rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 md:mb-4">Appointment Specialty Details</h3>
                  <div className="space-y-1 sm:space-y-2 md:space-y-4">
                    {dashboardData.activityStats.appointmentStats.bySpecialty.map((specialty) => (
                      <div key={specialty._id} className="flex justify-between items-center">
                        <span className="text-2xs sm:text-xs md:text-sm">{specialty._id}</span>
                        <span className="font-medium text-2xs sm:text-xs md:text-sm">{specialty.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
            
          {activeTab === 'doctors' && <AdminDoctorsList onRefresh={fetchDashboardData} />}
          {activeTab === 'clinics' && <AdminClinicsList onRefresh={fetchDashboardData} />}
          {activeTab === 'users' && <AdminUsersList onRefresh={fetchDashboardData} />}
          {activeTab === 'appointments' && <AdminAppointmentsList onRefresh={fetchDashboardData} />}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;