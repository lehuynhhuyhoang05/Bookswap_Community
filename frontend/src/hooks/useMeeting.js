import { useState } from 'react';
import { exchangeService } from '../services/api/exchanges';

/**
 * Hook for Meeting Arrangement Features
 */
export const useMeeting = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Schedule a meeting for an exchange
   * POST /exchanges/:id/meeting/schedule
   */
  const scheduleMeeting = async (exchangeId, meetingData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await exchangeService.scheduleMeeting(exchangeId, meetingData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to schedule meeting';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Confirm a meeting (member confirms attendance)
   * PATCH /exchanges/:id/meeting/confirm
   */
  const confirmMeeting = async (exchangeId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await exchangeService.confirmMeeting(exchangeId);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to confirm meeting';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Start an exchange (both members present at meeting)
   * PATCH /exchanges/:id/start
   */
  const startExchange = async (exchangeId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await exchangeService.startExchange(exchangeId);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to start exchange';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update meeting information
   * PATCH /exchanges/:id/meeting
   */
  const updateMeeting = async (exchangeId, meetingData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await exchangeService.updateMeeting(exchangeId, meetingData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update meeting';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel meeting (before it happens)
   */
  const cancelMeeting = async (exchangeId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const response = await exchangeService.cancelExchange(exchangeId, {
        cancellation_reason: reason,
        cancellation_details: 'Meeting cancelled'
      });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to cancel meeting';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    scheduleMeeting,
    confirmMeeting,
    startExchange,
    updateMeeting,
    cancelMeeting,
    loading,
    error
  };
};
