import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Debug Component for User Management Page
 * Hiển thị chi tiết về API calls, data structure, và errors
 */
const UserManagementDebug = ({ users, loading, error, filters }) => {
  const [apiLogs, setApiLogs] = useState([]);
  const [debugInfo, setDebugInfo] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [actionLogs, setActionLogs] = useState([]);

  useEffect(() => {
    // Collect debug info
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');
    const userData = localStorage.getItem('user');

    setDebugInfo({
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 30)}...` : 'null',
      userRole,
      userData: userData ? JSON.parse(userData) : null,
      timestamp: new Date().toISOString(),
    });

    // Listen to console logs
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      const message = args.join(' ');
      if (
        message.includes('[Admin Users]') ||
        message.includes('[UserManagement]')
      ) {
        setApiLogs((prev) => [
          ...prev.slice(-20), // Keep last 20 logs
          {
            type: 'log',
            message: message,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      if (
        message.includes('[Admin Users]') ||
        message.includes('[UserManagement]')
      ) {
        setApiLogs((prev) => [
          ...prev.slice(-20),
          {
            type: 'error',
            message: message,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
      originalError.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const testAdminAPI = async () => {
    setTestResult({ status: 'testing', message: 'Testing API...' });
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3003/admin/users', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult({
          status: 'success',
          message: `✅ API hoạt động! Nhận được ${data.items?.length || data.length || 0} users`,
          data: data,
        });
      } else {
        setTestResult({
          status: 'error',
          message: `❌ API lỗi: ${data.message || response.statusText}`,
          statusCode: response.status,
          data: data,
        });
      }
    } catch (err) {
      setTestResult({
        status: 'error',
        message: `❌ Không kết nối được API: ${err.message}`,
        error: err.toString(),
      });
    }
  };

  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-2xl max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
      <h3 className="font-bold mb-3 text-yellow-400 text-lg flex items-center gap-2">
        🔍 User Management Debug Panel
        <button
          onClick={() => {
            const panel = document.getElementById('debug-panel');
            panel.style.display =
              panel.style.display === 'none' ? 'block' : 'none';
          }}
          className="ml-auto text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
        >
          Toggle
        </button>
      </h3>

      <div id="debug-panel">
        {/* Auth Info */}
        <div className="mb-4 p-3 bg-gray-800 rounded">
          <h4 className="font-semibold text-sm mb-2 text-cyan-400">
            🔐 Authentication
          </h4>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Has Token:</span>
              <span
                className={
                  debugInfo.hasToken ? 'text-green-400' : 'text-red-400'
                }
              >
                {debugInfo.hasToken ? '✓ YES' : '✗ NO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">User Role:</span>
              <span
                className={
                  debugInfo.userRole === 'ADMIN'
                    ? 'text-green-400'
                    : 'text-orange-400'
                }
              >
                {debugInfo.userRole || 'null'}
              </span>
            </div>
            <div className="text-gray-500 text-xs mt-1 break-all">
              Token: {debugInfo.tokenPreview}
            </div>
          </div>
        </div>

        {/* Current State */}
        <div className="mb-4 p-3 bg-gray-800 rounded">
          <h4 className="font-semibold text-sm mb-2 text-cyan-400">
            📊 Current State
          </h4>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Loading:</span>
              <span className={loading ? 'text-yellow-400' : 'text-gray-500'}>
                {loading ? 'YES ⏳' : 'NO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Error:</span>
              <span className={error ? 'text-red-400' : 'text-green-400'}>
                {error ? `YES: ${error}` : 'NO ✓'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Users Count:</span>
              <span className="text-white">
                {Array.isArray(users) ? users.length : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Users Type:</span>
              <span className="text-white">
                {Array.isArray(users) ? 'Array ✓' : typeof users}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 p-3 bg-gray-800 rounded">
          <h4 className="font-semibold text-sm mb-2 text-cyan-400">
            🔎 Current Filters
          </h4>
          <pre className="text-xs text-gray-300 overflow-auto">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>

        {/* API Test */}
        <div className="mb-4 p-3 bg-gray-800 rounded">
          <h4 className="font-semibold text-sm mb-2 text-cyan-400">
            🧪 API Test
          </h4>
          <button
            onClick={testAdminAPI}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
          >
            Test Admin Users API
          </button>
          {testResult && (
            <div
              className={`mt-2 p-2 rounded text-xs ${
                testResult.status === 'success'
                  ? 'bg-green-900 text-green-200'
                  : testResult.status === 'error'
                    ? 'bg-red-900 text-red-200'
                    : 'bg-yellow-900 text-yellow-200'
              }`}
            >
              <div className="font-semibold mb-1">{testResult.message}</div>
              {testResult.statusCode && (
                <div>Status Code: {testResult.statusCode}</div>
              )}
              {testResult.data && (
                <pre className="mt-1 text-xs overflow-auto max-h-32">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Users Data Preview */}
        {Array.isArray(users) && users.length > 0 && (
          <div className="mb-4 p-3 bg-gray-800 rounded">
            <h4 className="font-semibold text-sm mb-2 text-cyan-400">
              👥 Users Data (First 3)
            </h4>
            <pre className="text-xs text-gray-300 overflow-auto max-h-48">
              {JSON.stringify(users.slice(0, 3), null, 2)}
            </pre>
          </div>
        )}

        {/* API Logs */}
        <div className="mb-4 p-3 bg-gray-800 rounded">
          <h4 className="font-semibold text-sm mb-2 text-cyan-400">
            📝 API Logs (Last 15)
          </h4>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {apiLogs.length === 0 ? (
              <div className="text-xs text-gray-500">No logs yet...</div>
            ) : (
              apiLogs.slice(-15).map((log, i) => (
                <div
                  key={i}
                  className={`text-xs p-2 rounded ${
                    log.type === 'error'
                      ? 'bg-red-900 text-red-200 border border-red-700'
                      : log.message.includes('successful')
                        ? 'bg-green-900 text-green-200 border border-green-700'
                        : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  <div className="text-gray-400 text-xs mb-1">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="break-all font-mono">{log.message}</div>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setApiLogs([])}
            className="mt-2 w-full px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            Clear Logs
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-3 bg-gray-800 rounded">
          <h4 className="font-semibold text-sm mb-2 text-cyan-400">
            ⚡ Quick Actions
          </h4>
          <div className="space-y-2">
            <button
              onClick={() => {
                console.log('=== DEBUG INFO ===');
                console.log('Users:', users);
                console.log('Loading:', loading);
                console.log('Error:', error);
                console.log('Filters:', filters);
                console.log('Token:', localStorage.getItem('accessToken'));
                console.log('User Role:', localStorage.getItem('userRole'));
              }}
              className="w-full px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            >
              Log All Info to Console
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                alert('LocalStorage cleared! Vui lòng đăng nhập lại.');
                window.location.href = '/auth/login';
              }}
              className="w-full px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-xs"
            >
              Clear LocalStorage & Logout
            </button>
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="mt-4 p-3 bg-blue-900 rounded">
          <h4 className="font-semibold text-sm mb-2 text-blue-200">
            💡 Troubleshooting
          </h4>
          <div className="text-xs text-blue-100 space-y-1">
            {!debugInfo.hasToken && (
              <div className="flex items-start gap-1">
                <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>Không có token - Vui lòng đăng nhập</span>
              </div>
            )}
            {debugInfo.userRole !== 'ADMIN' && (
              <div className="flex items-start gap-1">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>User role không phải ADMIN - Kiểm tra database</span>
              </div>
            )}
            {error && (
              <div className="flex items-start gap-1">
                <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>Có lỗi: {error}</span>
              </div>
            )}
            {!Array.isArray(users) && !loading && (
              <div className="flex items-start gap-1">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>Users không phải array - Kiểm tra API response</span>
              </div>
            )}
            {Array.isArray(users) && users.length === 0 && !loading && (
              <div className="flex items-start gap-1">
                <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>API hoạt động nhưng không có users</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementDebug;
