export class ReviewResponseDto {
  review_id: string;
  exchange_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  trust_score_impact: number;
  created_at: Date;
  updated_at: Date;
}
