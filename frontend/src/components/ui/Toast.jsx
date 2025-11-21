// src/components/ui/Toast.jsx
const Toast = ({ message, type = 'info', onClose, show = false }) => {
  if (!show) return null;

  const types = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`${types[type]} text-white px-6 py-4 rounded-md shadow-lg flex items-center justify-between min-w-64`}>
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;