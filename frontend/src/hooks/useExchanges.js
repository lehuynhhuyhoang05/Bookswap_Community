import { useState, useEffect } from 'react';
import { exchangeService } from '../services/api/exchanges';

export const useExchanges = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApiCall = async (apiCall, successCallback = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      if (successCallback) successCallback(result);
      return result;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    setError,

    // Exchanges
    getExchanges: (params) => 
      handleApiCall(() => exchangeService.getExchanges(params)),

    getExchangeDetail: (id) => 
      handleApiCall(() => exchangeService.getExchangeDetail(id)),

    confirmExchange: (id) => 
      handleApiCall(() => exchangeService.confirmExchange(id)),

    // Exchange Requests
    createExchangeRequest: (data) => 
      handleApiCall(() => exchangeService.createExchangeRequest(
        exchangeService.formatExchangeRequest(data)
      )),

    getExchangeRequests: (params) => 
      handleApiCall(() => exchangeService.getExchangeRequests(params)),

    getExchangeRequestDetail: (id) => 
      handleApiCall(() => exchangeService.getExchangeRequestDetail(id)),

    cancelExchangeRequest: (id) => 
      handleApiCall(() => exchangeService.cancelExchangeRequest(id)),

    respondToExchangeRequest: (id, action, reason = '') => 
      handleApiCall(() => exchangeService.respondToExchangeRequest(
        id, 
        exchangeService.formatResponseData(action, reason)
      )),

    // Stats
    getExchangeStats: () => 
      handleApiCall(() => exchangeService.getExchangeStats()),

    // Suggestions
    getExchangeSuggestions: (limit) => 
      handleApiCall(() => exchangeService.getExchangeSuggestions(limit)),

    markSuggestionAsViewed: (id) => 
      handleApiCall(() => exchangeService.markSuggestionAsViewed(id)),

    generateExchangeSuggestions: () => 
      handleApiCall(() => exchangeService.generateExchangeSuggestions()),
  };
};