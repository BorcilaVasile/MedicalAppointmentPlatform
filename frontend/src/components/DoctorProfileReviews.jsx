import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import apiClient from '../config/api';

function DoctorProfileReviews({ doctorId, doctor, isAuthenticated, token, onReviewAdded }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    console.log('Submitting review:', review);
    if (!isAuthenticated) {
      setSubmitError('Trebuie să fii autentificat pentru a lăsa un review');
      return;
    }
  
    // Validare frontend
    if (!review.comment || review.comment.length < 10) {
      setSubmitError('Comentariul trebuie să conțină minim 10 caractere');
      return;
    }
  
    setSubmitLoading(true);
    setSubmitError(null);
  
    try {
      const response = await apiClient.post('/api/reviews', {
        doctorId: doctorId,
        comment: review.comment,
        rating: review.rating
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      // Call the callback to update doctor reviews in the parent component
      if (onReviewAdded) {
        onReviewAdded(response.data.review);
      }
      
      setShowReviewForm(false);
      setReview({ rating: 5, comment: '' });
      
      // Afișare mesaj succes
      setSubmitSuccess('Recenzia a fost adăugată!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(null);
      }, 3000);
  
    } catch (err) {
      console.error('Eroare submit review:', err);
      setSubmitError(
        err.response?.data?.error || 
        err.response?.data?.errors?.[0]?.msg || 
        'A apărut o eroare. Încearcă din nou.'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Calculate average rating
  const getAverageRating = () => {
    if (!doctor.reviews || doctor.reviews.length === 0) return 0;
    const sum = doctor.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / doctor.reviews.length;
  };

  return (
    <div className="bg-white dark:bg-[var(--background-900)] rounded-xl shadow-sm p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-900)] dark:text-[var(--text-100)]">
            Reviews ({doctor.reviews?.length || 0})
          </h2>
          
          {doctor.reviews && doctor.reviews.length > 0 && (
            <div className="flex items-center mt-2">
              <div className="flex mr-2">
                {(() => {
                  // Calculate average rating
                  const avgRating = getAverageRating();
                  const fullStars = Math.floor(avgRating);
                  const hasHalfStar = avgRating % 1 >= 0.5;
                  
                  return [...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < fullStars 
                          ? 'text-yellow-500' 
                          : i === fullStars && hasHalfStar 
                            ? 'text-yellow-300' 
                            : 'text-gray-300'
                      }`}
                    />
                  ));
                })()}
              </div>
              <span className="text-[var(--text-700)] dark:text-[var(--text-300)] font-medium">
                {getAverageRating().toFixed(1)}
              </span>
            </div>
          )}
        </div>
        
        {isAuthenticated ? (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className={`inline-flex items-center px-4 py-2 bg-[var(--primary-500)] text-white rounded-lg hover:bg-[var(--primary-600)] transition-colors ${showReviewForm ? 'bg-[var(--error-500)] hover:bg-[var(--error-600)]' : ''}`}
          >
            {showReviewForm ? 'Cancel' : 'Add a review'}
          </button>
        ) : (
          <p className="text-sm text-[var(--text-500)]">
            You need to be authenticated to leave a review.
          </p>
        )}
      </div>
      
      {submitSuccess && (
        <div className="mb-4 p-4 rounded-lg bg-[var(--success-50)] text-[var(--success-600)] dark:bg-[var(--success-900)] dark:text-[var(--success-200)]">
          {submitSuccess}
        </div>
      )}
      
      {showReviewForm && (
        <form
          onSubmit={handleSubmitReview}
          className="mb-6 bg-[var(--background-50)] dark:bg-[var(--background-800)] p-6 rounded-xl shadow-sm space-y-5"
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)]">
              Rating
            </label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <label key={star} className="cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    value={star}
                    checked={review.rating === star}
                    onChange={() => setReview({ ...review, rating: star })}
                    className="hidden"
                  />
                  <FaStar
                    className={`w-6 h-6 ${review.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                  />
                </label>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="comment" className="block text-sm font-medium text-[var(--text-700)] dark:text-[var(--text-300)]">
              Comment
            </label>
            <textarea
              id="comment"
              rows="4"
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })}
              className="w-full border border-[var(--background-200)] dark:border-[var(--background-700)] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary-400)] focus:border-transparent resize-none bg-white dark:bg-[var(--background-900)] text-[var(--text-900)] dark:text-[var(--text-100)]"
              placeholder="Write your comment here..."
              required
            />
          </div>
          
          {submitError && (
            <div className="p-4 rounded-lg bg-[var(--error-50)] text-[var(--error-600)] dark:bg-[var(--error-900)] dark:text-[var(--error-200)]">
              {submitError}
            </div>
          )}
        
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={submitLoading}
              className="px-6 py-2 bg-[var(--primary-500)] text-white font-semibold rounded-lg hover:bg-[var(--primary-600)] disabled:bg-[var(--primary-400)] transition-colors"
            >
              {submitLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}
      
      {/* Reviews list with fixed height and scrolling */}
      <div className="overflow-y-auto flex-grow" style={{ maxHeight: "500px" }}>
        {doctor.reviews && doctor.reviews.length > 0 ? (
          <div className="space-y-4 pr-2">
            {doctor.reviews.map((review, index) => (
              <div 
                key={review.id || index} 
                className="bg-white dark:bg-[var(--background-800)] rounded-lg shadow-md p-4 border border-[var(--background-200)] dark:border-[var(--background-700)] hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary-100)] dark:bg-[var(--primary-900)] text-[var(--primary-600)] dark:text-[var(--primary-300)] flex items-center justify-center text-lg font-medium">
                      {(review.user?.name?.[0] || "A")}
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold text-[var(--text-800)] dark:text-[var(--text-200)]">
                        {review.user?.name || "Anonymous"}
                      </div>
                      <div className="flex mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar 
                            key={star} 
                            className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-500)] dark:text-[var(--text-400)]">
                    {review.createdAt && new Date(review.createdAt).toLocaleDateString('ro-RO', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-[var(--background-200)] dark:border-[var(--background-700)]">
                  <p className="text-[var(--text-700)] dark:text-[var(--text-300)] whitespace-pre-wrap">
                    {review.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[var(--text-500)] dark:text-[var(--text-400)] py-4">
            No reviews yet. Be the first to leave a review!
          </p>
        )}
      </div>
    </div>
  );
}

export default DoctorProfileReviews; 