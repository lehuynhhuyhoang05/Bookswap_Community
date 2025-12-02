import React from 'react';
import { Check, Clock, MapPin, Users, Star } from 'lucide-react';

/**
 * MeetingTimeline Component
 * Displays progress of exchange workflow with visual timeline
 */
const MeetingTimeline = ({ exchange, currentUserId }) => {
  const steps = [
    {
      key: 'REQUEST',
      label: 'Yêu cầu',
      icon: Users,
      description: 'Tạo yêu cầu trao đổi',
      completed: true
    },
    {
      key: 'SCHEDULE',
      label: 'Lịch hẹn',
      icon: MapPin,
      description: 'Đặt lịch gặp mặt',
      completed: exchange?.meeting_location && exchange?.meeting_time,
      active: exchange?.status === 'PENDING' && !exchange?.meeting_location
    },
    {
      key: 'CONFIRM',
      label: 'Xác nhận',
      icon: Check,
      description: 'Cả hai xác nhận lịch hẹn',
      completed: exchange?.meeting?.is_confirmed || exchange?.status === 'MEETING_SCHEDULED' || exchange?.status === 'IN_PROGRESS' || exchange?.status === 'COMPLETED',
      active: exchange?.status === 'PENDING' && exchange?.meeting_location && !exchange?.meeting?.is_confirmed
    },
    {
      key: 'MEET',
      label: 'Gặp mặt',
      icon: Users,
      description: 'Trao đổi sách trực tiếp',
      completed: exchange?.status === 'IN_PROGRESS' || exchange?.status === 'COMPLETED',
      active: exchange?.status === 'MEETING_SCHEDULED'
    },
    {
      key: 'COMPLETE',
      label: 'Hoàn tất',
      icon: Star,
      description: 'Đánh giá & hoàn thành',
      completed: exchange?.status === 'COMPLETED',
      active: exchange?.status === 'IN_PROGRESS'
    }
  ];

  const getStepStatus = (step, index) => {
    if (step.completed) return 'completed';
    if (step.active) return 'active';
    if (index > 0 && steps[index - 1].completed) return 'upcoming';
    return 'pending';
  };

  const getStepStyles = (status) => {
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-green-500 border-green-500 text-white',
          line: 'bg-green-500',
          text: 'text-green-700',
          iconBg: 'bg-green-100'
        };
      case 'active':
        return {
          circle: 'bg-blue-500 border-blue-500 text-white animate-pulse',
          line: 'bg-gray-300',
          text: 'text-blue-700 font-semibold',
          iconBg: 'bg-blue-100'
        };
      case 'upcoming':
        return {
          circle: 'bg-white border-gray-400 text-gray-600',
          line: 'bg-gray-300',
          text: 'text-gray-600',
          iconBg: 'bg-gray-100'
        };
      default:
        return {
          circle: 'bg-white border-gray-300 text-gray-400',
          line: 'bg-gray-200',
          text: 'text-gray-400',
          iconBg: 'bg-gray-50'
        };
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        Tiến trình giao dịch
      </h2>

      {/* Desktop Timeline */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Line */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ 
                width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` 
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(step, index);
              const styles = getStepStyles(status);
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center" style={{ width: '20%' }}>
                  {/* Icon Circle */}
                  <div 
                    className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-3 transition-all duration-300 ${styles.circle} ${styles.iconBg}`}
                  >
                    {step.completed ? (
                      <Check className="w-8 h-8" />
                    ) : (
                      <Icon className="w-8 h-8" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <div className={`font-semibold text-sm mb-1 ${styles.text}`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-500 max-w-[100px]">
                      {step.description}
                    </div>
                    {status === 'active' && (
                      <div className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full inline-block">
                        Đang thực hiện
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Timeline */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const styles = getStepStyles(status);
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-start gap-4">
              {/* Icon Circle */}
              <div className="relative">
                <div 
                  className={`w-12 h-12 rounded-full border-3 flex items-center justify-center transition-all duration-300 ${styles.circle} ${styles.iconBg}`}
                >
                  {step.completed ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div 
                    className={`absolute left-1/2 top-12 w-0.5 h-8 -ml-px ${steps[index + 1].completed ? 'bg-green-500' : 'bg-gray-300'}`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className={`font-semibold mb-1 ${styles.text}`}>
                  {step.label}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {step.description}
                </div>
                {status === 'active' && (
                  <div className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full inline-block">
                    Đang thực hiện
                  </div>
                )}
                {step.completed && (
                  <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <Check className="w-3 h-3" />
                    Hoàn thành
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-gray-600 font-medium">
            {steps.filter(s => s.completed).length} / {steps.length} bước hoàn thành
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingTimeline;
