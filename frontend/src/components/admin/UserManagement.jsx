import {
  Activity,
  AlertCircle,
  Lock,
  Search,
  Shield,
  Trash2,
  Unlock,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAdminUsers } from '../../hooks/useAdmin';

const UserManagement = () => {
  const {
    users,
    loading,
    error,
    fetchUsers,
    removeUser,
    lockUser,
    unlockUser,
    changeUserRole,
    fetchUserActivities,
    fetchUserActivityStats,
  } = useAdminUsers();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    role: '',
    status: 'ACTIVE', // Mặc định chỉ hiện users đang hoạt động
    search: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  const [modalState, setModalState] = useState({
    type: null, // 'delete' | 'lock' | 'unlock' | 'role' | 'activities'
    user: null,
    reason: '',
    duration: 7,
    newRole: '',
  });

  const [activities, setActivities] = useState([]);
  const [activityStats, setActivityStats] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [
    filters.page,
    filters.limit,
    filters.role,
    filters.status,
    filters.search,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const loadUsers = async () => {
    try {
      await fetchUsers(filters);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const openModal = (type, user) => {
    setModalState({
      type,
      user,
      reason: '',
      duration: 7,
      newRole: user?.role || 'MEMBER',
    });
  };

  const closeModal = () => {
    setModalState({
      type: null,
      user: null,
      reason: '',
      duration: 7,
      newRole: '',
    });
    setActivities([]);
    setActivityStats(null);
  };

  const handleDeleteUser = async () => {
    if (!modalState.reason.trim()) {
      alert('Vui lòng nhập lý do xóa user');
      return;
    }

    try {
      console.log(
        '[UserManagement] Deleting user:',
        modalState.user.user_id,
        'Reason:',
        modalState.reason,
      );
      await removeUser(modalState.user.user_id, modalState.reason);
      console.log('[UserManagement] Delete successful, reloading users...');
      closeModal();
      await loadUsers(); // Reload danh sách sau khi xóa
      alert('Xóa user thành công!');
    } catch (err) {
      console.error('[UserManagement] Delete failed:', err);
      alert('Lỗi khi xóa user: ' + err.message);
    }
  };

  const handleLockUser = async () => {
    if (!modalState.reason.trim()) {
      alert('Vui lòng nhập lý do khóa tài khoản');
      return;
    }

    try {
      console.log(
        '[UserManagement] Locking user:',
        modalState.user.user_id,
        'Duration:',
        modalState.duration,
      );
      await lockUser(
        modalState.user.user_id,
        modalState.reason,
        modalState.duration,
      );
      console.log('[UserManagement] Lock successful, reloading users...');
      closeModal();
      await loadUsers();
      alert('Khóa tài khoản thành công!');
    } catch (err) {
      console.error('[UserManagement] Lock failed:', err);
      alert('Lỗi khi khóa tài khoản: ' + err.message);
    }
  };

  const handleUnlockUser = async () => {
    if (!modalState.reason.trim()) {
      alert('Vui lòng nhập lý do mở khóa');
      return;
    }

    try {
      console.log('[UserManagement] Unlocking user:', modalState.user.user_id);
      await unlockUser(modalState.user.user_id, modalState.reason);
      console.log('[UserManagement] Unlock successful, reloading users...');
      closeModal();
      await loadUsers();
      alert('Mở khóa tài khoản thành công!');
    } catch (err) {
      console.error('[UserManagement] Unlock failed:', err);
      alert('Lỗi khi mở khóa: ' + err.message);
    }
  };

  const handleChangeRole = async () => {
    if (!modalState.reason.trim()) {
      alert('Vui lòng nhập lý do thay đổi quyền');
      return;
    }

    try {
      console.log(
        '[UserManagement] Changing role:',
        modalState.user.user_id,
        'New role:',
        modalState.newRole,
      );
      await changeUserRole(
        modalState.user.user_id,
        modalState.newRole,
        modalState.reason,
      );
      console.log(
        '[UserManagement] Role change successful, reloading users...',
      );
      closeModal();
      await loadUsers();
      alert('Thay đổi quyền thành công!');
    } catch (err) {
      console.error('[UserManagement] Role change failed:', err);
      alert('Lỗi khi thay đổi quyền: ' + err.message);
    }
  };

  const handleViewActivities = async (user) => {
    try {
      openModal('activities', user);
      const [activitiesData, statsData] = await Promise.all([
        fetchUserActivities(user.user_id, { page: 1, limit: 50 }),
        fetchUserActivityStats(user.user_id, { days: 30 }),
      ]);
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      setActivityStats(statsData);
    } catch (err) {
      alert('Lỗi khi tải hoạt động: ' + err.message);
      setActivities([]);
      setActivityStats(null);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Quản lý người dùng
        </h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <form onSubmit={handleSearch} className="col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo email hoặc tên..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          <select
            value={filters.role}
            onChange={(e) =>
              setFilters({ ...filters, role: e.target.value, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả quyền</option>
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="LOCKED">Bị khóa</option>
            <option value="DELETED">Đã xóa</option>
          </select>
        </div>

        <div className="flex gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="created_at">Ngày tạo</option>
            <option value="email">Email</option>
            <option value="full_name">Tên</option>
          </select>
          <select
            value={filters.sortOrder}
            onChange={(e) =>
              setFilters({ ...filters, sortOrder: e.target.value })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ASC">Tăng dần</option>
            <option value="DESC">Giảm dần</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quyền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!Array.isArray(users) || users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.user_id}
                    className={
                      user.account_status === 'LOCKED' ? 'bg-yellow-50' : ''
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.account_status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : user.account_status === 'DELETED'
                              ? 'bg-gray-100 text-gray-800 line-through'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.account_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        {user.account_status !== 'DELETED' && (
                          <>
                            <button
                              onClick={() => handleViewActivities(user)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Xem hoạt động"
                            >
                              <Activity className="h-4 w-4" />
                            </button>
                            {user.account_status === 'ACTIVE' ? (
                              <button
                                onClick={() => openModal('lock', user)}
                                className="text-orange-600 hover:text-orange-900"
                                title="Khóa tài khoản"
                              >
                                <Lock className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => openModal('unlock', user)}
                                className="text-green-600 hover:text-green-900"
                                title="Mở khóa"
                              >
                                <Unlock className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => openModal('role', user)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Thay đổi quyền"
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openModal('delete', user)}
                              className="text-red-600 hover:text-red-900"
                              title="Xóa user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {user.account_status === 'DELETED' && (
                          <span className="text-xs text-gray-500 italic">
                            Đã xóa
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Hiển thị trang {filters.page} - {filters.limit} users mỗi trang
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setFilters({ ...filters, page: Math.max(1, filters.page - 1) })
            }
            disabled={filters.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={users.length < filters.limit}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      </div>

      {/* Modals */}
      {modalState.type && modalState.type !== 'activities' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {modalState.type === 'delete' && 'Xóa người dùng'}
              {modalState.type === 'lock' && 'Khóa tài khoản'}
              {modalState.type === 'unlock' && 'Mở khóa tài khoản'}
              {modalState.type === 'role' && 'Thay đổi quyền'}
            </h3>

            {modalState.type === 'role' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quyền mới
                </label>
                <select
                  value={modalState.newRole}
                  onChange={(e) =>
                    setModalState({ ...modalState, newRole: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            )}

            {modalState.type === 'lock' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số ngày khóa
                </label>
                <input
                  type="number"
                  value={modalState.duration}
                  onChange={(e) =>
                    setModalState({
                      ...modalState,
                      duration: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do <span className="text-red-500">*</span>
              </label>
              <textarea
                value={modalState.reason}
                onChange={(e) =>
                  setModalState({ ...modalState, reason: e.target.value })
                }
                placeholder="Nhập lý do..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (modalState.type === 'delete') handleDeleteUser();
                  else if (modalState.type === 'lock') handleLockUser();
                  else if (modalState.type === 'unlock') handleUnlockUser();
                  else if (modalState.type === 'role') handleChangeRole();
                }}
                className={`px-4 py-2 rounded-lg text-white ${
                  modalState.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : modalState.type === 'lock'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activities Modal */}
      {modalState.type === 'activities' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Hoạt động của {modalState.user?.full_name}
            </h3>

            {activityStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(activityStats.actionCounts || {}).map(
                  ([action, count]) => (
                    <div key={action} className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">{action}</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {count}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            <div className="space-y-2">
              {Array.isArray(activities) && activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-gray-900">
                          {activity.action}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.details}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Không có hoạt động nào được tìm thấy
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
