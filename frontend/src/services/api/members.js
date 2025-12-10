// src/services/api/members.js
// Service for fetching member information
import api from './config';

const API_PREFIX = '/api/v1';

export const membersService = {
  /**
   * Get member by ID
   * Fetches member info from reviews stats endpoint since there's no dedicated members endpoint
   */
  async getMemberById(memberId) {
    try {
      // Get reviews stats - this will return member stats even if no reviews
      const reviewsResponse = await api.get(`${API_PREFIX}/reviews/member/${memberId}/stats`);
      
      if (reviewsResponse.data) {
        return {
          member_id: memberId,
          trust_score: reviewsResponse.data.trust_score || 0,
          average_rating: reviewsResponse.data.average_rating || 0,
          total_reviews: reviewsResponse.data.total_reviews || 0,
          // These may not be available from reviews endpoint
          region: reviewsResponse.data.region || null,
          successful_exchanges: reviewsResponse.data.successful_exchanges || 0,
          created_at: reviewsResponse.data.created_at || null,
          user: reviewsResponse.data.user || {
            user_id: reviewsResponse.data.user_id,
            username: reviewsResponse.data.username,
            full_name: reviewsResponse.data.full_name,
            avatar_url: reviewsResponse.data.avatar_url,
          },
        };
      }

      throw new Error('Member not found');
    } catch (error) {
      console.error('getMemberById error:', error);
      
      // Return a minimal member object to prevent complete failure
      if (error.response?.status === 404) {
        return {
          member_id: memberId,
          trust_score: 0,
          average_rating: 0,
          total_reviews: 0,
          user: { username: 'Không tìm thấy' },
        };
      }
      
      throw error.response?.data || { message: 'Failed to fetch member' };
    }
  },

  /**
   * Get member's books
   */
  async getMemberBooks(memberId, params = {}) {
    try {
      const response = await api.get(`${API_PREFIX}/books`, {
        params: {
          owner_id: memberId,
          page: 1,
          limit: 20,
          ...params,
        },
      });
      
      const data = response.data;
      return {
        items: data?.items || data || [],
        total: data?.total || 0,
        page: data?.page || 1,
        pageSize: data?.pageSize || data?.limit || 20,
      };
    } catch (error) {
      console.error('getMemberBooks error:', error);
      return { items: [], total: 0 };
    }
  },

  /**
   * Search members (for admin or messaging)
   */
  async searchMembers(query, params = {}) {
    try {
      // Use conversations/search-users endpoint if available
      const response = await api.get(`${API_PREFIX}/conversations/search-users`, {
        params: {
          q: query,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error('searchMembers error:', error);
      return [];
    }
  },
};

export default membersService;
