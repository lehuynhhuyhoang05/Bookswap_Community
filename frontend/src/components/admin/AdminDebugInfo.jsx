import { useEffect, useState } from 'react';
import api from '../../services/api/config';

/**
 * Component debug để kiểm tra trạng thái admin
 * Chỉ dùng trong development
 */
const AdminDebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [apiTest, setApiTest] = useState({
    tested: false,
    result: null,
    error: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');
    const isAdmin = localStorage.getItem('isAdmin');
    const userData = localStorage.getItem('user');

    setDebugInfo({
      hasToken: !!token,
      token: token ? `${token.substring(0, 20)}...` : 'null',
      userRole,
      isAdmin,
      userData: userData ? JSON.parse(userData) : null,
      localStorage: {
        accessToken: !!localStorage.getItem('accessToken'),
        userRole: localStorage.getItem('userRole'),
        isAdmin: localStorage.getItem('isAdmin'),
      },
    });
  }, []);

  const testAdminAPI = async () => {
    setApiTest({ tested: true, result: null, error: null });
    try {
      const response = await api.get('/admin/users', {
        params: { page: 1, limit: 1 },
      });
      setApiTest({ tested: true, result: 'SUCCESS ✓', error: null });
    } catch (error) {
      setApiTest({
        tested: true,
        result: null,
        error: `${error.response?.status || 'ERROR'}: ${error.response?.data?.message || error.message}`,
      });
    }
  };

  if (import.meta.env.PROD) {
    return null; // Không hiển thị trong production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <h3 className="font-bold mb-2 text-yellow-400">🔧 Admin Debug Info</h3>
      <div className="text-xs space-y-1">
        <div>
          <span className="text-gray-400">Has Token:</span>{' '}
          <span
            className={debugInfo.hasToken ? 'text-green-400' : 'text-red-400'}
          >
            {debugInfo.hasToken ? '✓ YES' : '✗ NO'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Token:</span>{' '}
          <span className="text-gray-300">{debugInfo.token}</span>
        </div>
        <div>
          <span className="text-gray-400">User Role:</span>{' '}
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
        <div>
          <span className="text-gray-400">Is Admin:</span>{' '}
          <span
            className={
              debugInfo.isAdmin === 'true' ? 'text-green-400' : 'text-red-400'
            }
          >
            {debugInfo.isAdmin || 'null'}
          </span>
        </div>
        {debugInfo.userData && (
          <div>
            <span className="text-gray-400">User Data:</span>
            <pre className="text-xs bg-gray-800 p-2 rounded mt-1 overflow-auto max-h-32">
              {JSON.stringify(debugInfo.userData, null, 2)}
            </pre>
          </div>
        )}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-2">Quick Checks:</p>
        <ul className="text-xs space-y-1">
          <li
            className={debugInfo.hasToken ? 'text-green-400' : 'text-red-400'}
          >
            {debugInfo.hasToken ? '✓' : '✗'} Access Token exists
          </li>
          <li
            className={
              debugInfo.userRole === 'ADMIN' ? 'text-green-400' : 'text-red-400'
            }
          >
            {debugInfo.userRole === 'ADMIN' ? '✓' : '✗'} User role is ADMIN
          </li>
          <li
            className={
              debugInfo.isAdmin === 'true' ? 'text-green-400' : 'text-red-400'
            }
          >
            {debugInfo.isAdmin === 'true' ? '✓' : '✗'} isAdmin flag is true
          </li>
        </ul>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        💡 Nếu các check trên đều ✗, bạn cần:
        <ol className="list-decimal list-inside mt-1 text-gray-400">
          <li>Đăng nhập với tài khoản admin</li>
          <li>Hoặc tạo admin trong database</li>
          <li>Hoặc update role trong localStorage</li>
        </ol>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-700">
        <button
          onClick={testAdminAPI}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded"
        >
          Test Admin API
        </button>
        {apiTest.tested && (
          <div
            className={`mt-2 text-xs p-2 rounded ${apiTest.error ? 'bg-red-900' : 'bg-green-900'}`}
          >
            {apiTest.error ? (
              <div>
                <div className="text-red-300 font-bold">API Test Failed:</div>
                <div className="text-red-200">{apiTest.error}</div>
              </div>
            ) : (
              <div className="text-green-300 font-bold">{apiTest.result}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDebugInfo;
