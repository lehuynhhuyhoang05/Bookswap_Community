export class PaginatedReviewsDto<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
