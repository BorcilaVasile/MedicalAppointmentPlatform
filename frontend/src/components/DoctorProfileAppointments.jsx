import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks, isBefore, startOfDay } from 'date-fns';
import { ro } from 'date-fns/locale';
import apiClient from '../config/api';

function DoctorProfileAppointments({ doctorId, token, isAuthenticated }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [weekDates, setWeekDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState({});
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [bookedSlots, setBookedSlots] = useState({});
  const [userAppointments, setUserAppointments] = useState({});
  const [cancelLoading, setCancelLoading] = useState(false);
  const [availableSlotsCount, setAvailableSlotsCount] = useState({});
  const [doctorDetails, setDoctorDetails] = useState(null);
  const workingHours = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30'
  ];

  // Funcție pentru navigarea între săptămâni
  const navigateWeek = (direction) => {
    setCurrentWeekStart(direction === 'next' 
      ? addWeeks(currentWeekStart, 1)
      : subWeeks(currentWeekStart, 1)
    );
  };

  // Funcție pentru a prelua programările pentru o săptămână
  const fetchBookedSlots = async (weekStart) => {
    try {
      const weekEnd = addDays(weekStart, 6);
      const response = await apiClient.get(`/api/appointments/doctor/${doctorId}`, {
        params: {
          startDate: format(weekStart, 'yyyy-MM-dd'),
          endDate: format(weekEnd, 'yyyy-MM-dd')
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { bookedSlots: {}, userAppointments: {}, appointments: [] };
    }
  };

  // Funcție pentru anularea programării
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
  
    setCancelLoading(true);
    try {
      await apiClient.put(`/api/appointments/${appointmentId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      // Reîncarcă datele
      const bookingData = await fetchBookedSlots(currentWeekStart);
      setBookedSlots(bookingData.bookedSlots || {});
      setUserAppointments(bookingData.userAppointments || {});
      setSubmitSuccess('Appointment cancelled successfully!');
      
    } catch (error) {
      setSubmitError(error.response?.data?.error || error.message || 'Error cancelling appointment');
    } finally {
      setCancelLoading(false);
    }
  };
  
  // Generează datele pentru săptămâna curentă
  useEffect(() => {
    const loadWeekData = async () => {
      const dates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
      setWeekDates(dates);

      // Preia sloturile rezervate de la backend
      const bookingData = await fetchBookedSlots(currentWeekStart);
      const bookedSlotsData = bookingData.bookedSlots || {};
      const userAppointmentsData = bookingData.userAppointments || {};
      
      // Generează sloturi disponibile pentru fiecare zi
      const slots = {};
      const booked = {};
      const slotsCount = {};
      const today = startOfDay(new Date());
      const currentTime = new Date();
      
      dates.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        // Nu generăm sloturi pentru zilele din trecut
        if (isBefore(date, today)) {
          slots[dateStr] = [];
          booked[dateStr] = workingHours;
          slotsCount[dateStr] = 0;
        } else {
          // Folosim datele reale pentru sloturile rezervate
          const bookedForDate = bookedSlotsData[dateStr] || [];
          booked[dateStr] = bookedForDate;
          
          // Toate orele sunt vizibile
          slots[dateStr] = workingHours;
          
          // Calculăm numărul de sloturi disponibile, excluzând orele care au trecut în ziua curentă
          let availableHoursCount = workingHours.length - bookedForDate.length;
          
          // Dacă este ziua curentă, excludem orele care au trecut
          if (isSameDay(date, today)) {
            const passedHours = workingHours.filter(time => {
              const [hours, minutes] = time.split(':').map(Number);
              const slotTime = new Date(date);
              slotTime.setHours(hours, minutes, 0);
              
              // Adăugăm 4 ore pentru a respecta regula de programare cu cel puțin 4 ore înainte
              const timeDifferenceInHours = (slotTime - currentTime) / (1000 * 60 * 60);
              return timeDifferenceInHours < 4;
            });
            
            // Scădem orele care au trecut și nu sunt deja rezervate
            const passedAvailableHours = passedHours.filter(time => !bookedForDate.includes(time));
            availableHoursCount -= passedAvailableHours.length;
          }
          
          slotsCount[dateStr] = Math.max(0, availableHoursCount);
        }
      });
      
      console.log('Available slots:', slots);
      console.log('Available slots count:', slotsCount);
      
      setAvailableSlots(slots);
      setBookedSlots(booked);
      setUserAppointments(userAppointmentsData);
      setAvailableSlotsCount(slotsCount);
      
      // Verifică dacă ziua selectată are sloturi disponibile
      // Dacă nu, selectează automat următoarea zi cu sloturi disponibile
      if (selectedDate) {
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        
        // Verifică dacă data selectată nu mai are sloturi disponibile
        if (slotsCount[selectedDateStr] === 0) {
          // Găsește următoarea zi disponibilă
          const nextAvailableDate = dates.find(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            return slotsCount[dateStr] > 0 && !isBefore(date, today);
          });
          
          // Dacă găsește o zi disponibilă, o selectează automat
          if (nextAvailableDate) {
            console.log('Redirectionare automată la următoarea zi disponibilă:', format(nextAvailableDate, 'dd/MM/yyyy'));
            setSelectedDate(nextAvailableDate);
            setSelectedTime('');
            
            // Adaugă mesaj pentru utilizator
            setSubmitSuccess(`Nu mai sunt sloturi disponibile pentru ${format(selectedDate, 'dd MMMM', { locale: ro })}. Am selectat automat următoarea zi disponibilă: ${format(nextAvailableDate, 'dd MMMM', { locale: ro })}.`);
            
            // Curăță mesajul după 5 secunde
            setTimeout(() => {
              setSubmitSuccess(null);
            }, 5000);
          }
        }
      }
    };

    loadWeekData();
  }, [currentWeekStart, doctorId, selectedDate]);

  // Fetch doctor details to get clinic ID
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await apiClient.get(`/api/doctors/${doctorId}`);
        setDoctorDetails(response.data);
      } catch (error) {
        console.error('Error fetching doctor details:', error);
        setSubmitError('Failed to fetch doctor details');
      }
    };
    
    fetchDoctorDetails();
  }, [doctorId]);

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setSubmitError('You need to be authenticated to make an appointment');
      return;
    }
  
    if (!selectedDate || !selectedTime || !reason) {
      setSubmitError('Please fill in all required fields');
      return;
    }
    
    if (!doctorDetails || !doctorDetails.clinic) {
      setSubmitError('Doctor clinic information is not available');
      return;
    }
  
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);
  
    try {
      const response = await apiClient.post('/api/appointments', {
        doctorId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        reason,
        clinicId: doctorDetails.clinic._id
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response && response.data) {
        const createdAppointment = response.data;
      
        try {
          await apiClient.post('/api/notifications', {
            recipient: doctorId,
            recipientType: 'Doctor',
            sender: createdAppointment.patient, // presupunând că serverul trimite `patient` în datele createAppointment
            senderType: 'Patient',
            type: 'APPOINTMENT_CREATED',
            appointment: createdAppointment._id,
            message: `New appointment scheduled for ${format(selectedDate, 'dd MMMM yyyy', { locale: ro })} at ${selectedTime}`
          }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        } catch (notificationError) {
          console.error('Failed to create notification:', notificationError);
        }
      }
      // Reîncarcă datele
      const bookingData = await fetchBookedSlots(currentWeekStart);
      setBookedSlots(bookingData.bookedSlots || {});
      setUserAppointments(bookingData.userAppointments || {});
  
      // Reset form
      setSelectedDate(new Date());
      setSelectedTime('');
      setReason('');
      setSubmitSuccess('Appointment created successfully!');
      
    } catch (err) {
      setSubmitError(err.response?.data?.error || err.message || 'Error creating appointment');
    } finally {
      setSubmitLoading(false);
    }
  };
  

  return (
    <div className="bg-white dark:bg-[var(--background-900)] rounded-xl shadow-sm p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)] mb-4 sm:mb-6">
        Make an appointment
      </h2>
      
      {isAuthenticated ? (
        <form onSubmit={handleSubmitAppointment} className="space-y-4 sm:space-y-6">
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <button
              type="button"
              onClick={() => navigateWeek('prev')}
              disabled={isBefore(currentWeekStart, startOfWeek(new Date(), { weekStartsOn: 1 }))}
              className="p-1 sm:p-2 text-xs sm:text-sm text-[var(--text-600)] dark:text-[var(--text-400)] hover:text-[var(--primary-500)] dark:hover:text-[var(--primary-400)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Last week
            </button>
            <span className="text-xs sm:text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)]">
              {format(currentWeekStart, 'MMMM yyyy', { locale: ro })}
            </span>
            <button
              type="button"
              onClick={() => navigateWeek('next')}
              className="p-1 sm:p-2 text-xs sm:text-sm text-[var(--text-600)] dark:text-[var(--text-400)] hover:text-[var(--primary-500)] dark:hover:text-[var(--primary-400)] transition-colors"
            >
              Next week →
            </button>
          </div>

          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa', 'Du'].map((day) => (
              <div key={day} className="text-center text-xs sm:text-sm font-medium text-[var(--text-600)] dark:text-[var(--text-400)]">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {weekDates.map((date, index) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const hasSlots = availableSlotsCount[dateStr] > 0;
              const isPast = isBefore(date, startOfDay(new Date()));
              
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedTime('');
                  }}
                  disabled={isPast}
                  className={`
                    p-1 sm:p-2 rounded-lg text-center transition-colors relative
                    ${isSelected 
                      ? 'bg-[var(--primary-500)] text-white' 
                      : hasSlots && !isPast
                        ? 'bg-[var(--background-100)] dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)] hover:bg-[var(--background-200)] dark:hover:bg-[var(--background-700)] border border-[var(--primary-300)] dark:border-[var(--primary-700)]'
                        : isPast
                          ? 'bg-[var(--background-50)] dark:bg-[var(--background-900)] text-[var(--text-400)] cursor-not-allowed'
                          : 'bg-[var(--background-100)] dark:bg-[var(--background-800)] text-[var(--text-700)] dark:text-[var(--text-300)] hover:bg-[var(--background-200)] dark:hover:bg-[var(--background-700)] border border-[var(--background-300)] dark:border-[var(--background-700)]'
                    }
                  `}
                >
                  <span className="text-xs sm:text-sm">
                    {format(date, 'd')}
                  </span>
                  {hasSlots && !isPast && (
                    <div className="text-[10px] sm:text-xs mt-1 text-[var(--text-500)] dark:text-[var(--text-400)]">
                      {availableSlotsCount[dateStr]} {availableSlotsCount[dateStr] === 1 ? 'slot' : 'sloturi'}
                    </div>
                  )}
                  {!hasSlots && !isPast && (
                    <div className="text-[10px] sm:text-xs mt-1 text-[var(--text-500)] dark:text-[var(--text-400)]">
                      No slots
                    </div>
                  )}
                  {isPast && (
                    <div className="text-[10px] sm:text-xs mt-1 text-[var(--text-400)]">
                      Unavailable
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <h3 className="text-base sm:text-lg font-medium text-[var(--text-500)] dark:text-[var(--text-300)] mb-2 sm:mb-3">
                Available hours for {format(selectedDate, 'dd MMMM', { locale: ro })}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2">
                {workingHours.map((time) => {
                  const dateStr = format(selectedDate, 'yyyy-MM-dd');
                  const isBooked = bookedSlots[dateStr]?.includes(time);
                  const isUserAppointment = userAppointments[dateStr]?.[time];
                  const currentTime = new Date();
                  const [hours, minutes] = time.split(':').map(Number);
                  const slotTime = new Date(selectedDate);
                  slotTime.setHours(hours, minutes, 0);

                  // Calculate time difference in hours
                  const timeDifferenceInHours = (slotTime - currentTime) / (1000 * 60 * 60);
                  const isUnavailable = isSameDay(selectedDate, new Date()) && timeDifferenceInHours < 4;
                  const canCancel = isUserAppointment && ((slotTime - currentTime) / (1000 * 60 * 60)) >= 1;

                  return (
                    <div key={time} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          if (isUserAppointment && canCancel) {
                            handleCancelAppointment(isUserAppointment, time);
                          } else if (!isBooked && !isUnavailable) {
                            setSelectedTime(time);
                          }
                        }}
                        disabled={(!isUserAppointment && isBooked) || isUnavailable || (isUserAppointment && !canCancel)}
                        className={`
                          w-full p-1 sm:p-2 text-center rounded-lg transition-colors relative
                          ${selectedTime === time
                            ? 'bg-[var(--primary-500)] text-white font-bold border-2 border-[var(--primary-700)]'
                            : isUserAppointment
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-2 border-green-500'
                              : isBooked
                                ? 'bg-[var(--background-200)] dark:bg-[var(--background-700)] text-[var(--text-400)] dark:text-[var(--text-500)] opacity-60 cursor-not-allowed border-2 border-[var(--background-300)] dark:border-[var(--background-600)]'
                                : isUnavailable
                                  ? 'bg-[var(--error-100)] dark:bg-[var(--error-900)] text-[var(--error-600)] dark:text-[var(--error-200)] cursor-not-allowed border-2 border-[var(--error-300)] dark:border-[var(--error-700)]'
                                  : 'bg-[var(--primary-100)] dark:bg-[var(--primary-900)] text-[var(--primary-700)] dark:text-[var(--primary-300)] hover:bg-[var(--primary-200)] dark:hover:bg-[var(--primary-800)] hover:border-[var(--primary-400)] border-2 border-[var(--primary-300)] font-medium'
                          }
                        `}
                      >
                        <div className={`text-xs sm:text-sm font-medium ${!isBooked && !isUnavailable && !isUserAppointment ? 'text-[var(--primary-700)] dark:text-[var(--primary-300)]' : ''}`}>{time}</div>
                        {isUserAppointment && (
                          <div className="text-[10px] sm:text-xs mt-1">
                            <span className="text-green-700 dark:text-green-300 font-semibold">
                              {canCancel ? (
                                <>
                                  Your appointment
                                  <br className="hidden sm:block" />
                                  <span className="underline">Cancel</span>
                                </>
                              ) : (
                                <>
                                  Your appointment
                                  <br className="hidden sm:block" />
                                  <span className="text-[8px] sm:text-[10px]">Can't cancel</span>
                                </>
                              )}
                            </span>
                          </div>
                        )}
                        {isBooked && !isUserAppointment && (
                          <div className="text-[10px] sm:text-xs mt-1 text-[var(--text-500)] dark:text-[var(--text-400)]">
                            Reserved
                          </div>
                        )}
                        {isUnavailable && !isBooked && (
                          <div className="text-[10px] sm:text-xs mt-1 text-[var(--error-600)] dark:text-[var(--error-200)]">
                            Expired
                          </div>
                        )}
                        {!isBooked && !isUnavailable && !isUserAppointment && (
                          <div className="text-[10px] sm:text-xs mt-1 text-[var(--primary-600)] dark:text-[var(--primary-400)] font-medium">
                            Available
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {/* Reason Input */}
              <div className="mt-3 sm:mt-4">
                <label htmlFor="reason" className="block text-xs sm:text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-1 sm:mb-2">
                  Please give us some details about appointment
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 sm:p-3 border border-[var(--background-200)] dark:border-[var(--background-700)] rounded-lg bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)] text-sm sm:text-base"
                  rows="3"
                  placeholder="Describe the reason for your appointment..."
                  required
                />
              </div>
            </div>
          )}

          {submitError && (
            <div className="p-3 sm:p-4 rounded-lg bg-[var(--error-50)] text-[var(--error-600)] dark:bg-[var(--error-900)] dark:text-[var(--error-200)] text-xs sm:text-sm">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="p-3 sm:p-4 rounded-lg bg-[var(--success-50)] text-[var(--success-600)] dark:bg-[var(--success-900)] dark:text-[var(--success-200)] text-xs sm:text-sm">
              {submitSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={submitLoading || !selectedDate || !selectedTime}
            className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-white font-medium text-sm sm:text-base transition-colors
              ${submitLoading 
                ? 'bg-[var(--primary-400)] cursor-not-allowed'
                : 'bg-[var(--primary-500)] hover:bg-[var(--primary-600)]'}`}
          >
            {submitLoading ? 'Processing...' : 'Confirm Appointment'}
          </button>
        </form>
      ) : (
        <p className="text-center text-[var(--text-500)] text-sm sm:text-base">
          You need to be authenticated to make an appointment
        </p>
      )}
    </div>
  );
}

export default DoctorProfileAppointments; 