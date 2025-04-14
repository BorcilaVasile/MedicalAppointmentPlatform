import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { FaPlus, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import apiClient from '../config/api';

function MedicalHistory() {
  const { patientId } = useParams();
  const { userRole } = useAuth();
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('conditions');
  const [isEditing, setIsEditing] = useState(false);
  const [newEntry, setNewEntry] = useState({});

  useEffect(() => {
    fetchMedicalHistory();
  }, [patientId]);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/medical-history/${patientId}`);
      setMedicalHistory(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching medical history:', error);
      setError(error.response?.data?.message || 'Failed to load medical history');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (type) => {
    try {
      const endpoint = `/api/medical-history/${patientId}/${type}`;
      await apiClient.post(endpoint, newEntry);
      fetchMedicalHistory();
      setNewEntry({});
      setIsEditing(false);
    } catch (error) {
      console.error('Error adding entry:', error);
      setError(error.response?.data?.message || 'Failed to add entry');
    }
  };

  const handleUpdateLifestyle = async () => {
    try {
      await apiClient.put(`/api/medical-history/${patientId}/lifestyle`, newEntry);
      fetchMedicalHistory();
      setNewEntry({});
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating lifestyle:', error);
      setError(error.response?.data?.message || 'Failed to update lifestyle information');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const renderConditions = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Medical Conditions</h3>
        {userRole === 'doctor' && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaPlus className="mr-2" />
            Add Condition
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Condition name"
              className="w-full p-2 border rounded"
              value={newEntry.name || ''}
              onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
            />
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={newEntry.diagnosedDate || ''}
              onChange={(e) => setNewEntry({ ...newEntry, diagnosedDate: e.target.value })}
            />
            <select
              className="w-full p-2 border rounded"
              value={newEntry.status || 'Active'}
              onChange={(e) => setNewEntry({ ...newEntry, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Managed">Managed</option>
              <option value="Resolved">Resolved</option>
            </select>
            <textarea
              placeholder="Notes"
              className="w-full p-2 border rounded"
              value={newEntry.notes || ''}
              onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewEntry({});
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <FaTimes className="inline mr-1" />
                Cancel
              </button>
              <button
                onClick={() => handleAddEntry('conditions')}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FaSave className="inline mr-1" />
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {medicalHistory?.conditions?.map((condition, index) => (
              <li key={index} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {condition.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Diagnosed: {format(new Date(condition.diagnosedDate), 'PP')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status: {condition.status}
                    </p>
                    {condition.notes && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {condition.notes}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderMedications = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Medications</h3>
        {userRole === 'doctor' && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaPlus className="mr-2" />
            Add Medication
          </button>
        )}
      </div>
      {/* Similar editing and display logic as conditions */}
    </div>
  );

  const renderVitals = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Vital Signs</h3>
        {userRole === 'doctor' && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaPlus className="mr-2" />
            Add Vitals
          </button>
        )}
      </div>
      {/* Similar editing and display logic */}
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Medical Notes</h3>
        {userRole === 'doctor' && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaPlus className="mr-2" />
            Add Note
          </button>
        )}
      </div>
      {/* Similar editing and display logic */}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Medical History
            </h2>
            {error && (
              <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          <div className="px-4 py-5 sm:p-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('conditions')}
                  className={`${
                    activeTab === 'conditions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Conditions
                </button>
                <button
                  onClick={() => setActiveTab('medications')}
                  className={`${
                    activeTab === 'medications'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Medications
                </button>
                <button
                  onClick={() => setActiveTab('vitals')}
                  className={`${
                    activeTab === 'vitals'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Vitals
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`${
                    activeTab === 'notes'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Notes
                </button>
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === 'conditions' && renderConditions()}
              {activeTab === 'medications' && renderMedications()}
              {activeTab === 'vitals' && renderVitals()}
              {activeTab === 'notes' && renderNotes()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicalHistory; 