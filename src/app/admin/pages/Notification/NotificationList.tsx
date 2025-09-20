'use client';
import React, { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import Pagination from '../../components/Pagination';
import Swal from 'sweetalert2';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage] = useState(15);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Applied filters state
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedFilterType, setAppliedFilterType] = useState('');
  const [appliedFilterStatus, setAppliedFilterStatus] = useState('');

  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);

// ✅ Move fetchNotifications to top-level with useCallback
const fetchNotifications = useCallback(async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: itemsPerPage.toString(),
    });

    if (appliedSearchTerm) params.append("search", appliedSearchTerm);
    if (appliedFilterType) params.append("type", appliedFilterType);
    if (appliedFilterStatus) params.append("status", appliedFilterStatus);

    const response = await fetch(`/api/internal/notifications?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch notifications");

    const data = await response.json();
    if (data.success) {
      setNotifications(data.data || []);
      setTotalItems(data.pagination?.totalItems || 0);
      setTotalPages(data.pagination?.totalPages || 0);
      setSelectedNotifications(new Set());
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch notifications",
    });
  } finally {
    setLoading(false);
  }
}, [currentPage, appliedSearchTerm, appliedFilterType, appliedFilterStatus, itemsPerPage]);

// ✅ Now markAllAsRead can use it
const markAllAsRead = useCallback(async () => {
  setMarkingAsRead(true);
  try {
    const response = await fetch("/api/internal/notifications", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log("All notifications marked as read");
      await fetchNotifications(); // ✅ works now
    } else {
      throw new Error("Failed to mark all as read");
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  } finally {
    setMarkingAsRead(false);
  }
}, [fetchNotifications]); // ✅ add as dependency

// Load on mount
useEffect(() => {
  markAllAsRead();
}, [markAllAsRead]);

// Refresh when filters/pagination change
useEffect(() => {
  fetchNotifications();
}, [fetchNotifications]);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedFilterType(filterType);
    setAppliedFilterStatus(filterStatus);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterStatus('');
    setAppliedSearchTerm('');
    setAppliedFilterType('');
    setAppliedFilterStatus('');
  };

  const hasActiveFilters = appliedSearchTerm || appliedFilterType || appliedFilterStatus;

  const handleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.id)));
    }
  };

  const handleSelectNotification = (id) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const handleBulkAction = async (action) => {
    if (selectedNotifications.size === 0) return;
    
    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/internal/notifications/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: Array.from(selectedNotifications),
          action: action
        }),
      });
      
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Notifications ${action === 'mark-read' ? 'marked as read' : 'marked as unread'} successfully`,
        });
        await fetchNotifications();
      } else {
        throw new Error('Bulk action failed');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to perform bulk action",
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + notifications.length;

  return (
    <Layout>
      <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">All Notifications</h1>
            <p className="text-gray-600 mt-2">Manage system notifications</p>
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              isFilterOpen 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔍 Filters
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-1 bg-white text-blue-600 text-xs rounded-full">
                {[appliedSearchTerm, appliedFilterType, appliedFilterStatus].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Section */}
        {isFilterOpen && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by name, email, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="account">Account</option>
                  <option value="application">Application</option>
                  <option value="payment">Payment</option>
                  <option value="system">System</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="0">Unread</option>
                  <option value="1">Read</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  🔍 Search
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              
              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="text-sm text-gray-600 flex flex-wrap gap-2">
                  Active filters: 
                  {appliedSearchTerm && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: &quot;{appliedSearchTerm}&quot;</span>}
                  {appliedFilterType && <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Type: {appliedFilterType}</span>}
                  {appliedFilterStatus && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">Status: {appliedFilterStatus === '1' ? 'Read' : 'Unread'}</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedNotifications.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                {selectedNotifications.size} notification{selectedNotifications.size !== 1 ? 's' : ''} selected
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('mark-read')}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {bulkActionLoading ? 'Processing...' : 'Mark as Read'}
                </button>
                <button
                  onClick={() => handleBulkAction('mark-unread')}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                >
                  {bulkActionLoading ? 'Processing...' : 'Mark as Unread'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6 overflow-x-auto">
          {loading ? (
            <div className="text-center text-gray-500 text-lg py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {hasActiveFilters ? 'No notifications found matching your filters.' : 'No notifications available.'}
              </div>
              <p className="text-gray-400 mt-2">
                {hasActiveFilters ? 'Try adjusting your search criteria or clear filters' : 'You\'re all caught up'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <table className="w-full min-w-[1000px]">
              <thead className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.size === notifications.length && notifications.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Message</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-r-xl">Date/Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(n.id)}
                        onChange={() => handleSelectNotification(n.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-500">#{n.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-[150px] truncate" title={n.name}>
                      {n.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate" title={n.email}>
                      {n.email || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        n.type === 'account' ? 'bg-blue-100 text-blue-800' :
                        n.type === 'application' ? 'bg-green-100 text-green-800' :
                        n.type === 'payment' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {n.type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[250px]">
                      <div className="truncate" title={n.meta || n.message || '-'}>
                        {typeof n.meta === 'object' && n.meta !== null ? n.meta.message : n.meta || n.message || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        n.is_read ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {n.is_read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDateTime(n.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              startIndex={startIndex + 1}
              endIndex={endIndex}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

function formatDateTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default NotificationList;