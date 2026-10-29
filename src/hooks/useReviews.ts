import { useState, useEffect, useCallback, useRef } from 'react';
import { Review, CreateReviewDTO } from '../types/review';
import { api } from '../services/api';
import { playNotificationChime } from '../utils/soundAlert';

export function useReviews(isPollingActive = false) {
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('destaqueos_reviews_v2') || localStorage.getItem('royalty_reviews');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [newReviewAlert, setNewReviewAlert] = useState<Review | null>(null);
  const previousIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  const fetchReviews = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const data = await api.getReviews();

      if (!isFirstLoadRef.current && isBackground) {
        const newItems = data.filter((r) => !previousIdsRef.current.has(r.id));
        if (newItems.length > 0) {
          playNotificationChime();
          setNewReviewAlert(newItems[0]);
        }
      }

      previousIdsRef.current = new Set(data.map((r) => r.id));
      isFirstLoadRef.current = false;
      setReviews(data);
    } catch (err) {
      console.warn('Error fetching reviews:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(false);

    if (!isPollingActive) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (!document.hidden) {
          fetchReviews(true);
        }
      }, 20000);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchReviews(true);
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchReviews, isPollingActive]);

  const addReview = async (dto: CreateReviewDTO) => {
    const created = await api.createReview(dto);
    if (created) {
      setReviews((prev) => [created, ...prev]);
    }
    return created;
  };

  const removeReview = async (id: string) => {
    const ok = await api.deleteReview(id);
    if (ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
    return ok;
  };

  const dismissAlert = () => setNewReviewAlert(null);

  return {
    reviews,
    loading,
    newReviewAlert,
    dismissAlert,
    refreshReviews: () => fetchReviews(false),
    addReview,
    removeReview
  };
}
