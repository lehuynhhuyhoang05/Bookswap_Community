import React from 'react';
import Card from '../ui/Card';
import RatingStars from '../ui/RatingStars';

const ReviewStats = ({ stats, className = '' }) => {
  if (!stats) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">No review statistics available</div>
      </Card>
    );
  }

  const { average_rating, total_reviews, rating_breakdown = {} } = stats;

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Review Statistics</h3>
      
      <div className="flex items-center space-x-6 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">
            {average_rating?.toFixed(1) || '0.0'}
          </div>
          <div className="flex justify-center mt-1">
            <RatingStars rating={average_rating} size="sm" />
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {total_reviews || 0} review{total_reviews !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = rating_breakdown[star] || 0;
            const percentage = total_reviews > 0 ? (count / total_reviews) * 100 : 0;

            return (
              <div key={star} className="flex items-center space-x-2">
                <span className="w-8 text-sm text-gray-600">{star}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-8 text-sm text-gray-500 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default ReviewStats;