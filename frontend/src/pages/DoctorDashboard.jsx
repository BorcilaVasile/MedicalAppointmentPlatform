import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaCalendarCheck, FaCalendarTimes, FaFileMedical, FaStethoscope, FaSpinner, FaClock, FaBan, FaTimes } from 'react-icons/fa';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { enUS } from 'date-fns/locale';

function DoctorDashboard() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [referral, setReferral] = useState({
    specialty: '',
    reason: '',
    urgency: 'normal'
  });
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
      const response = await fetch(
        'http://localhost:5000/api/doctors/me/appointments',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Eroare la preluarea programărilor');
      }

      const data = await response.json();
      // Filtrăm programările pentru săptămâna curentă
      const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
      
      const filteredAppointments = data.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= start && appointmentDate <= end;
      });
      
      setAppointments(filteredAppointments);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkUnavailable = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/doctors/me/unavailable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUnavailable)
      });

      if (!response.ok) {
        throw new Error('Eroare la marcarea intervalelor ca indisponibile');
      }

      const data = await response.json();
      setUnavailableSlots(data.unavailableSlots);
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
      const response = await fetch(`http://localhost:5000/api/doctors/me/unavailable/${slotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Eroare la ștergerea intervalului');
      }

      const data = await response.json();
      setUnavailableSlots(data.unavailableSlots);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Sigur doriți să anulați această programare?')) return;

    try {
      // Prima dată anulăm programarea
      const response = await fetch(`http://localhost:5000/api/doctors/appointments/${appointmentId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!response.ok) {
        throw new Error('Eroare la anularea programării');
      }

      const { appointment } = await response.json();

      // Actualizăm lista de programări local
      const updatedAppointments = appointments.map(app => 
        app._id === appointmentId ? { ...app, status: 'cancelled' } : app
      );
      setAppointments(updatedAppointments);

      // Creăm notificarea pentru pacient folosind ID-ul pacientului din răspunsul serverului
      const notificationResponse = await fetch('http://localhost:5000/api/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: appointment.patient,
          type: 'APPOINTMENT_CANCELLED',
          appointment: appointmentId,
          message: `Your appointment for ${format(new Date(appointment.date), 'MMMM d, yyyy')} at ${appointment.time} has been cancelled by the doctor.`
        })
      });

      if (!notificationResponse.ok) {
        console.error('Failed to create notification for patient');
      }

    } catch (err) {
      console.error('Error in handleCancelAppointment:', err);
      setError(err.message);
    }
  };

  const handleAddDiagnosis = async (appointmentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctors/appointments/${appointmentId}/diagnosis`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ diagnosis })
      });

      if (!response.ok) {
        throw new Error('Eroare la adăugarea diagnosticului');
      }

      // Actualizează lista de programări
      setAppointments(appointments.map(app => 
        app._id === appointmentId ? { ...app, diagnosis } : app
      ));
      setDiagnosis('');
      setSelectedAppointment(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddReferral = async (appointmentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctors/appointments/${appointmentId}/referral`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(referral)
      });

      if (!response.ok) {
        throw new Error('Eroare la adăugarea trimiterii');
      }

      // Actualizează lista de programări
      setAppointments(appointments.map(app => 
        app._id === appointmentId ? { ...app, referral } : app
      ));
      setReferral({ specialty: '', reason: '', urgency: 'normal' });
      setSelectedAppointment(null);
    } catch (err) {
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
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)] mb-8">
          Doctor Dashboard
        </h1>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-[var(--error-50)] dark:bg-[var(--error-900)] text-[var(--error-600)] dark:text-[var(--error-200)]">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'calendar'
                ? 'bg-[var(--primary-500)] text-white'
                : 'bg-[var(--background-100)] dark:bg-[var(--background-800)] text-[var(--text-700)] dark:text-[var(--text-300)]'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('diagnoses')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'diagnoses'
                ? 'bg-[var(--primary-500)] text-white'
                : 'bg-[var(--background-100)] dark:bg-[var(--background-800)] text-[var(--text-700)] dark:text-[var(--text-300)]'
            }`}
          >
            Diagnoses
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'referrals'
                ? 'bg-[var(--primary-500)] text-white'
                : 'bg-[var(--background-100)] dark:bg-[var(--background-800)] text-[var(--text-700)] dark:text-[var(--text-300)]'
            }`}
          >
            Referrals
          </button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-[var(--background-900)] rounded-xl shadow-sm p-6">
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              {/* Week Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                  className="p-2 text-[var(--text-600)] hover:text-[var(--primary-500)]"
                >
                  ← Previous Week
                </button>
                <span className="font-medium">
                  {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd MMMM', { locale: enUS })} - 
                  {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd MMMM yyyy', { locale: enUS })}
                </span>
                <button
                  onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                  className="p-2 text-[var(--text-600)] hover:text-[var(--primary-500)]"
                >
                  Next Week →
                </button>
              </div>

              {/* Weekly Calendar */}
              <div className="grid grid-cols-7 gap-4">
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
                      
                      {dayAppointments.map(app => (
                        <div
                          key={app._id}
                          onClick={() => setSelectedCalendarAppointment(app)}
                          className={`p-2 mb-2 rounded text-sm cursor-pointer hover:opacity-80 transition-opacity ${
                            app.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            app.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          <div className="font-medium">{app.time}</div>
                          <div>{app.patientName}</div>
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
                className="mt-4 px-4 py-2 bg-[var(--primary-500)] text-white rounded-lg hover:bg-[var(--primary-600)]"
              >
                <FaBan className="inline-block mr-2" />
                Mark Unavailable Slots
              </button>

              {/* Unavailable Form Modal */}
              {showUnavailableForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white dark:bg-[var(--background-900)] rounded-xl p-6 max-w-md w-full">
                    <h3 className="text-xl font-semibold mb-4">
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
                          <div className="grid grid-cols-4 gap-2">
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
                          className="px-4 py-2 border rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[var(--primary-500)] text-white rounded"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-[var(--background-900)] rounded-xl p-6 max-w-2xl w-full m-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold">
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
                      <div className="bg-gray-50 dark:bg-[var(--background-800)] p-4 rounded-lg">
                        <h4 className="font-medium text-lg mb-2">Patient Information</h4>
                        <p><span className="font-medium">Name:</span> {selectedCalendarAppointment.patientName}</p>
                        <p><span className="font-medium">Email:</span> {selectedCalendarAppointment.patientEmail}</p>
                        <p><span className="font-medium">Phone:</span> {selectedCalendarAppointment.patientPhone}</p>
                      </div>

                      {/* Appointment Information */}
                      <div className="bg-gray-50 dark:bg-[var(--background-800)] p-4 rounded-lg">
                        <h4 className="font-medium text-lg mb-2">Appointment Information</h4>
                        <p><span className="font-medium">Date:</span> {format(new Date(selectedCalendarAppointment.date), 'MMMM d, yyyy')}</p>
                        <p><span className="font-medium">Time:</span> {selectedCalendarAppointment.time}</p>
                        <p><span className="font-medium">Status:</span> 
                          <span className={`ml-2 inline-block px-2 py-1 rounded-full text-sm ${
                            selectedCalendarAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            selectedCalendarAppointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedCalendarAppointment.status}
                          </span>
                        </p>
                        <p><span className="font-medium">Reason:</span> {selectedCalendarAppointment.reason}</p>
                        {selectedCalendarAppointment.diagnosis && (
                          <p><span className="font-medium">Diagnosis:</span> {selectedCalendarAppointment.diagnosis}</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-2 mt-4">
                        {selectedCalendarAppointment.status === 'pending' && (
                          <button
                            onClick={() => {
                              handleCancelAppointment(selectedCalendarAppointment._id);
                              setSelectedCalendarAppointment(null);
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Cancel Appointment
                          </button>
                        )}
                        <a
                          href={`/medical-history/${selectedCalendarAppointment.patient}`}
                          className="px-4 py-2 bg-[var(--primary-500)] text-white rounded hover:bg-[var(--primary-600)] inline-flex items-center"
                        >
                          <FaFileMedical className="mr-2" />
                          View Medical History
                        </a>
                        <button
                          onClick={() => {
                            setSelectedAppointment(selectedCalendarAppointment);
                            setSelectedCalendarAppointment(null);
                            setActiveTab('diagnoses');
                          }}
                          className="px-4 py-2 bg-[var(--primary-500)] text-white rounded hover:bg-[var(--primary-600)]"
                        >
                          Add Diagnosis
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(selectedCalendarAppointment);
                            setSelectedCalendarAppointment(null);
                            setActiveTab('referrals');
                          }}
                          className="px-4 py-2 bg-[var(--primary-500)] text-white rounded hover:bg-[var(--primary-600)]"
                        >
                          Add Referral
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'diagnoses' && selectedAppointment && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Add Diagnosis</h2>
              <div className="bg-gray-50 dark:bg-[var(--background-800)] p-4 rounded-lg">
                <p className="font-medium">{selectedAppointment.patientName}</p>
                <p className="text-[var(--text-600)]">{selectedAppointment.date} at {selectedAppointment.time}</p>
                <p className="text-[var(--text-600)]">Reason: {selectedAppointment.reason}</p>
              </div>
              <form onSubmit={handleAddDiagnosis} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Diagnosis</label>
                  <textarea
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full p-2 border rounded"
                    rows="4"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAppointment(null);
                      setDiagnosis('');
                      setActiveTab('calendar');
                    }}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[var(--primary-500)] text-white rounded"
                  >
                    Save Diagnosis
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'referrals' && selectedAppointment && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Add Referral</h2>
              <div className="bg-gray-50 dark:bg-[var(--background-800)] p-4 rounded-lg">
                <p className="font-medium">{selectedAppointment.patientName}</p>
                <p className="text-[var(--text-600)]">{selectedAppointment.date} at {selectedAppointment.time}</p>
                <p className="text-[var(--text-600)]">Reason: {selectedAppointment.reason}</p>
              </div>
              <form onSubmit={handleAddReferral} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Specialty</label>
                  <input
                    type="text"
                    value={referral.specialty}
                    onChange={(e) => setReferral({ ...referral, specialty: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reason</label>
                  <textarea
                    value={referral.reason}
                    onChange={(e) => setReferral({ ...referral, reason: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows="4"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Urgency</label>
                  <select
                    value={referral.urgency}
                    onChange={(e) => setReferral({ ...referral, urgency: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAppointment(null);
                      setReferral({
                        specialty: '',
                        reason: '',
                        urgency: 'normal'
                      });
                      setActiveTab('calendar');
                    }}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[var(--primary-500)] text-white rounded"
                  >
                    Save Referral
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard; 