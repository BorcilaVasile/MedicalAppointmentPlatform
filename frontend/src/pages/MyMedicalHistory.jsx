import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { 
  FaHeartbeat, 
  FaAllergies, 
  FaPills, 
  FaProcedures, 
  FaUserInjured, 
  FaUserCog, 
  FaNotesMedical,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import apiClient from '../config/api';

function MyMedicalHistory() {
  const { user } = useAuth();
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('conditions');

  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      // Obținem istoricul medical al utilizatorului curent
      const response = await apiClient.get(`/api/medical-history/me`);
      setMedicalHistory(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching medical history:', error);
      setError(error.response?.data?.message || 'Failed to load medical history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-900)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <FaSpinner className="h-12 w-12 animate-spin text-[var(--primary-500)] mx-auto" />
            <p className="mt-4 text-[var(--text-700)] dark:text-[var(--text-300)]">Loading medical history...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderNoDataMessage = () => (
    <div className="bg-[var(--background-100)] dark:bg-[var(--background-800)] shadow rounded-lg p-6 text-center">
      <FaExclamationTriangle className="h-12 w-12 text-[var(--primary-400)] mx-auto mb-4" />
      <p className="text-[var(--text-700)] dark:text-[var(--text-300)]">
        No data available in this section of the medical history.
      </p>
    </div>
  );

  const renderConditions = () => (
    <div className="space-y-4">
      {!medicalHistory?.conditions?.length ? (
        renderNoDataMessage()
      ) : (
        <>
          {/* Tabel doar pentru desktop */}
          <div className="hidden md:block bg-[var(--background-100)] dark:bg-[var(--background-800)] shadow overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
              <thead className="bg-[var(--background-200)] dark:bg-[var(--background-700)]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Condiție
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Diagnosticat
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background-100)] dark:bg-[var(--background-800)] divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
                {medicalHistory.conditions.map((condition, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-left text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {condition.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-left text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {format(new Date(condition.diagnosedDate), 'dd MMMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold
                        ${condition.status === 'Active'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : condition.status === 'Managed'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        }`}>
                        {condition.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-left text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {condition.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

  
          {/* Variante pentru mobil (listă) */}
          <div className="md:hidden space-y-4">
            {medicalHistory.conditions.map((condition, index) => (
              <div key={index} className="bg-[var(--background-100)] dark:bg-[var(--background-800)] shadow rounded-lg p-4 text-center">
                <h4 className="text-lg font-medium text-[var(--text-900)] dark:text-[var(--text-50)]">
                  {condition.name}
                </h4>
                <div className="mt-2 text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                  <p><span className="font-medium">Diagnosticat:</span> {format(new Date(condition.diagnosedDate), 'dd MMMM yyyy')}</p>
                  <p className="mt-2 flex flex-col items-center justify-center">
                    <span className="font-medium mb-1">Status:</span>
                    <span className={`inline-flex justify-center px-2 py-1 rounded-full text-xs font-semibold
                      ${condition.status === 'Active'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        : condition.status === 'Managed'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}>
                      {condition.status}
                    </span>
                  </p>
                  {condition.notes && (
                    <p className="mt-2"><span className="font-medium">Note:</span> {condition.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
  
  const renderAllergies = () => (
    <div className="space-y-4">
      {!medicalHistory?.allergies?.length ? (
        renderNoDataMessage()
      ) : (
        <>
          {/* Tabel doar pentru desktop */}
          <div className="hidden md:block bg-[var(--background-100)] dark:bg-[var(--background-800)] shadow overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
              <thead className="bg-[var(--background-200)] dark:bg-[var(--background-700)]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Alergen
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Severitate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Reacție
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background-100)] dark:bg-[var(--background-800)] divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
                {medicalHistory.allergies.map((allergy, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-left text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {allergy.allergen}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-left">
                      <span className={`inline-flex justify-center px-2 py-1 rounded-full text-xs font-semibold
                        ${allergy.severity === 'Severe'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : allergy.severity === 'Moderate'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        }`}>
                        {allergy.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-left text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {allergy.reaction || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          {/* Carduri doar pentru mobil */}
          <div className="md:hidden space-y-4">
            {medicalHistory.allergies.map((allergy, index) => (
              <div key={index} className="bg-[var(--background-100)] dark:bg-[var(--background-800)] shadow rounded-lg p-4 text-center">
                <h4 className="text-lg font-medium text-[var(--text-900)] dark:text-[var(--text-50)]">
                  {allergy.allergen}
                </h4>
                <div className="mt-2 flex flex-col items-center text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                  <p>
                    <span className="font-medium">Severitate:</span>
                  </p>
                  <span className={`inline-flex justify-center mt-1 px-2 py-1 rounded-full text-xs font-semibold
                    ${allergy.severity === 'Severe'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      : allergy.severity === 'Moderate'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    }`}>
                    {allergy.severity}
                  </span>
                  {allergy.reaction && (
                    <p className="mt-3">
                      <span className="font-medium">Reacție:</span> {allergy.reaction}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
  
  
  const renderMedications = () => (
    <div className="space-y-4">
      {!medicalHistory?.medications?.length ? (
        renderNoDataMessage()
      ) : (
        <>
          {/* Tabel doar pentru desktop */}
          <div className="hidden md:block bg-[var(--background-100)] dark:bg-[var(--background-800)] shadow overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
              <thead className="bg-[var(--background-200)] dark:bg-[var(--background-700)]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Medicament
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Dozaj
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Frecvență
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Data începerii
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Data terminării
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background-100)] dark:bg-[var(--background-800)] divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
                {medicalHistory.medications.map((medication, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-left text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {medication.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-left text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {medication.dosage || 'Nespecificat'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-left text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {medication.frequency || 'Nespecificat'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-left text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {medication.startDate ? format(new Date(medication.startDate), 'dd MMMM yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-left text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {medication.endDate ? format(new Date(medication.endDate), 'dd MMMM yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`inline-flex justify-center mt-1 px-2 py-1 rounded-full text-xs font-semibold
                        ${medication.status === 'Active'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : medication.status === 'Discontinued'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        }`}>
                        {medication.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          {/* Carduri doar pentru mobil */}
          <div className="md:hidden space-y-4">
            {medicalHistory.medications.map((medication, index) => (
              <div key={index} className="bg-[var(--background-100)] dark:bg-[var(--background-800)] shadow rounded-lg p-4 text-center">
                <h4 className="text-lg font-medium text-[var(--text-900)] dark:text-[var(--text-50)]">
                  {medication.name}
                </h4>
                <div className="mt-2 flex flex-col items-center text-sm text-[var(--text-700)] dark:text-[var(--text-300)] space-y-1">
                  <p><span className="font-medium">Dozaj:</span> {medication.dosage || 'Nespecificat'}</p>
                  <p><span className="font-medium">Frecvență:</span> {medication.frequency || 'Nespecificat'}</p>
                  {medication.startDate && (
                    <p><span className="font-medium">Început:</span> {format(new Date(medication.startDate), 'dd MMMM yyyy')}</p>
                  )}
                  {medication.endDate && (
                    <p><span className="font-medium">Sfârșit:</span> {format(new Date(medication.endDate), 'dd MMMM yyyy')}</p>
                  )}
                  <div className="mt-2">
                    <span className={`inline-flex justify-center px-2 py-1 rounded-full text-xs font-semibold
                      ${medication.status === 'Active'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : medication.status === 'Discontinued'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}>
                      {medication.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
  

  const renderSurgeries = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-medium text-[var(--text-900)] dark:text-[var(--text-50)]">
        <FaProcedures className="inline-block mr-2 text-[var(--primary-500)]" />
        Intervenții chirurgicale
      </h3>
      {!medicalHistory?.surgeries?.length ? (
        renderNoDataMessage()
      ) : (
        <div className="bg-[var(--background-100)] dark:bg-[var(--background-800)] shadow overflow-hidden rounded-lg">
          <ul className="divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
            {medicalHistory.surgeries.map((surgery, index) => (
              <li key={index} className="px-6 py-4">
                <div>
                  <h4 className="text-lg font-medium text-[var(--text-900)] dark:text-[var(--text-50)]">
                    {surgery.procedure}
                  </h4>
                  <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {surgery.date && (
                      <p className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                        Data: {format(new Date(surgery.date), 'dd MMMM yyyy')}
                      </p>
                    )}
                    {surgery.hospital && (
                      <p className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                        Spital: {surgery.hospital}
                      </p>
                    )}
                    {surgery.surgeon && (
                      <p className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                        Chirurg: {surgery.surgeon}
                      </p>
                    )}
                  </div>
                  {surgery.notes && (
                    <p className="mt-2 text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                      Note: {surgery.notes}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderLifestyle = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-medium text-[var(--text-900)] dark:text-[var(--text-50)]">
        <FaUserCog className="inline-block mr-2 text-[var(--primary-500)]" />
        Stil de viață
      </h3>
      {!medicalHistory?.lifestyle ? (
        renderNoDataMessage()
      ) : (
        <div className="bg-[var(--background-100)] dark:bg-[var(--background-800)] shadow overflow-hidden rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-[var(--text-900)] dark:text-[var(--text-50)] mb-2">Fumat</h4>
              <p className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                Status: {medicalHistory.lifestyle.smoking?.status || 'Nespecificat'}
              </p>
              {medicalHistory.lifestyle.smoking?.frequency && (
                <p className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)] mt-1">
                  Frecvență: {medicalHistory.lifestyle.smoking.frequency}
                </p>
              )}
              {medicalHistory.lifestyle.smoking?.quitDate && (
                <p className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)] mt-1">
                  Data renunțării: {format(new Date(medicalHistory.lifestyle.smoking.quitDate), 'dd MMMM yyyy')}
                </p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-[var(--text-900)] dark:text-[var(--text-50)] mb-2">Consum de alcool</h4>
              <p className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                Status: {medicalHistory.lifestyle.alcohol?.status || 'Nespecificat'}
              </p>
              {medicalHistory.lifestyle.alcohol?.frequency && (
                <p className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)] mt-1">
                  Frecvență: {medicalHistory.lifestyle.alcohol.frequency}
                </p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-[var(--text-900)] dark:text-[var(--text-50)] mb-2">Exerciții fizice</h4>
              {medicalHistory.lifestyle.exercise?.frequency && (
                <p className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                  Frecvență: {medicalHistory.lifestyle.exercise.frequency}
                </p>
              )}
              {medicalHistory.lifestyle.exercise?.type && (
                <p className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)] mt-1">
                  Tip: {medicalHistory.lifestyle.exercise.type}
                </p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-[var(--text-900)] dark:text-[var(--text-50)] mb-2">Dietă</h4>
              {medicalHistory.lifestyle.diet?.type && (
                <p className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                  Tip: {medicalHistory.lifestyle.diet.type}
                </p>
              )}
              {medicalHistory.lifestyle.diet?.restrictions && medicalHistory.lifestyle.diet.restrictions.length > 0 && (
                <div className="mt-1">
                  <p className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">Restricții:</p>
                  <ul className="list-disc pl-5 text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                    {medicalHistory.lifestyle.diet.restrictions.map((restriction, index) => (
                      <li key={index}>{restriction}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderVitals = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-medium text-[var(--text-900)] dark:text-[var(--text-50)]">
        <FaNotesMedical className="inline-block mr-2 text-[var(--primary-500)]" />
        Semne vitale
      </h3>
      {!medicalHistory?.vitals?.length ? (
        renderNoDataMessage()
      ) : (
        <>
          {/* Tabel pentru desktop/tabletă */}
          <div className="hidden md:block bg-[var(--background-100)] dark:bg-[var(--background-800)] shadow overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
              <thead className="bg-[var(--background-200)] dark:bg-[var(--background-700)]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Tensiune arterială
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Puls
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Temperatură
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Greutate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-500)] uppercase tracking-wider">
                    Înălțime
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background-100)] dark:bg-[var(--background-800)] divide-y divide-[var(--background-200)] dark:divide-[var(--background-700)]">
                {medicalHistory.vitals.map((vital, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {format(new Date(vital.date), 'dd MMMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {vital.bloodPressure ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {vital.heartRate || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {vital.temperature ? `${vital.temperature} °C` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {vital.weight ? `${vital.weight} kg` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {vital.height ? `${vital.height} cm` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card-uri pentru mobil */}
          <div className="md:hidden space-y-4">
            {medicalHistory.vitals.map((vital, index) => (
              <div key={index} className="bg-[var(--background-100)] dark:bg-[var(--background-800)] shadow rounded-lg p-4">
                <div className="mb-2 pb-2 border-b border-[var(--background-200)] dark:border-[var(--background-700)]">
                  <div className="text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-50)]">
                    {format(new Date(vital.date), 'dd MMMM yyyy')}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-xs text-[var(--text-500)] dark:text-[var(--text-400)]">Tensiune arterială</span>
                    <span className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {vital.bloodPressure ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}` : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-[var(--text-500)] dark:text-[var(--text-400)]">Puls</span>
                    <span className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {vital.heartRate || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-[var(--text-500)] dark:text-[var(--text-400)]">Temperatură</span>
                    <span className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {vital.temperature ? `${vital.temperature} °C` : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-[var(--text-500)] dark:text-[var(--text-400)]">Greutate</span>
                    <span className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {vital.weight ? `${vital.weight} kg` : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-[var(--text-500)] dark:text-[var(--text-400)]">Înălțime</span>
                    <span className="text-sm text-[var(--text-700)] dark:text-[var(--text-300)]">
                      {vital.height ? `${vital.height} cm` : '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-900)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[var(--background-100)] dark:bg-[var(--background-800)] shadow rounded-lg">
          <div className="px-4 py-5 border-b border-[var(--background-200)] dark:border-[var(--background-700)] sm:px-6">
            <h2 className="text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-50)]">
              My medical history
            </h2>
            {error && (
              <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
                {error}
              </div>
            )}
          </div>

          <div className="px-4 py-5 sm:p-6">
            {/* Tab-uri pentru desktop și tablet - ascunse pe dispozitive foarte mici */}
            <div className="border-b border-[var(--background-200)] dark:border-[var(--background-700)] hidden sm:block">
              <nav className="-mb-px flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('conditions')}
                  className={`${
                    activeTab === 'conditions'
                      ? 'border-[var(--primary-500)] text-[var(--primary-600)] dark:text-[var(--primary-400)]'
                      : 'border-transparent text-[var(--text-500)] hover:text-[var(--text-700)] hover:border-[var(--text-300)]'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <FaHeartbeat className="mr-2" /> Medical conditions
                </button>
                <button
                  onClick={() => setActiveTab('allergies')}
                  className={`${
                    activeTab === 'allergies'
                      ? 'border-[var(--primary-500)] text-[var(--primary-600)] dark:text-[var(--primary-400)]'
                      : 'border-transparent text-[var(--text-500)] hover:text-[var(--text-700)] hover:border-[var(--text-300)]'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <FaAllergies className="mr-2" /> Allergies
                </button>
                <button
                  onClick={() => setActiveTab('medications')}
                  className={`${
                    activeTab === 'medications'
                      ? 'border-[var(--primary-500)] text-[var(--primary-600)] dark:text-[var(--primary-400)]'
                      : 'border-transparent text-[var(--text-500)] hover:text-[var(--text-700)] hover:border-[var(--text-300)]'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <FaPills className="mr-2" /> Medication
                </button>
                <button
                  onClick={() => setActiveTab('surgeries')}
                  className={`${
                    activeTab === 'surgeries'
                      ? 'border-[var(--primary-500)] text-[var(--primary-600)] dark:text-[var(--primary-400)]'
                      : 'border-transparent text-[var(--text-500)] hover:text-[var(--text-700)] hover:border-[var(--text-300)]'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <FaProcedures className="mr-2" /> Interventions
                </button>
                <button
                  onClick={() => setActiveTab('lifestyle')}
                  className={`${
                    activeTab === 'lifestyle'
                      ? 'border-[var(--primary-500)] text-[var(--primary-600)] dark:text-[var(--primary-400)]'
                      : 'border-transparent text-[var(--text-500)] hover:text-[var(--text-700)] hover:border-[var(--text-300)]'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <FaUserCog className="mr-2" /> Life style
                </button>
                <button
                  onClick={() => setActiveTab('vitals')}
                  className={`${
                    activeTab === 'vitals'
                      ? 'border-[var(--primary-500)] text-[var(--primary-600)] dark:text-[var(--primary-400)]'
                      : 'border-transparent text-[var(--text-500)] hover:text-[var(--text-700)] hover:border-[var(--text-300)]'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <FaNotesMedical className="mr-2" /> Vital signs
                </button>
              </nav>
            </div>

            {/* Selector pentru mobil - afișat doar pe ecrane foarte mici */}
            <div className="sm:hidden mb-4 pt-2">
              <label htmlFor="tabs" className="sr-only">Select section</label>
              <select
                id="tabs"
                name="tabs"
                className="block w-full pl-3 pr-10 py-2 text-base border-[var(--background-300)] dark:border-[var(--background-600)] bg-[var(--background-50)] dark:bg-[var(--background-700)] text-[var(--text-900)] dark:text-[var(--text-50)] rounded-md focus:outline-none focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
              >
                <option value="conditions">Medical conditions</option>
                <option value="allergies">Allergies</option>
                <option value="medications">Medication</option>
                <option value="surgeries">Interventions</option>
                <option value="lifestyle">Life style</option>
                <option value="vitals">Vital signs</option>
              </select>
            </div>

            <div className="mt-6">
              {activeTab === 'conditions' && renderConditions()}
              {activeTab === 'allergies' && renderAllergies()}
              {activeTab === 'medications' && renderMedications()}
              {activeTab === 'surgeries' && renderSurgeries()}
              {activeTab === 'lifestyle' && renderLifestyle()}
              {activeTab === 'vitals' && renderVitals()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyMedicalHistory; 