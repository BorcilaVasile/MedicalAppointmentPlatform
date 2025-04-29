import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaSpinner, FaFileMedical, FaUser, FaNotesMedical, FaAllergies, FaHistory, FaChevronDown, FaChevronUp, FaPills, FaProcedures, FaUsers, FaHeartbeat, FaFileAlt, FaRunning, FaPlus } from 'react-icons/fa';
import { format } from 'date-fns';
import { apiClient } from '../config/api';

function DoctorPatients() {
  const { token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [loadingMedicalHistory, setLoadingMedicalHistory] = useState(false);
  const [medicalHistoryError, setMedicalHistoryError] = useState(null);
  const [activeHistoryTab, setActiveHistoryTab] = useState('conditions');
  const [showAddEntryForm, setShowAddEntryForm] = useState(false);
  const [newMedicalEntry, setNewMedicalEntry] = useState({});

  useEffect(() => {
    fetchPastAppointments();
  }, []);

  const fetchPastAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/doctor-appointments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const now = new Date();
      const pastAppointments = response.data.appointments.filter(appointment => {
        if (!appointment.date || isNaN(new Date(appointment.date).getTime())) {
          console.error('Invalid date in appointment:', appointment);
          return false;
        }

        const appointmentDate = new Date(appointment.date);
        const appointmentTime = appointment.time?.split(':');
        if (appointmentTime?.length === 2 && !isNaN(appointmentTime[0]) && !isNaN(appointmentTime[1])) {
          appointmentDate.setHours(parseInt(appointmentTime[0]), parseInt(appointmentTime[1]));
        } else {
          console.error('Invalid time format in appointment:', appointment.time);
          return false;
        }

        return (
          appointmentDate < now &&
          (appointment.status === 'confirmed' || appointment.status === 'managed')
        );
      });

      const uniquePatients = [];
      const patientIds = new Set();
      pastAppointments.forEach(appointment => {
        const patient = appointment.patient;
        if (patient && !patientIds.has(patient._id)) {
          patientIds.add(patient._id);
          uniquePatients.push({
            ...patient,
            appointments: pastAppointments.filter(app => app.patient._id === patient._id)
          });
        }
      });

      setPatients(uniquePatients);
      setError(null);
    } catch (err) {
      console.error('Error fetching past appointments:', err);
      setError(err.message || 'Failed to load past appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientMedicalHistory = async (patientId) => {
    if (!patientId) return;
    try {
      setLoadingMedicalHistory(true);
      setMedicalHistoryError(null);
      const response = await apiClient.get(`/api/medical-history/${patientId}`, {
        params: { patientId }
      });
      setMedicalHistory(response.data);
    } catch (err) {
      console.error('Error fetching medical history:', err);
      setMedicalHistoryError(err.message || 'Failed to load medical history');
    } finally {
      setLoadingMedicalHistory(false);
    }
  };

  const handleViewMedicalHistory = (patient) => {
    if (selectedPatient?._id === patient._id) {
      setSelectedPatient(null);
      setMedicalHistory(null);
      setActiveHistoryTab('conditions');
      setShowAddEntryForm(false);
      setNewMedicalEntry({});
    } else {
      setSelectedPatient(patient);
      fetchPatientMedicalHistory(patient._id);
      setActiveHistoryTab('conditions');
      setShowAddEntryForm(false);
      setNewMedicalEntry({});
    }
  };

  const handleAddMedicalEntry = async (type) => {
    const patientId = selectedPatient?._id;
    if (!patientId) {
      setMedicalHistoryError('Could not determine patient ID');
      return;
    }

    try {
      setMedicalHistoryError(null);

      const entryData = type === 'notes'
        ? { ...newMedicalEntry, author: token.id }
        : newMedicalEntry;

      const endpoint = `/api/medical-history/${patientId}/${type}`;
      const response = await apiClient.post(endpoint, entryData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 200) {
        try {
          await apiClient.post('/api/notifications', {
            recipient: patientId,
            recipientType: 'Patient',
            sender: token.id,
            senderType: 'Doctor',
            type: 'MEDICAL_HISTORY_UPDATE',
            message: `A new ${type.slice(0, -1)} entry has been added to your medical history by your doctor.`,
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
        } catch (notificationError) {
          console.error('Failed to create notification for patient:', notificationError);
        }
      }

      await fetchPatientMedicalHistory(patientId);
      setNewMedicalEntry({});
      setShowAddEntryForm(false);
    } catch (err) {
      console.error('Error adding medical entry:', err);
      setMedicalHistoryError(err.message || 'Failed to add entry');
    }
  };

  const formatDate = (date) => {
    return date && !isNaN(new Date(date).getTime())
      ? format(new Date(date), 'MMM d, yyyy')
      : 'Unknown Date';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-900)] flex justify-center items-center">
        <FaSpinner className="w-8 h-8 animate-spin text-[var(--primary-500)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-900)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[var(--background-100)] dark:bg-[var(--background-800)] shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--background-200)] dark:border-[var(--background-700)]">
            <h2 className="text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-50)] flex items-center">
              <FaUser className="mr-2 text-[var(--primary-500)]" />
              Past Patients
            </h2>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900 border-l-4 border-red-500">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {patients.length === 0 ? (
            <div className="p-6 text-center text-[var(--text-500)] dark:text-[var(--text-400)]">
              <p className="text-lg">No past patients found.</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {patients.map(patient => (
                <div
                  key={patient._id}
                  className="bg-[var(--background-200)] dark:bg-[var(--background-700)] rounded-lg shadow-sm p-5"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FaUser className="h-6 w-6 text-[var(--primary-500)] mr-3" />
                      <h3 className="text-xl font-semibold text-[var(--text-900)] dark:text-[var(--text-50)]">
                        {patient.name || 'Unknown Patient'}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleViewMedicalHistory(patient)}
                      className="px-4 py-2 bg-[var(--primary-500)] text-white rounded-md hover:bg-[var(--primary-600)] flex items-center transition-colors"
                    >
                      <FaFileMedical className="mr-2" />
                      {selectedPatient?._id === patient._id ? 'Hide History' : 'View History'}
                      {selectedPatient?._id === patient._id ? (
                        <FaChevronUp className="ml-2" />
                      ) : (
                        <FaChevronDown className="ml-2" />
                      )}
                    </button>
                  </div>

                  {selectedPatient?._id === patient._id && (
                    <div className="mt-6">
                      {loadingMedicalHistory ? (
                        <div className="flex justify-center">
                          <FaSpinner className="w-6 h-6 animate-spin text-[var(--primary-500)]" />
                        </div>
                      ) : medicalHistoryError ? (
                        <div className="p-4 bg-red-50 dark:bg-red-900 border-l-4 border-red-500">
                          <p className="text-red-700 dark:text-red-200">{medicalHistoryError}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-wrap border-b border-[var(--background-300)] dark:border-[var(--background-600)]">
                            <button
                              onClick={() => setActiveHistoryTab('conditions')}
                              className={`px-4 py-2 text-sm font-medium flex items-center ${
                                activeHistoryTab === 'conditions'
                                  ? 'border-b-2 border-[var(--primary-500)] text-[var(--primary-500)]'
                                  : 'text-[var(--text-700)] dark:text-[var(--text-300)] hover:text-[var(--primary-500)]'
                              }`}
                            >
                              <FaNotesMedical className="mr-2" />
                              Conditions
                            </button>
                            <button
                              onClick={() => setActiveHistoryTab('allergies')}
                              className={`px-4 py-2 text-sm font-medium flex items-center ${
                                activeHistoryTab === 'allergies'
                                  ? 'border-b-2 border-[var(--primary-500)] text-[var(--primary-500)]'
                                  : 'text-[var(--text-700)] dark:text-[var(--text-300)] hover:text-[var(--primary-500)]'
                              }`}
                            >
                              <FaAllergies className="mr-2" />
                              Allergies
                            </button>
                            <button
                              onClick={() => setActiveHistoryTab('medications')}
                              className={`px-4 py-2 text-sm font-medium flex items-center ${
                                activeHistoryTab === 'medications'
                                  ? 'border-b-2 border-[var(--primary-500)] text-[var(--primary-500)]'
                                  : 'text-[var(--text-700)] dark:text-[var(--text-300)] hover:text-[var(--primary-500)]'
                              }`}
                            >
                              <FaPills className="mr-2" />
                              Medications
                            </button>
                            <button
                              onClick={() => setActiveHistoryTab('surgeries')}
                              className={`px-4 py-2 text-sm font-medium flex items-center ${
                                activeHistoryTab === 'surgeries'
                                  ? 'border-b-2 border-[var(--primary-500)] text-[var(--primary-500)]'
                                  : 'text-[var(--text-700)] dark:text-[var(--text-300)] hover:text-[var(--primary-500)]'
                              }`}
                            >
                              <FaProcedures className="mr-2" />
                              Surgeries
                            </button>
                            <button
                              onClick={() => setActiveHistoryTab('familyHistory')}
                              className={`px-4 py-2 text-sm font-medium flex items-center ${
                                activeHistoryTab === 'familyHistory'
                                  ? 'border-b-2 border-[var(--primary-500)] text-[var(--primary-500)]'
                                  : 'text-[var(--text-700)] dark:text-[var(--text-300)] hover:text-[var(--primary-500)]'
                              }`}
                            >
                              <FaUsers className="mr-2" />
                              Family History
                            </button>
                            <button
                              onClick={() => setActiveHistoryTab('lifestyle')}
                              className={`px-4 py-2 text-sm font-medium flex items-center ${
                                activeHistoryTab === 'lifestyle'
                                  ? 'border-b-2 border-[var(--primary-500)] text-[var(--primary-500)]'
                                  : 'text-[var(--text-700)] dark:text-[var(--text-300)] hover:text-[var(--primary-500)]'
                              }`}
                            >
                              <FaRunning className="mr-2" />
                              Lifestyle
                            </button>
                            <button
                              onClick={() => setActiveHistoryTab('vitals')}
                              className={`px-4 py-2 text-sm font-medium flex items-center ${
                                activeHistoryTab === 'vitals'
                                  ? 'border-b-2 border-[var(--primary-500)] text-[var(--primary-500)]'
                                  : 'text-[var(--text-700)] dark:text-[var(--text-300)] hover:text-[var(--primary-500)]'
                              }`}
                            >
                              <FaHeartbeat className="mr-2" />
                              Vitals
                            </button>
                            <button
                              onClick={() => setActiveHistoryTab('documents')}
                              className={`px-4 py-2 text-sm font-medium flex items-center ${
                                activeHistoryTab === 'documents'
                                  ? 'border-b-2 border-[var(--primary-500)] text-[var(--primary-500)]'
                                  : 'text-[var(--text-700)] dark:text-[var(--text-300)] hover:text-[var(--primary-500)]'
                              }`}
                            >
                              <FaFileAlt className="mr-2" />
                              Documents
                            </button>
                            <button
                              onClick={() => setActiveHistoryTab('notes')}
                              className={`px-4 py-2 text-sm font-medium flex items-center ${
                                activeHistoryTab === 'notes'
                                  ? 'border-b-2 border-[var(--primary-500)] text-[var(--primary-500)]'
                                  : 'text-[var(--text-700)] dark:text-[var(--text-300)] hover:text-[var(--primary-500)]'
                              }`}
                            >
                              <FaNotesMedical className="mr-2" />
                              Notes
                            </button>
                            <button
                              onClick={() => setActiveHistoryTab('appointments')}
                              className={`px-4 py-2 text-sm font-medium flex items-center ${
                                activeHistoryTab === 'appointments'
                                  ? 'border-b-2 border-[var(--primary-500)] text-[var(--primary-500)]'
                                  : 'text-[var(--text-700)] dark:text-[var(--text-300)] hover:text-[var(--primary-500)]'
                              }`}
                            >
                              <FaHistory className="mr-2" />
                              Past Appointments
                            </button>
                          </div>

                          <div className="p-4 bg-[var(--background-100)] dark:bg-[var(--background-800)] rounded-lg">
                            {activeHistoryTab !== 'lifestyle' && activeHistoryTab !== 'appointments' && (
                              <div className="flex justify-end mb-4">
                                <button
                                  onClick={() => setShowAddEntryForm(true)}
                                  className="px-3 py-1.5 bg-[var(--primary-500)] text-white rounded-md hover:bg-[var(--primary-600)] flex items-center transition-colors"
                                >
                                  <FaPlus className="mr-2" />
                                  Add New Entry
                                </button>
                              </div>
                            )}

                            {showAddEntryForm && activeHistoryTab !== 'lifestyle' && activeHistoryTab !== 'appointments' && (
                              <div className="border rounded-lg p-4 mb-4 bg-[var(--background-200)] dark:bg-[var(--background-700)]">
                                <h5 className="font-medium mb-3 text-[var(--text-900)] dark:text-[var(--text-50)]">
                                  Add New {activeHistoryTab.slice(0, -1)}
                                </h5>
                                <form onSubmit={(e) => {
                                  e.preventDefault();
                                  handleAddMedicalEntry(activeHistoryTab);
                                }} className="space-y-3">
                                  {activeHistoryTab === 'conditions' && (
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
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                                        <textarea
                                          className="w-full p-2 border rounded-lg"
                                          rows="2"
                                          value={newMedicalEntry.notes || ''}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, notes: e.target.value})}
                                        />
                                      </div>
                                    </>
                                  )}

                                  {activeHistoryTab === 'allergies' && (
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
                                        <label className="block text-sm font-medium mb-1">Reaction (Optional)</label>
                                        <input
                                          type="text"
                                          className="w-full p-2 border rounded-lg"
                                          value={newMedicalEntry.reaction || ''}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, reaction: e.target.value})}
                                        />
                                      </div>
                                    </>
                                  )}

                                  {activeHistoryTab === 'medications' && (
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
                                      <div>
                                        <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
                                        <input
                                          type="date"
                                          className="w-full p-2 border rounded-lg"
                                          value={newMedicalEntry.endDate || ''}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, endDate: e.target.value})}
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
                                          <option value="Discontinued">Discontinued</option>
                                          <option value="Completed">Completed</option>
                                        </select>
                                      </div>
                                    </>
                                  )}

                                  {activeHistoryTab === 'surgeries' && (
                                    <>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Procedure</label>
                                        <input
                                          type="text"
                                          className="w-full p-2 border rounded-lg"
                                          value={newMedicalEntry.procedure || ''}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, procedure: e.target.value})}
                                          required
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Date</label>
                                        <input
                                          type="date"
                                          className="w-full p-2 border rounded-lg"
                                          value={newMedicalEntry.date || ''}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, date: e.target.value})}
                                          required
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Hospital (Optional)</label>
                                        <input
                                          type="text"
                                          className="w-full p-2 border rounded-lg"
                                          value={newMedicalEntry.hospital || ''}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, hospital: e.target.value})}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Surgeon (Optional)</label>
                                        <input
                                          type="text"
                                          className="w-full p-2 border rounded-lg"
                                          value={newMedicalEntry.surgeon || ''}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, surgeon: e.target.value})}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                                        <textarea
                                          className="w-full p-2 border rounded-lg"
                                          rows="2"
                                          value={newMedicalEntry.notes || ''}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, notes: e.target.value})}
                                        />
                                      </div>
                                    </>
                                  )}

                                  {activeHistoryTab === 'familyHistory' && (
                                    <>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Condition</label>
                                        <input
                                          type="text"
                                          className="w-full p-2 border rounded-lg"
                                          value={newMedicalEntry.condition || ''}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, condition: e.target.value})}
                                          required
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Relationship (Optional)</label>
                                        <input
                                          type="text"
                                          className="w-full p-2 border rounded-lg"
                                          value={newMedicalEntry.relationship || ''}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, relationship: e.target.value})}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                                        <textarea
                                          className="w-full p-2 border rounded-lg"
                                          rows="2"
                                          value={newMedicalEntry.notes || ''}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, notes: e.target.value})}
                                        />
                                      </div>
                                    </>
                                  )}

                                  {activeHistoryTab === 'vitals' && (
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
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                                        <textarea
                                          className="w-full p-2 border rounded-lg"
                                          rows="2"
                                          value={newMedicalEntry.notes || ''}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, notes: e.target.value})}
                                        />
                                      </div>
                                    </>
                                  )}

                                  {activeHistoryTab === 'documents' && (
                                    <>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Title</label>
                                        <input
                                          type="text"
                                          className="w-full p-2 border rounded-lg"
                                          value={newMedicalEntry.title || ''}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, title: e.target.value})}
                                          required
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Type</label>
                                        <select
                                          className="w-full p-2 border rounded-lg"
                                          value={newMedicalEntry.type || 'Lab Result'}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, type: e.target.value})}
                                          required
                                        >
                                          <option value="Lab Result">Lab Result</option>
                                          <option value="Imaging">Imaging</option>
                                          <option value="Prescription">Prescription</option>
                                          <option value="Other">Other</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Date</label>
                                        <input
                                          type="date"
                                          className="w-full p-2 border rounded-lg"
                                          value={newMedicalEntry.date || ''}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, date: e.target.value})}
                                          required
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">File URL (Optional)</label>
                                        <input
                                          type="text"
                                          className="w-full p-2 border rounded-lg"
                                          value={newMedicalEntry.fileUrl || ''}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, fileUrl: e.target.value})}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                                        <textarea
                                          className="w-full p-2 border rounded-lg"
                                          rows="2"
                                          value={newMedicalEntry.notes || ''}
                                          onChange={(e) => setNewMedicalEntry({...newMedicalEntry, notes: e.target.value})}
                                        />
                                      </div>
                                    </>
                                  )}

                                  {activeHistoryTab === 'notes' && (
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

                                  <div className="flex justify-end gap-2 mt-4">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowAddEntryForm(false);
                                        setNewMedicalEntry({});
                                      }}
                                      className="px-3 py-1.5 border rounded-md text-[var(--text-700)] dark:text-[var(--text-300)] hover:bg-[var(--background-300)] dark:hover:bg-[var(--background-600)]"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      className="px-3 py-1.5 bg-[var(--primary-500)] text-white rounded-md hover:bg-[var(--primary-600)]"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </form>
                              </div>
                            )}

                            {activeHistoryTab === 'conditions' && (
                              <div>
                                <h4 className="text-lg font-medium text-[var(--text-900)] dark:text-[var(--text-50)] mb-3 flex items-center">
                                  <FaNotesMedical className="mr-2 text-[var(--primary-500)]" />
                                  Conditions
                                </h4>
                                {medicalHistory?.conditions?.length > 0 ? (
                                  <ul className="space-y-2">
                                    {medicalHistory.conditions.map((condition, index) => (
                                      <li
                                        key={index}
                                        className="p-3 bg-[var(--background-200)] dark:bg-[var(--background-700)] rounded-md"
                                      >
                                        <p><span className="font-semibold">{condition.name}</span></p>
                                        <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                          Diagnosed: {formatDate(condition.diagnosedDate)}
                                        </p>
                                        <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                          Status: {condition.status}
                                        </p>
                                        {condition.notes && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Notes: {condition.notes}
                                          </p>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">No conditions recorded.</p>
                                )}
                              </div>
                            )}

                            {activeHistoryTab === 'allergies' && (
                              <div>
                                <h4 className="text-lg font-medium text-[var(--text-900)] dark:text-[var(--text-50)] mb-3 flex items-center">
                                  <FaAllergies className="mr-2 text-[var(--primary-500)]" />
                                  Allergies
                                </h4>
                                {medicalHistory?.allergies?.length > 0 ? (
                                  <ul className="space-y-2">
                                    {medicalHistory.allergies.map((allergy, index) => (
                                      <li
                                        key={index}
                                        className="p-3 bg-[var(--background-200)] dark:bg-[var(--background-700)] rounded-md"
                                      >
                                        <p><span className="font-semibold">{allergy.allergen}</span></p>
                                        <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                          Severity: {allergy.severity}
                                        </p>
                                        {allergy.reaction && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Reaction: {allergy.reaction}
                                          </p>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">No allergies recorded.</p>
                                )}
                              </div>
                            )}

                            {activeHistoryTab === 'medications' && (
                              <div>
                                <h4 className="text-lg font-medium text-[var(--text-900)] dark:text-[var(--text-50)] mb-3 flex items-center">
                                  <FaPills className="mr-2 text-[var(--primary-500)]" />
                                  Medications
                                </h4>
                                {medicalHistory?.medications?.length > 0 ? (
                                  <ul className="space-y-2">
                                    {medicalHistory.medications.map((medication, index) => (
                                      <li
                                        key={index}
                                        className="p-3 bg-[var(--background-200)] dark:bg-[var(--background-700)] rounded-md"
                                      >
                                        <p><span className="font-semibold">{medication.name}</span></p>
                                        {medication.dosage && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Dosage: {medication.dosage}
                                          </p>
                                        )}
                                        {medication.frequency && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Frequency: {medication.frequency}
                                          </p>
                                        )}
                                        <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                          Start Date: {formatDate(medication.startDate)}
                                        </p>
                                        {medication.endDate && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            End Date: {formatDate(medication.endDate)}
                                          </p>
                                        )}
                                        <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                          Status: {medication.status}
                                        </p>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">No medications recorded.</p>
                                )}
                              </div>
                            )}

                            {activeHistoryTab === 'surgeries' && (
                              <div>
                                <h4 className="text-lg font-medium text-[var(--text-900)] dark:text-[var(--text-50)] mb-3 flex items-center">
                                  <FaProcedures className="mr-2 text-[var(--primary-500)]" />
                                  Surgeries
                                </h4>
                                {medicalHistory?.surgeries?.length > 0 ? (
                                  <ul className="space-y-2">
                                    {medicalHistory.surgeries.map((surgery, index) => (
                                      <li
                                        key={index}
                                        className="p-3 bg-[var(--background-200)] dark:bg-[var(--background-700)] rounded-md"
                                      >
                                        <p><span className="font-semibold">{surgery.procedure}</span></p>
                                        <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                          Date: {formatDate(surgery.date)}
                                        </p>
                                        {surgery.hospital && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Hospital: {surgery.hospital}
                                          </p>
                                        )}
                                        {surgery.surgeon && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Surgeon: {surgery.surgeon}
                                          </p>
                                        )}
                                        {surgery.notes && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Notes: {surgery.notes}
                                          </p>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">No surgeries recorded.</p>
                                )}
                              </div>
                            )}

                            {activeHistoryTab === 'familyHistory' && (
                              <div>
                                <h4 className="text-lg font-medium text-[var(--text-900)] dark:text-[var(--text-50)] mb-3 flex items-center">
                                  <FaUsers className="mr-2 text-[var(--primary-500)]" />
                                  Family History
                                </h4>
                                {medicalHistory?.familyHistory?.length > 0 ? (
                                  <ul className="space-y-2">
                                    {medicalHistory.familyHistory.map((family, index) => (
                                      <li
                                        key={index}
                                        className="p-3 bg-[var(--background-200)] dark:bg-[var(--background-700)] rounded-md"
                                      >
                                        <p><span className="font-semibold">{family.condition}</span></p>
                                        {family.relationship && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Relationship: {family.relationship}
                                          </p>
                                        )}
                                        {family.notes && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Notes: {family.notes}
                                          </p>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">No family history recorded.</p>
                                )}
                              </div>
                            )}

                            {activeHistoryTab === 'lifestyle' && (
                              <div>
                                <h4 className="text-lg font-medium text-[var(--text-900)] dark:text-[var(--text-50)] mb-3 flex items-center">
                                  <FaRunning className="mr-2 text-[var(--primary-500)]" />
                                  Lifestyle
                                </h4>
                                {medicalHistory?.lifestyle ? (
                                  <div className="space-y-4">
                                    <div>
                                      <p className="font-semibold text-[var(--text-900)] dark:text-[var(--text-50)]">Smoking</p>
                                      <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                        Status: {medicalHistory.lifestyle.smoking?.status || 'Not specified'}
                                      </p>
                                      {medicalHistory.lifestyle.smoking?.frequency && (
                                        <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                          Frequency: {medicalHistory.lifestyle.smoking.frequency}
                                        </p>
                                      )}
                                      {medicalHistory.lifestyle.smoking?.quitDate && (
                                        <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                          Quit Date: {formatDate(medicalHistory.lifestyle.smoking.quitDate)}
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-[var(--text-900)] dark:text-[var(--text-50)]">Alcohol</p>
                                      <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                        Status: {medicalHistory.lifestyle.alcohol?.status || 'Not specified'}
                                      </p>
                                      {medicalHistory.lifestyle.alcohol?.frequency && (
                                        <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                          Frequency: {medicalHistory.lifestyle.alcohol.frequency}
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-[var(--text-900)] dark:text-[var(--text-50)]">Exercise</p>
                                      {medicalHistory.lifestyle.exercise?.frequency ? (
                                        <>
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Frequency: {medicalHistory.lifestyle.exercise.frequency}
                                          </p>
                                          {medicalHistory.lifestyle.exercise?.type && (
                                            <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                              Type: {medicalHistory.lifestyle.exercise.type}
                                            </p>
                                          )}
                                        </>
                                      ) : (
                                        <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">No exercise information recorded.</p>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-[var(--text-900)] dark:text-[var(--text-50)]">Diet</p>
                                      {medicalHistory.lifestyle.diet?.type ? (
                                        <>
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Type: {medicalHistory.lifestyle.diet.type}
                                          </p>
                                          {medicalHistory.lifestyle.diet?.restrictions?.length > 0 && (
                                            <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                              Restrictions: {medicalHistory.lifestyle.diet.restrictions.join(', ')}
                                            </p>
                                          )}
                                        </>
                                      ) : (
                                        <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">No diet information recorded.</p>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">No lifestyle information recorded.</p>
                                )}
                              </div>
                            )}

                            {activeHistoryTab === 'vitals' && (
                              <div>
                                <h4 className="text-lg font-medium text-[var(--text-900)] dark:text-[var(--text-50)] mb-3 flex items-center">
                                  <FaHeartbeat className="mr-2 text-[var(--primary-500)]" />
                                  Vitals
                                </h4>
                                {medicalHistory?.vitals?.length > 0 ? (
                                  <ul className="space-y-2">
                                    {medicalHistory.vitals.map((vital, index) => (
                                      <li
                                        key={index}
                                        className="p-3 bg-[var(--background-200)] dark:bg-[var(--background-700)] rounded-md"
                                      >
                                        <p className="font-semibold text-[var(--text-900)] dark:text-[var(--text-50)]">
                                          Date: {formatDate(vital.date)}
                                        </p>
                                        {vital.bloodPressure && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Blood Pressure: {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic} mmHg
                                          </p>
                                        )}
                                        {vital.heartRate && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Heart Rate: {vital.heartRate} bpm
                                          </p>
                                        )}
                                        {vital.temperature && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Temperature: {vital.temperature} °C
                                          </p>
                                        )}
                                        {vital.weight && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Weight: {vital.weight} kg
                                          </p>
                                        )}
                                        {vital.height && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Height: {vital.height} cm
                                          </p>
                                        )}
                                        {vital.notes && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Notes: {vital.notes}
                                          </p>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">No vitals recorded.</p>
                                )}
                              </div>
                            )}

                            {activeHistoryTab === 'documents' && (
                              <div>
                                <h4 className="text-lg font-medium text-[var(--text-900)] dark:text-[var(--text-50)] mb-3 flex items-center">
                                  <FaFileAlt className="mr-2 text-[var(--primary-500)]" />
                                  Documents
                                </h4>
                                {medicalHistory?.documents?.length > 0 ? (
                                  <ul className="space-y-2">
                                    {medicalHistory.documents.map((document, index) => (
                                      <li
                                        key={index}
                                        className="p-3 bg-[var(--background-200)] dark:bg-[var(--background-700)] rounded-md"
                                      >
                                        <p><span className="font-semibold">{document.title}</span></p>
                                        <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                          Type: {document.type}
                                        </p>
                                        <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                          Date: {formatDate(document.date)}
                                        </p>
                                        {document.fileUrl && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--primary-500)] hover:underline">
                                              View Document
                                            </a>
                                          </p>
                                        )}
                                        {document.notes && (
                                          <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                            Notes: {document.notes}
                                          </p>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">No documents recorded.</p>
                                )}
                              </div>
                            )}

                            {activeHistoryTab === 'notes' && (
                              <div>
                                <h4 className="text-lg font-medium text-[var(--text-900)] dark:text-[var(--text-50)] mb-3 flex items-center">
                                  <FaNotesMedical className="mr-2 text-[var(--primary-500)]" />
                                  Notes
                                </h4>
                                {medicalHistory?.notes?.length > 0 ? (
                                  <ul className="space-y-2">
                                    {medicalHistory.notes.map((note, index) => (
                                      <li
                                        key={index}
                                        className="p-3 bg-[var(--background-200)] dark:bg-[var(--background-700)] rounded-md"
                                      >
                                        <p>{note.content}</p>
                                        <p className="text-sm text-[var(--text-500)] dark:text-[var(--text-400)]">
                                          Type: {note.type}
                                        </p>
                                        <p className="text-sm text-[var(--text-500)] dark:text-[var(--text-400)]">
                                          Added on {formatDate(note.date)}
                                        </p>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">No notes recorded.</p>
                                )}
                              </div>
                            )}

                            {activeHistoryTab === 'appointments' && (
                              <div>
                                <h4 className="text-lg font-medium text-[var(--text-900)] dark:text-[var(--text-50)] mb-3 flex items-center">
                                  <FaHistory className="mr-2 text-[var(--primary-500)]" />
                                  Past Appointments
                                </h4>
                                {patient.appointments.length > 0 ? (
                                  <ul className="space-y-2">
                                    {patient.appointments.map((appointment, index) => (
                                      <li
                                        key={index}
                                        className="p-3 bg-[var(--background-200)] dark:bg-[var(--background-700)] rounded-md"
                                      >
                                        <p>
                                          <span className="font-semibold">
                                            {appointment.date && !isNaN(new Date(appointment.date).getTime())
                                              ? format(new Date(appointment.date), 'MMM d, yyyy')
                                              : 'Unknown Date'}
                                          </span>{' '}
                                          at {appointment.time || 'Unknown Time'}
                                        </p>
                                        <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
                                          Reason: {appointment.reason}
                                        </p>
                                        <p className="text-sm text-[var(--text-500)] dark:text-[var(--text-400)]">
                                          Status: {appointment.status}
                                        </p>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">No past appointments recorded.</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorPatients;