import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaCalendarCheck, FaCalendarTimes, FaFileMedical, FaStethoscope, FaSpinner, FaClock, FaBan, FaTimes, FaTrash, FaPlus, FaHistory } from 'react-icons/fa';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { apiClient } from '../config/api';

function DoctorDashboard() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [showUnavailableForm, setShowUnavailableForm] = useState(false);
  const [newUnavailable, setNewUnavailable] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    slots: [],
    isFullDay: false,
    reason: ''
  });
  const [selectedCalendarAppointment, setSelectedCalendarAppointment] = useState(null);
  const [workingHours, setWorkingHours] = useState([
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30'
  ]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  // Medical history states
  const [patientMedicalHistory, setPatientMedicalHistory] = useState(null);
  const [loadingMedicalHistory, setLoadingMedicalHistory] = useState(false);
  const [showMedicalHistoryModal, setShowMedicalHistoryModal] = useState(false);
  const [medicalHistoryActiveTab, setMedicalHistoryActiveTab] = useState('conditions');
  const [showAddEntryForm, setShowAddEntryForm] = useState(false);
  const [newMedicalEntry, setNewMedicalEntry] = useState({});
  const [medicalHistoryError, setMedicalHistoryError] = useState(null);

  useEffect(() => {
    fetchWeeklyData();
  }, [currentWeek]);

  useEffect(() => {
    if (showUnavailableForm && newUnavailable.date) {
      // Filter out slots that are already booked
      const bookedSlots = appointments
        .filter(app =>
          format(new Date(app.date), 'yyyy-MM-dd') === newUnavailable.date &&
          app.status !== 'cancelled'
        )
        .map(app => app.time);

      // Update available slots
      setAvailableSlots(workingHours.filter(hour => !bookedSlots.includes(hour)));
    }
  }, [showUnavailableForm, newUnavailable.date, appointments]);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      
      // Get the start and end dates for the current week
      const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
      
      // Format dates for API request
      const startDate = format(start, 'yyyy-MM-dd');
      const endDate = format(end, 'yyyy-MM-dd');
      
      // Get the doctor's ID from the token
      const doctorId = token.id;
      
      // Make API request using the correct route
      const response = await apiClient.get(`/api/doctor-appointments`, {
        params: {
          startDate,
          endDate
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      // Process the response data - assuming the endpoint returns formatted appointments
      const appointments = response.data.appointments || [];
      
      // Filter appointments for the current week
      const filteredAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= start && appointmentDate <= end;
      });
      
      setAppointments(filteredAppointments);
      
      // If response includes unavailable slots, use them
      if (response.data.unavailableSlots) {
        setUnavailableSlots(response.data.unavailableSlots);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch patient's medical history
  const fetchPatientMedicalHistory = async (patientId) => {
    if (!patientId) return;
    
    try {
      setLoadingMedicalHistory(true);
      setMedicalHistoryError(null);
      
      const response = await apiClient.get(`/api/medical-history/${patientId}`,
        {
          params: {
            patientId
          },
        }
      );
      setPatientMedicalHistory(response.data);
    } catch (err) {
      console.error('Error fetching medical history:', err);
      setMedicalHistoryError(err.message || 'Failed to load medical history');
    } finally {
      setLoadingMedicalHistory(false);
    }
  };

  // Handle adding a new entry to medical history
  const handleAddMedicalEntry = async (type) => {
    // Check for patient ID in different possible properties
    const patientId = selectedCalendarAppointment?.patient || 
                      selectedCalendarAppointment?.patientId;
    
    if (!patientId) {
      setMedicalHistoryError('Could not determine patient ID');
      return;
    }
    
    try {
      setMedicalHistoryError(null);
      
      // Add the author (doctor) to the entry if it's a note
      const entryData = type === 'notes' 
        ? { ...newMedicalEntry, author: token.id } 
        : newMedicalEntry;
      
      const endpoint = `/api/medical-history/${patientId}/${type}`;
      await apiClient.post(endpoint, entryData);
      
      // Refresh medical history data
      await fetchPatientMedicalHistory(patientId);
      
      // Reset form
      setNewMedicalEntry({});
      setShowAddEntryForm(false);
    } catch (err) {
      console.error('Error adding medical entry:', err);
      setMedicalHistoryError(err.message || 'Failed to add entry');
    }
  };

  const handleMarkUnavailable = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/api/doctors/me/unavailable', newUnavailable);
      setUnavailableSlots(response.data.unavailableSlots);
      setShowUnavailableForm(false);
      setNewUnavailable({
        date: format(new Date(), 'yyyy-MM-dd'),
        slots: [],
        isFullDay: false,
        reason: ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUnavailable = async (slotId) => {
    try {
      const response = await apiClient.delete(`/api/doctors/me/unavailable/${slotId}`);
      setUnavailableSlots(response.data.unavailableSlots);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Sigur doriți să anulați această programare?')) return;

    try {
      // Prima dată anulăm programarea
      const response = await apiClient.post(`/api/doctors/appointments/${appointmentId}/cancel`, {
        status: 'cancelled'
      });

      const { appointment } = response.data;

      // Actualizăm lista de programări local
      const updatedAppointments = appointments.map(app =>
        app._id === appointmentId ? { ...app, status: 'cancelled' } : app
      );
      setAppointments(updatedAppointments);

      // Creăm notificarea pentru pacient
      try {
        await apiClient.post('/api/notifications', {
          recipient: appointment.patient,
          type: 'APPOINTMENT_CANCELLED',
          appointment: appointmentId,
          message: `Your appointment for ${format(new Date(appointment.date), 'MMMM d, yyyy')} at ${appointment.time} has been cancelled by the doctor.`
        });
      } catch (notificationError) {
        console.error('Failed to create notification for patient:', notificationError);
      }

    } catch (err) {
      console.error('Error in handleCancelAppointment:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="w-8 h-8 animate-spin text-[var(--primary-500)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)] p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)] mb-4 sm:mb-8">
          Doctor Dashboard
        </h1>

        {error && (
          <div className="mb-4 p-3 sm:p-4 rounded-lg bg-[var(--error-50)] dark:bg-[var(--error-900)] text-[var(--error-600)] dark:text-[var(--error-200)]">
            {error}
          </div>
        )}

        {/* Calendar Content */}
        <div className="bg-white dark:bg-[var(--background-900)] rounded-xl shadow-sm p-3 sm:p-4 md:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                className="p-1 sm:p-2 text-sm sm:text-base text-[var(--text-600)] hover:text-[var(--primary-500)]"
              >
                ← Prev
              </button>
              <span className="font-medium text-sm sm:text-base">
                {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd MMM', { locale: enUS })} -
                {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd MMM yyyy', { locale: enUS })}
              </span>
              <button
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                className="p-1 sm:p-2 text-sm sm:text-base text-[var(--text-600)] hover:text-[var(--primary-500)]"
              >
                Next →
              </button>
            </div>

            {/* Weekly Calendar - Mobile View */}
            <div className="md:hidden">
              {Array.from({ length: 7 }, (_, i) => {
                const date = addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), i);
                const dayAppointments = appointments.filter(app =>
                  isSameDay(new Date(app.date), date)
                );
                const dayUnavailable = unavailableSlots.find(slot =>
                  isSameDay(new Date(slot.date), date)
                );

                return (
                  <div key={i} className="border rounded-lg p-3 mb-3">
                    <div className="font-medium mb-2">
                      {format(date, 'EEEE', { locale: enUS })}
                      <span className="ml-2">{format(date, 'd MMM', { locale: enUS })}</span>
                    </div>

                    {dayAppointments.length === 0 && !dayUnavailable && (
                      <p className="text-sm text-gray-500">No appointments</p>
                    )}

                    {dayAppointments.map(app => (
                      <div
                        key={app._id}
                        className={`p-2 mb-2 rounded text-sm hover:opacity-80 transition-opacity ${app.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            app.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{app.time}</div>
                          {app.status !== 'cancelled' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelAppointment(app._id);
                              }}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Anulează programarea"
                            >
                              <FaTrash size={14} />
                            </button>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <div>{app.patientName}</div>
                          <button
                            onClick={() => setSelectedCalendarAppointment(app)}
                            className="text-xs underline text-[var(--primary-500)]"
                          >
                            Detalii
                          </button>
                        </div>
                      </div>
                    ))}

                    {dayUnavailable?.isFullDay && (
                      <div className="p-2 bg-gray-100 text-gray-800 rounded text-sm">
                        Unavailable Day
                      </div>
                    )}

                    {dayUnavailable?.slots.map(slot => (
                      <div key={slot} className="p-2 bg-gray-100 text-gray-800 rounded text-sm mb-2">
                        {slot} - Unavailable
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Weekly Calendar - Desktop View */}
            <div className="hidden md:grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }, (_, i) => {
                const date = addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), i);
                const dayAppointments = appointments.filter(app =>
                  isSameDay(new Date(app.date), date)
                );
                const dayUnavailable = unavailableSlots.find(slot =>
                  isSameDay(new Date(slot.date), date)
                );

                return (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="font-medium mb-2">
                      {format(date, 'EEEE', { locale: enUS })}
                      <br />
                      {format(date, 'd MMMM', { locale: enUS })}
                    </div>

                    {dayAppointments.length === 0 && !dayUnavailable && (
                      <p className="text-sm text-gray-500">No appointments</p>
                    )}

                    {dayAppointments.map(app => (
                      <div
                        key={app._id}
                        className={`p-2 mb-2 rounded text-sm hover:opacity-80 transition-opacity ${app.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            app.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{app.time}</div>
                          {app.status !== 'cancelled' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelAppointment(app._id);
                              }}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Anulează programarea"
                            >
                              <FaTrash size={14} />
                            </button>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <div>{app.patientName}</div>
                          <button
                            onClick={() => setSelectedCalendarAppointment(app)}
                            className="text-xs underline text-[var(--primary-500)]"
                          >
                            Detalii
                          </button>
                        </div>
                      </div>
                    ))}

                    {dayUnavailable?.isFullDay && (
                      <div className="p-2 bg-gray-100 text-gray-800 rounded text-sm">
                        Unavailable Day
                      </div>
                    )}

                    {dayUnavailable?.slots.map(slot => (
                      <div key={slot} className="p-2 bg-gray-100 text-gray-800 rounded text-sm mb-2">
                        {slot} - Unavailable
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Mark Unavailable Button */}
            <button
              onClick={() => setShowUnavailableForm(true)}
              className="mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--primary-500)] text-white text-sm sm:text-base rounded-lg hover:bg-[var(--primary-600)]"
            >
              <FaBan className="inline-block mr-1 sm:mr-2" />
              Mark Unavailable Slots
            </button>
          </div>
        </div>
      </div>

      {/* Unavailable Form Modal */}
      {showUnavailableForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[var(--background-900)] rounded-xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Mark Unavailable Slots
            </h3>
            <form onSubmit={handleMarkUnavailable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={newUnavailable.date}
                  onChange={(e) => setNewUnavailable({
                    ...newUnavailable,
                    date: e.target.value
                  })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <input
                    type="checkbox"
                    checked={newUnavailable.isFullDay}
                    onChange={(e) => setNewUnavailable({
                      ...newUnavailable,
                      isFullDay: e.target.checked,
                      slots: []
                    })}
                    className="mr-2"
                  />
                  Full Day Unavailable
                </label>
              </div>

              {!newUnavailable.isFullDay && (
                <div>
                  <label className="block text-sm font-medium mb-1">Time Slots</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {availableSlots.map(hour => (
                      <label key={hour} className="flex items-center">
                        <input
                          type="checkbox"
                          value={hour}
                          checked={newUnavailable.slots.includes(hour)}
                          onChange={(e) => {
                            const slots = e.target.checked
                              ? [...newUnavailable.slots, hour]
                              : newUnavailable.slots.filter(h => h !== hour);
                            setNewUnavailable({
                              ...newUnavailable,
                              slots
                            });
                          }}
                          className="mr-2"
                        />
                        {hour}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={newUnavailable.reason}
                  onChange={(e) => setNewUnavailable({
                    ...newUnavailable,
                    reason: e.target.value
                  })}
                  className="w-full p-2 border rounded"
                  placeholder="Reason for unavailability"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUnavailableForm(false)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 border rounded text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--primary-500)] text-white rounded text-sm sm:text-base"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedCalendarAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[var(--background-900)] rounded-xl p-4 sm:p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg sm:text-xl font-semibold">
                Appointment Details
              </h3>
              <button
                onClick={() => setSelectedCalendarAppointment(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Patient Information */}
              <div className="bg-gray-50 dark:bg-[var(--background-800)] p-3 sm:p-4 rounded-lg">
                <h4 className="font-medium text-base sm:text-lg mb-2">Patient Information</h4>
                <p className="text-sm sm:text-base"><span className="font-medium">Name:</span> {selectedCalendarAppointment.patient.name}</p>
                <p className="text-sm sm:text-base"><span className="font-medium">Email:</span> {selectedCalendarAppointment.patient.email}</p>
                <p className="text-sm sm:text-base"><span className="font-medium">Phone:</span> {selectedCalendarAppointment.patient.phone}</p>
              </div>

              {/* Appointment Information */}
              <div className="bg-gray-50 dark:bg-[var(--background-800)] p-3 sm:p-4 rounded-lg">
                <h4 className="font-medium text-base sm:text-lg mb-2">Appointment Information</h4>
                <p className="text-sm sm:text-base"><span className="font-medium">Date:</span> {format(new Date(selectedCalendarAppointment.date), 'MMMM d, yyyy')}</p>
                <p className="text-sm sm:text-base"><span className="font-medium">Time:</span> {selectedCalendarAppointment.time}</p>
                <p className="text-sm sm:text-base"><span className="font-medium">Status:</span>
                  <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs sm:text-sm ${selectedCalendarAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      selectedCalendarAppointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                    {selectedCalendarAppointment.status}
                  </span>
                </p>
                <p className="text-sm sm:text-base"><span className="font-medium">Reason:</span> {selectedCalendarAppointment.reason}</p>
              </div>

              {/* Medical History */}
              <div className="bg-gray-50 dark:bg-[var(--background-800)] p-3 sm:p-4 rounded-lg">
                <h4 className="font-medium text-base sm:text-lg mb-2">Medical History</h4>
                <button
                  onClick={() => {
                    if (selectedCalendarAppointment && selectedCalendarAppointment.patient) {
                      fetchPatientMedicalHistory(selectedCalendarAppointment.patient._id);
                    } else {
                      console.error("No patient ID found in the appointment data");
                      setMedicalHistoryError("Could not locate patient data");
                    }
                    setShowMedicalHistoryModal(true);
                  }}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--primary-500)] text-white rounded hover:bg-[var(--primary-600)] inline-flex items-center text-sm sm:text-base"
                >
                  <FaHistory className="mr-1 sm:mr-2" />
                  View Medical History
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-end gap-2 mt-4">
                {selectedCalendarAppointment.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleCancelAppointment(selectedCalendarAppointment._id);
                      setSelectedCalendarAppointment(null);
                    }}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm sm:text-base"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical History Modal */}
      {showMedicalHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[var(--background-900)] rounded-xl p-4 sm:p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl sm:text-2xl font-semibold">
                Medical History - {selectedCalendarAppointment.patientName || selectedCalendarAppointment.patient?.name}
              </h3>
              <button
                onClick={() => {
                  setShowMedicalHistoryModal(false);
                  setMedicalHistoryActiveTab('conditions');
                  setShowAddEntryForm(false);
                  setNewMedicalEntry({});
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            {medicalHistoryError && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700">
                {medicalHistoryError}
              </div>
            )}

            {loadingMedicalHistory ? (
              <div className="flex justify-center items-center p-12">
                <FaSpinner className="w-8 h-8 animate-spin text-[var(--primary-500)]" />
              </div>
            ) : (
              <>
                {/* Medical History Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 border-b pb-3">
                  <button
                    onClick={() => setMedicalHistoryActiveTab('conditions')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      medicalHistoryActiveTab === 'conditions'
                        ? 'bg-[var(--primary-500)] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Conditions
                  </button>
                  <button
                    onClick={() => setMedicalHistoryActiveTab('medications')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      medicalHistoryActiveTab === 'medications'
                        ? 'bg-[var(--primary-500)] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Medications
                  </button>
                  <button
                    onClick={() => setMedicalHistoryActiveTab('allergies')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      medicalHistoryActiveTab === 'allergies'
                        ? 'bg-[var(--primary-500)] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Allergies
                  </button>
                  <button
                    onClick={() => setMedicalHistoryActiveTab('vitals')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      medicalHistoryActiveTab === 'vitals'
                        ? 'bg-[var(--primary-500)] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Vitals
                  </button>
                  <button
                    onClick={() => setMedicalHistoryActiveTab('notes')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      medicalHistoryActiveTab === 'notes'
                        ? 'bg-[var(--primary-500)] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Notes
                  </button>
                </div>

                {/* Medical History Content */}
                <div className="space-y-4">
                  {/* Header with add button */}
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">
                      {medicalHistoryActiveTab === 'conditions' && 'Medical Conditions'}
                      {medicalHistoryActiveTab === 'medications' && 'Medications'}
                      {medicalHistoryActiveTab === 'allergies' && 'Allergies'}
                      {medicalHistoryActiveTab === 'vitals' && 'Vital Signs'}
                      {medicalHistoryActiveTab === 'notes' && 'Medical Notes'}
                    </h4>
                    <button
                      onClick={() => setShowAddEntryForm(true)}
                      className="px-3 py-1.5 bg-[var(--primary-500)] text-white rounded-lg hover:bg-[var(--primary-600)] inline-flex items-center"
                    >
                      <FaPlus className="mr-2" /> 
                      Add New Entry
                    </button>
                  </div>

                  {/* Add Entry Form */}
                  {showAddEntryForm && (
                    <div className="border rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-800">
                      <h5 className="font-medium mb-3">Add New {medicalHistoryActiveTab.slice(0, -1)}</h5>
                      
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleAddMedicalEntry(medicalHistoryActiveTab);
                      }} className="space-y-3">
                        {/* Conditions Form */}
                        {medicalHistoryActiveTab === 'conditions' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium mb-1">Condition Name</label>
                              <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={newMedicalEntry.name || ''}
                                onChange={(e) => setNewMedicalEntry({...newMedicalEntry, name: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Diagnosed Date</label>
                              <input
                                type="date"
                                className="w-full p-2 border rounded-lg"
                                value={newMedicalEntry.diagnosedDate || ''}
                                onChange={(e) => setNewMedicalEntry({...newMedicalEntry, diagnosedDate: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Status</label>
                              <select 
                                className="w-full p-2 border rounded-lg"
                                value={newMedicalEntry.status || 'Active'}
                                onChange={(e) => setNewMedicalEntry({...newMedicalEntry, status: e.target.value})}
                                required
                              >
                                <option value="Active">Active</option>
                                <option value="Managed">Managed</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                            </div>
                          </>
                        )}

                        {/* Medications Form */}
                        {medicalHistoryActiveTab === 'medications' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium mb-1">Medication Name</label>
                              <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={newMedicalEntry.name || ''}
                                onChange={(e) => setNewMedicalEntry({...newMedicalEntry, name: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Dosage</label>
                              <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={newMedicalEntry.dosage || ''}
                                onChange={(e) => setNewMedicalEntry({...newMedicalEntry, dosage: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Frequency</label>
                              <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={newMedicalEntry.frequency || ''}
                                onChange={(e) => setNewMedicalEntry({...newMedicalEntry, frequency: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Start Date</label>
                              <input
                                type="date"
                                className="w-full p-2 border rounded-lg"
                                value={newMedicalEntry.startDate || ''}
                                onChange={(e) => setNewMedicalEntry({...newMedicalEntry, startDate: e.target.value})}
                                required
                              />
                            </div>
                          </>
                        )}

                        {/* Allergies Form */}
                        {medicalHistoryActiveTab === 'allergies' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium mb-1">Allergen</label>
                              <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={newMedicalEntry.allergen || ''}
                                onChange={(e) => setNewMedicalEntry({...newMedicalEntry, allergen: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Severity</label>
                              <select 
                                className="w-full p-2 border rounded-lg"
                                value={newMedicalEntry.severity || 'Mild'}
                                onChange={(e) => setNewMedicalEntry({...newMedicalEntry, severity: e.target.value})}
                                required
                              >
                                <option value="Mild">Mild</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Severe">Severe</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Reaction</label>
                              <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={newMedicalEntry.reaction || ''}
                                onChange={(e) => setNewMedicalEntry({...newMedicalEntry, reaction: e.target.value})}
                              />
                            </div>
                          </>
                        )}

                        {/* Vitals Form */}
                        {medicalHistoryActiveTab === 'vitals' && (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">Blood Pressure (Systolic)</label>
                                <input
                                  type="number"
                                  className="w-full p-2 border rounded-lg"
                                  value={newMedicalEntry.bloodPressure?.systolic || ''}
                                  onChange={(e) => setNewMedicalEntry({
                                    ...newMedicalEntry, 
                                    bloodPressure: {
                                      ...newMedicalEntry.bloodPressure,
                                      systolic: e.target.value
                                    }
                                  })}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Blood Pressure (Diastolic)</label>
                                <input
                                  type="number"
                                  className="w-full p-2 border rounded-lg"
                                  value={newMedicalEntry.bloodPressure?.diastolic || ''}
                                  onChange={(e) => setNewMedicalEntry({
                                    ...newMedicalEntry, 
                                    bloodPressure: {
                                      ...newMedicalEntry.bloodPressure,
                                      diastolic: e.target.value
                                    }
                                  })}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">Heart Rate (bpm)</label>
                                <input
                                  type="number"
                                  className="w-full p-2 border rounded-lg"
                                  value={newMedicalEntry.heartRate || ''}
                                  onChange={(e) => setNewMedicalEntry({...newMedicalEntry, heartRate: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Temperature (°C)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  className="w-full p-2 border rounded-lg"
                                  value={newMedicalEntry.temperature || ''}
                                  onChange={(e) => setNewMedicalEntry({...newMedicalEntry, temperature: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  className="w-full p-2 border rounded-lg"
                                  value={newMedicalEntry.weight || ''}
                                  onChange={(e) => setNewMedicalEntry({...newMedicalEntry, weight: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Height (cm)</label>
                                <input
                                  type="number"
                                  className="w-full p-2 border rounded-lg"
                                  value={newMedicalEntry.height || ''}
                                  onChange={(e) => setNewMedicalEntry({...newMedicalEntry, height: e.target.value})}
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Notes Form */}
                        {medicalHistoryActiveTab === 'notes' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium mb-1">Note Type</label>
                              <select 
                                className="w-full p-2 border rounded-lg"
                                value={newMedicalEntry.type || 'General'}
                                onChange={(e) => setNewMedicalEntry({...newMedicalEntry, type: e.target.value})}
                                required
                              >
                                <option value="General">General</option>
                                <option value="Treatment">Treatment</option>
                                <option value="Observation">Observation</option>
                                <option value="Follow-up">Follow-up</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Content</label>
                              <textarea
                                className="w-full p-2 border rounded-lg"
                                rows="4"
                                value={newMedicalEntry.content || ''}
                                onChange={(e) => setNewMedicalEntry({...newMedicalEntry, content: e.target.value})}
                                required
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                          <textarea
                            className="w-full p-2 border rounded-lg"
                            rows="2"
                            value={newMedicalEntry.notes || ''}
                            onChange={(e) => setNewMedicalEntry({...newMedicalEntry, notes: e.target.value})}
                          />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddEntryForm(false);
                              setNewMedicalEntry({});
                            }}
                            className="px-3 py-1.5 border rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-[var(--primary-500)] text-white rounded-lg hover:bg-[var(--primary-600)]"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Display Medical History Data */}
                  <div className="border rounded-lg overflow-hidden">
                    {/* Conditions */}
                    {medicalHistoryActiveTab === 'conditions' && (
                      <div className="divide-y">
                        {!patientMedicalHistory?.conditions?.length ? (
                          <div className="p-4 text-gray-500 text-center">No medical conditions recorded</div>
                        ) : (
                          patientMedicalHistory.conditions.map((condition, index) => (
                            <div key={index} className="p-4">
                              <h5 className="font-medium">{condition.name}</h5>
                              <div className="text-sm text-gray-600 grid grid-cols-2 gap-2 mt-2">
                                <div>
                                  <span className="font-medium">Diagnosed:</span> {format(new Date(condition.diagnosedDate), 'PP')}
                                </div>
                                <div>
                                  <span className="font-medium">Status:</span> {condition.status}
                                </div>
                                {condition.notes && (
                                  <div className="col-span-2">
                                    <span className="font-medium">Notes:</span> {condition.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Medications */}
                    {medicalHistoryActiveTab === 'medications' && (
                      <div className="divide-y">
                        {!patientMedicalHistory?.medications?.length ? (
                          <div className="p-4 text-gray-500 text-center">No medications recorded</div>
                        ) : (
                          patientMedicalHistory.medications.map((medication, index) => (
                            <div key={index} className="p-4">
                              <h5 className="font-medium">{medication.name}</h5>
                              <div className="text-sm text-gray-600 grid grid-cols-2 gap-2 mt-2">
                                <div>
                                  <span className="font-medium">Dosage:</span> {medication.dosage}
                                </div>
                                <div>
                                  <span className="font-medium">Frequency:</span> {medication.frequency}
                                </div>
                                <div>
                                  <span className="font-medium">Start Date:</span> {format(new Date(medication.startDate), 'PP')}
                                </div>
                                {medication.endDate && (
                                  <div>
                                    <span className="font-medium">End Date:</span> {format(new Date(medication.endDate), 'PP')}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Status:</span> {medication.status}
                                </div>
                                {medication.notes && (
                                  <div className="col-span-2">
                                    <span className="font-medium">Notes:</span> {medication.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Allergies */}
                    {medicalHistoryActiveTab === 'allergies' && (
                      <div className="divide-y">
                        {!patientMedicalHistory?.allergies?.length ? (
                          <div className="p-4 text-gray-500 text-center">No allergies recorded</div>
                        ) : (
                          patientMedicalHistory.allergies.map((allergy, index) => (
                            <div key={index} className="p-4">
                              <h5 className="font-medium">{allergy.allergen}</h5>
                              <div className="text-sm text-gray-600 grid grid-cols-2 gap-2 mt-2">
                                <div>
                                  <span className="font-medium">Severity:</span> {allergy.severity}
                                </div>
                                {allergy.reaction && (
                                  <div>
                                    <span className="font-medium">Reaction:</span> {allergy.reaction}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Vitals */}
                    {medicalHistoryActiveTab === 'vitals' && (
                      <div className="divide-y">
                        {!patientMedicalHistory?.vitals?.length ? (
                          <div className="p-4 text-gray-500 text-center">No vital signs recorded</div>
                        ) : (
                          patientMedicalHistory.vitals.map((vital, index) => (
                            <div key={index} className="p-4">
                              <h5 className="font-medium">
                                Recorded on {format(new Date(vital.date), 'PP')}
                              </h5>
                              <div className="text-sm text-gray-600 grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                {vital.bloodPressure && (
                                  <div>
                                    <span className="font-medium">Blood Pressure:</span> {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}
                                  </div>
                                )}
                                {vital.heartRate && (
                                  <div>
                                    <span className="font-medium">Heart Rate:</span> {vital.heartRate} bpm
                                  </div>
                                )}
                                {vital.temperature && (
                                  <div>
                                    <span className="font-medium">Temperature:</span> {vital.temperature}°C
                                  </div>
                                )}
                                {vital.weight && (
                                  <div>
                                    <span className="font-medium">Weight:</span> {vital.weight} kg
                                  </div>
                                )}
                                {vital.height && (
                                  <div>
                                    <span className="font-medium">Height:</span> {vital.height} cm
                                  </div>
                                )}
                                {vital.notes && (
                                  <div className="col-span-2 sm:col-span-3">
                                    <span className="font-medium">Notes:</span> {vital.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {medicalHistoryActiveTab === 'notes' && (
                      <div className="divide-y">
                        {!patientMedicalHistory?.notes?.length ? (
                          <div className="p-4 text-gray-500 text-center">No medical notes recorded</div>
                        ) : (
                          patientMedicalHistory.notes.map((note, index) => (
                            <div key={index} className="p-4">
                              <div className="flex justify-between items-start">
                                <h5 className="font-medium">
                                  {note.type} Note - {format(new Date(note.date), 'PP')}
                                </h5>
                                <div className="text-sm text-gray-500">
                                  {note.author?.name || 'Unknown Doctor'}
                                </div>
                              </div>
                              <div className="mt-2 text-gray-600 whitespace-pre-wrap">
                                {note.content}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;
