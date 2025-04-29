import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { FaCalendarAlt, FaUser, FaMapMarkerAlt, FaClock, FaSpinner, FaTimes, FaInfoCircle, FaHospital, FaAngleRight } from 'react-icons/fa';
import apiClient from '../config/api';

function MyAppointments() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/appointments/user');
      setAppointments(response.data);
      setFilteredAppointments(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const filtered = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);
      const appointmentTime = appointment.time.split(':');
      appointmentDate.setHours(appointmentTime[0], appointmentTime[1]);

      if (filter === 'all') return true;
      if (filter === 'upcoming') return appointmentDate > now && appointment.status !== 'cancelled';
      if (filter === 'past') return appointmentDate < now;
      if (filter === 'cancelled') return appointment.status === 'cancelled';
      if (filter === 'confirmed') return appointment.status === 'confirmed';
      if (filter === 'pending') return appointment.status === 'pending';
      if (filter === 'completed') return appointment.status === 'completed';
      return true;
    });
    setFilteredAppointments(filtered);
  }, [appointments, filter]);

  const handleCancelAppointment = async (appointmentId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const response = await apiClient.put(`/api/appointments/${appointmentId}/cancel`);
      setAppointments((prev) =>
        prev.map((app) => (app._id === appointmentId ? { ...app, status: 'cancelled' } : app))
      );

      const { appointment } = response.data;
      if (response) {
        try {
          await apiClient.post(
            '/api/notifications',
            {
              recipient: appointment.doctor._id,
              recipientType: 'Doctor',
              sender: token.id,
              senderType: 'Patient',
              type: 'APPOINTMENT_CANCELLED',
              appointment: appointment._id,
              message: `${appointment.patient.name} has canceled his appointment for ${format(new Date(appointment.date), 'MMMM d, yyyy')} at ${appointment.time}.`,
            },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
        } catch (notificationError) {
          console.error('Failed to create notification for patient:', notificationError);
        }
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setError(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(selectedAppointment?._id === appointment._id ? null : appointment);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-900)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <FaSpinner className="h-12 w-12 animate-spin text-[var(--primary-500)] mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Butoane pentru filtrare
  const FilterButtons = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {[
        { label: 'All', value: 'all' },
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Past', value: 'past' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ].map((option) => (
        <button
          key={option.value}
          onClick={() => setFilter(option.value)}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === option.value
              ? 'bg-[var(--primary-500)] text-white'
              : 'bg-[var(--background-200)] dark:bg-[var(--background-700)] text-[var(--text-900)] dark:text-[var(--text-50)] hover:bg-[var(--primary-400)] hover:text-white'
          } transition-colors`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  // Desktop view - table layout
  const DesktopView = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
        <thead className="bg-[var(--background-200)] dark:bg-[var(--background-700)]">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">Doctor</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">Date & Time</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">Clinic</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">Reason</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-[var(--background-100)] dark:bg-[var(--background-800)] divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
          {filteredAppointments.map((appointment) => (
            <tr key={appointment._id} className="hover:bg-[var(--background-200)] dark:hover:bg-[var(--background-700)] transition-colors duration-200">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FaUser className="h-5 w-5 text-[var(--primary-500)] mr-2" />
                  <div className="text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-50)]">
                    {appointment.doctor?.firstName} {appointment.doctor?.lastName || 'Unknown Doctor'}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FaClock className="h-5 w-5 text-[var(--primary-500)] mr-2" />
                  <div className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                    {format(new Date(appointment.date), 'MMMM d, yyyy')} at {appointment.time}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FaHospital className="h-5 w-5 text-[var(--primary-500)] mr-2" />
                  <div className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                    {appointment.clinic?.name || 'Unknown Clinic'}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)] max-w-xs truncate">
                  {appointment.reason}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                  <button
                    onClick={(e) => handleCancelAppointment(appointment._id, e)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mr-2"
                  >
                    <FaTimes className="h-5 w-5" title="Cancel appointment" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Mobile view - card layout
  const MobileView = () => (
    <div className="md:hidden space-y-4">
      {filteredAppointments.map((appointment) => (
        <div 
          key={appointment._id} 
          className="bg-[var(--background-100)] dark:bg-[var(--background-800)] rounded-lg shadow-sm overflow-hidden"
          onClick={() => handleAppointmentClick(appointment)}
        >
          <div className="px-4 py-4 flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  <FaUser className="h-4 w-4 text-[var(--primary-500)] mr-2" />
                  <span className="text-sm font-semibold text-[var(--text-900)] dark:text-[var(--text-50)]">
                    {appointment.doctor?.firstName} {appointment.doctor?.lastName || 'Unknown Doctor'}
                  </span>
                </div>
                <span className={`ml-2 px-2 text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center text-xs text-[var(--text-700)] dark:text-[var(--text-300)]">
                <FaClock className="h-3 w-3 text-[var(--primary-500)] mr-1" />
                <span>{format(new Date(appointment.date), 'MMM d, yyyy')} at {appointment.time}</span>
              </div>
              
              <div className="flex items-center text-xs text-[var(--text-700)] dark:text-[var(--text-300)] mt-1">
                <FaHospital className="h-3 w-3 text-[var(--primary-500)] mr-1" />
                <span className="truncate max-w-[200px]">{appointment.clinic?.name || 'Unknown Clinic'}</span>
              </div>
            </div>
            
            <div className="flex items-center">
              {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                <button
                  onClick={(e) => handleCancelAppointment(appointment._id, e)}
                  className="mr-2 p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  <FaTimes className="h-5 w-5" title="Cancel appointment" />
                </button>
              )}
              <FaAngleRight className={`h-5 w-5 text-[var(--text-400)] transition-transform duration-200 ${selectedAppointment?._id === appointment._id ? 'rotate-90' : ''}`} />
            </div>
          </div>
          
          {selectedAppointment?._id === appointment._id && (
            <div className="px-4 py-3 bg-[var(--background-200)] dark:bg-[var(--background-700)] text-sm">
              <h4 className="font-medium text-[var(--text-900)] dark:text-[var(--text-50)] mb-1">Appointment reason:</h4>
              <p className="text-[var(--text-700)] dark:text-[var(--text-300)] mb-2">{appointment.reason}</p>
              <h4 className="font-medium text-[var(--text-900)] dark:text-[var(--text-50)] mb-1">Location:</h4>
              <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">{appointment.clinic?.address || 'Address not available'}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-900)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[var(--background-100)] dark:bg-[var(--background-800)] shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-[var(--background-200)] dark:border-[var(--background-700)] sm:px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FaCalendarAlt className="h-6 w-6 text-[var(--primary-500)] mr-2" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-50)]">
                  My Appointments
                </h2>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900 border-l-4 border-red-500">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <FilterButtons /> {/* Adaugă butoanele de filtrare */}

          {filteredAppointments.length === 0 ? (
            <div className="p-6 text-center text-[var(--text-500)] dark:text-[var(--text-400)]">
              <FaInfoCircle className="h-12 w-12 mx-auto mb-4 text-[var(--text-400)]" />
              <p className="text-lg">No appointments match your filter.</p>
            </div>
          ) : (
            <>
              <DesktopView />
              <MobileView />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyAppointments;