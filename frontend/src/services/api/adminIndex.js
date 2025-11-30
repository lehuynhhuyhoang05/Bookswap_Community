// Admin API Services - Quản lý hệ thống

// Books Management
export * from './adminBooks';

// Conversations & Messages Management
export * from './adminConversations';

// Reviews Management
export * from './adminReviews';

// Exchanges Management
export * from './adminExchanges';

// Users Management
export * from './adminUsers';

// Reports Management
export * from './adminReports';

// Dashboard & Statistics
export * from './adminDashboard';

// Re-export default objects for easy import
import adminBooksService from './adminBooks';
import adminConversationsService from './adminConversations';
import adminDashboardService from './adminDashboard';
import adminExchangesService from './adminExchanges';
import adminReportsService from './adminReports';
import adminReviewsService from './adminReviews';
import adminUsersService from './adminUsers';

export const adminServices = {
  books: adminBooksService,
  conversations: adminConversationsService,
  reviews: adminReviewsService,
  exchanges: adminExchangesService,
  users: adminUsersService,
  reports: adminReportsService,
  dashboard: adminDashboardService,
};
