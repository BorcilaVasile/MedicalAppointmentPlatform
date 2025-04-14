import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaStar, FaCalendar, FaHospital, FaUserMd, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaFileMedical } from 'react-icons/fa';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks, isBefore, startOfDay } from 'date-fns';
import { ro } from 'date-fns/locale';
import apiClient, { getImageUrl } from '../config/api';

function DoctorProfile() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
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
  const workingHours = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30'
  ];

  // Calculează rating-ul mediu
  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  // Randează stelele pentru rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FaStar key={i} className="text-yellow-400 w-5 h-5" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FaStarHalf key={i} className="text-yellow-400 w-5 h-5" />
        );
      } else {
        stars.push(
          <FaStar key={i} className="text-gray-300 dark:text-gray-600 w-5 h-5" />
        );
      }
    }
    return stars;
  };

  // Fetch doctor data
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const response = await apiClient.get(`/api/doctors/${id}`);
        setDoctor(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching doctor data:', error);
        setError('Failed to fetch doctor data');
        setLoading(false);
      }
    };

    const fetchAppointments = async () => {
      try {
        const response = await apiClient.get(`/api/appointments/doctor/${id}`);
        setUserAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await apiClient.get(`/api/reviews/doctor/${id}`);
        setDoctor(prevDoctor => ({ ...prevDoctor, reviews: response.data }));
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchDoctorData();
    fetchAppointments();
    fetchReviews();
  }, [id]);

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
      const response = await apiClient.get(`/api/appointments/slots/${id}`, {
        params: {
          startDate: format(weekStart, 'yyyy-MM-dd'),
          endDate: format(weekEnd, 'yyyy-MM-dd')
        }
      });
      return response.data;
    } catch (error) {
      console.error('Eroare la preluarea programărilor:', error);
      throw new Error('Eroare la preluarea programărilor');
    }
  };

  // Funcție pentru anularea programării
  const handleCancelAppointment = async (appointmentId, appointmentTime) => {
    if (!window.confirm('Sigur doriți să anulați această programare?')) {
      return;
    }

    setCancelLoading(true);
    try {
      const response = await apiClient.post(
        `/api/doctors/${id}/appointments/${appointmentId}/cancel`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Eroare la anularea programării');
      }

      // Reîncarcă datele programărilor
      const dates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
      const { bookedSlots: newBookedSlots, userAppointments: newUserAppointments } = 
        await fetchBookedSlots(currentWeekStart);
      
      setBookedSlots(newBookedSlots);
      setUserAppointments(newUserAppointments);
      setSubmitSuccess('Programarea a fost anulată cu succes');

    } catch (error) {
      setSubmitError(error.message);
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
      const { bookedSlots: bookedSlotsData, userAppointments: userAppointmentsData } = 
        await fetchBookedSlots(currentWeekStart);
      
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
  }, [currentWeekStart, id, selectedDate]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setSubmitError('Trebuie să fii autentificat pentru a lăsa un review');
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);

    try {
      const response = await apiClient.post('/api/reviews', {
        doctorId: id,
        rating: review.rating,
        comment: review.comment
      });

      setDoctor(prevDoctor => ({ ...prevDoctor, reviews: [...prevDoctor.reviews, response.data] }));
      setShowReviewForm(false);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setSubmitError('Trebuie să fii autentificat pentru a face o programare');
      return;
    }

    if (!selectedDate || !selectedTime || !reason) {
      setSubmitError('Te rugăm să completezi toate câmpurile obligatorii');
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const response = await apiClient.post('/api/appointments', {
        doctorId: id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        reason: reason
      });

      // Reîncarcă datele programărilor
      const { bookedSlots: newBookedSlots, userAppointments: newUserAppointments } = 
        await fetchBookedSlots(currentWeekStart);
      
      setBookedSlots(newBookedSlots);
      setUserAppointments(newUserAppointments);

      // Reset form
      setSelectedDate(new Date());
      setSelectedTime('');
      setReason('');
      setSubmitSuccess(response.data.message);
      setSubmitError(null);
    } catch (err) {
      setSubmitError(err.message);
      setSubmitSuccess(null);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-500)]"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-500 text-xl">{error}</p>
    </div>
  );

  if (!doctor) return (
    <div className="text-center py-12">
      <p className="text-lg text-[var(--text-600)]">Doctorul nu a fost găsit.</p>
    </div>
  );

  const averageRating = calculateAverageRating(doctor.reviews);

  return (
    <div className="min-h-screen bg-[var(--background-50)] dark:bg-[var(--background-950)]">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-[var(--background-900)] rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={doctor.profilePicture ? getImageUrl(doctor.profilePicture) : '/default-doctor.jpg'}
                alt={`${doctor.firstName} ${doctor.lastName}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="p-6 md:w-2/3">
              <div className="flex flex-wrap items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)] mb-2">
                    Dr. {doctor.name}
                  </h1>
                  <p className="text-lg text-[var(--text-600)] dark:text-[var(--text-400)] mb-4">
                    {doctor.specialty}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(averageRating)}
                  </div>
                  <span className="text-[var(--text-600)] dark:text-[var(--text-400)]">
                    {averageRating} ({doctor.reviews?.length || 0} review{doctor.reviews?.length !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-[var(--text-600)] dark:text-[var(--text-400)]">
                  <FaMapMarkerAlt className="w-5 h-5 text-[var(--primary-500)]" />
                  <span>{doctor.address || 'București, Sector 1'}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-600)] dark:text-[var(--text-400)]">
                  <FaPhone className="w-5 h-5 text-[var(--primary-500)]" />
                  <span>{doctor.phone || '+40 123 456 789'}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-600)] dark:text-[var(--text-400)]">
                  <FaEnvelope className="w-5 h-5 text-[var(--primary-500)]" />
                  <span>{doctor.email || 'mihai.gavriloaia@gmail.com'}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-600)] dark:text-[var(--text-400)]">
                  <FaClock className="w-5 h-5 text-[var(--primary-500)]" />
                  <span>Luni - Vineri, 09:00 - 17:00</span>
                </div>
              </div>

              <p className="text-[var(--text-700)] dark:text-[var(--text-300)] mb-6">
                {doctor.description || 'bun la toate'}
              </p>

              {isAuthenticated ? (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="inline-flex items-center px-4 py-2 bg-[var(--primary-500)] text-white rounded-lg hover:bg-[var(--primary-600)] transition-colors"
                >
                  {showReviewForm ? 'Anulează Review' : 'Adaugă Review'}
                </button>
              ) : (
                <p className="text-sm text-[var(--text-500)]">
                  Trebuie să fii autentificat pentru a lăsa un review.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Appointments Section */}
          <div className="bg-white dark:bg-[var(--background-900)] rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)] mb-6">
              Programează o Consultație
            </h2>
            
            {isAuthenticated ? (
              <form onSubmit={handleSubmitAppointment} className="space-y-6">
                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => navigateWeek('prev')}
                    disabled={isBefore(currentWeekStart, startOfWeek(new Date(), { weekStartsOn: 1 }))}
                    className="p-2 text-[var(--text-600)] dark:text-[var(--text-400)] hover:text-[var(--primary-500)] dark:hover:text-[var(--primary-400)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Săptămâna anterioară
                  </button>
                  <span className="text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)]">
                    {format(currentWeekStart, 'MMMM yyyy', { locale: ro })}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateWeek('next')}
                    className="p-2 text-[var(--text-600)] dark:text-[var(--text-400)] hover:text-[var(--primary-500)] dark:hover:text-[var(--primary-400)] transition-colors"
                  >
                    Săptămâna următoare →
                  </button>
                </div>

                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-2">
                  {['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa', 'Du'].map((day) => (
                    <div key={day} className="text-center font-medium text-[var(--text-600)] dark:text-[var(--text-400)]">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {weekDates.map((date, index) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const hasSlots = availableSlots[dateStr]?.length > 0;
                    const isPast = isBefore(date, startOfDay(new Date()));
                    
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTime('');
                        }}
                        disabled={!hasSlots || isPast}
                        className={`
                          p-2 rounded-lg text-center transition-colors relative
                          ${isSelected 
                            ? 'bg-[var(--primary-500)] text-white' 
                            : hasSlots && !isPast
                              ? 'bg-[var(--background-100)] dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)] hover:bg-[var(--background-200)] dark:hover:bg-[var(--background-700)] border border-[var(--primary-300)] dark:border-[var(--primary-700)]'
                              : 'bg-[var(--background-50)] dark:bg-[var(--background-900)] text-[var(--text-400)] cursor-not-allowed'
                          }
                        `}
                      >
                        <span className="text-sm">
                          {format(date, 'd')}
                        </span>
                        {hasSlots && !isPast && (
                          <div className="text-xs mt-1 text-[var(--text-500)] dark:text-[var(--text-400)]">
                            {availableSlotsCount[dateStr]} {availableSlotsCount[dateStr] === 1 ? 'slot' : 'sloturi'}
                          </div>
                        )}
                        {isPast && (
                          <div className="text-xs mt-1 text-[var(--text-400)]">
                            Indisponibil
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Time Slots */}
                {selectedDate && availableSlots[format(selectedDate, 'yyyy-MM-dd')] && (
                  <div>
                    <h3 className="text-lg font-medium text-[var(--text-500)] dark:text-[var(--text-300)] mb-3">
                      Ore disponibile pentru {format(selectedDate, 'dd MMMM', { locale: ro })}
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots[format(selectedDate, 'yyyy-MM-dd')].map((time) => {
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
                                w-full p-2 text-center rounded-lg transition-colors relative
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
                              <div className={`font-medium ${!isBooked && !isUnavailable && !isUserAppointment ? 'text-[var(--primary-700)] dark:text-[var(--primary-300)]' : ''}`}>{time}</div>
                              {isUserAppointment && (
                                <div className="text-xs mt-1">
                                  <span className="text-green-700 dark:text-green-300 font-semibold">
                                    {canCancel ? (
                                      <>
                                        Programarea ta
                                        <br />
                                        <span className="underline">Click pentru anulare</span>
                                      </>
                                    ) : (
                                      <>
                                        Programarea ta
                                        <br />
                                        Nu mai poate fi anulată
                                      </>
                                    )}
                                  </span>
                                </div>
                              )}
                              {isBooked && !isUserAppointment && (
                                <div className="text-xs mt-1 text-[var(--text-500)] dark:text-[var(--text-400)]">
                                  Rezervat
                                </div>
                              )}
                              {isUnavailable && !isBooked && (
                                <div className="text-xs mt-1 text-[var(--error-600)] dark:text-[var(--error-200)]">
                                  Expirat
                                </div>
                              )}
                              {!isBooked && !isUnavailable && !isUserAppointment && (
                                <div className="text-xs mt-1 text-[var(--primary-600)] dark:text-[var(--primary-400)] font-medium">
                                  Disponibil
                                </div>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Reason Input */}
                    <div className="mt-4">
                      <label htmlFor="reason" className="block text-sm font-medium text-[var(--text-900)] dark:text-[var(--text-100)] mb-2">
                        Motivul programării
                      </label>
                      <textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-3 border border-[var(--background-200)] dark:border-[var(--background-700)] rounded-lg bg-white dark:bg-[var(--background-800)] text-[var(--text-900)] dark:text-[var(--text-100)]"
                        rows="3"
                        placeholder="Descrieți motivul programării..."
                        required
                      />
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className="p-4 rounded-lg bg-[var(--error-50)] text-[var(--error-600)] dark:bg-[var(--error-900)] dark:text-[var(--error-200)]">
                    {submitError}
                  </div>
                )}

                {submitSuccess && (
                  <div className="p-4 rounded-lg bg-[var(--success-50)] text-[var(--success-600)] dark:bg-[var(--success-900)] dark:text-[var(--success-200)]">
                    {submitSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitLoading || !selectedDate || !selectedTime}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
                    ${submitLoading 
                      ? 'bg-[var(--primary-400)] cursor-not-allowed'
                      : 'bg-[var(--primary-500)] hover:bg-[var(--primary-600)]'}`}
                >
                  {submitLoading ? 'Se procesează...' : 'Confirmă Programarea'}
                </button>
              </form>
            ) : (
              <p className="text-center text-[var(--text-500)]">
                Trebuie să fii autentificat pentru a face o programare.
              </p>
            )}
          </div>

          {/* Reviews Section */}
          <div className="bg-white dark:bg-[var(--background-900)] rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)] mb-6">
              Review-uri ({doctor.reviews?.length || 0})
            </h2>
            {/* Existing code for reviews section */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;