"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, X } from "lucide-react";
import Pagination from "../../components/Pagination";
import Swal from 'sweetalert2';

const SubscribersList = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Applied filters state
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 15;

  // Reset to first page when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchTerm, appliedStartDate, appliedEndDate]);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (appliedSearchTerm) {
        params.append("search", appliedSearchTerm);
      }
      if (appliedStartDate) {
        params.append("start_date", appliedStartDate);
      }
      if (appliedEndDate) {
        params.append("end_date", appliedEndDate);
      }

      const response = await fetch(`/api/internal/subscribers?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscribers');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSubscribers(data.data || []);
        setTotalItems(data.meta?.totalItems || 0);
        setTotalPages(data.meta?.totalPages || 1);
      } else {
        setSubscribers([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch subscribers",
      });
      setSubscribers([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, appliedSearchTerm, appliedStartDate, appliedEndDate, itemsPerPage]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setAppliedSearchTerm("");
    setAppliedStartDate("");
    setAppliedEndDate("");
  };

  const hasActiveFilters = appliedSearchTerm || appliedStartDate || appliedEndDate;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/internal/subscribers/${deleteId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Subscriber has been deleted successfully.',
          confirmButtonColor: '#0B6D76',
        });
        fetchSubscribers();
      } else {
        throw new Error(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Failed to delete subscriber',
        confirmButtonColor: '#0B6D76',
      });
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const exportSubscribers = async () => {
    try {
      const response = await fetch('/api/internal/subscribers/export');
      const data = await response.json();
      
      if (data.success && data.data) {
        // Create CSV content
        const csvContent = [
          ['ID', 'Email', 'Created At', 'Updated At'],
          ...data.data.map(sub => [
            sub.id,
            `"${sub.email}"`, // Wrap email in quotes to handle commas
            sub.created_at,
            sub.updated_at
          ])
        ].map(row => row.join(',')).join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        Swal.fire({
          icon: 'success',
          title: 'Exported!',
          text: 'Subscribers exported successfully.',
          confirmButtonColor: '#0B6D76',
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to export subscribers',
        confirmButtonColor: '#0B6D76',
      });
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + subscribers.length;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Email Subscribers</h1>
          <p className="text-gray-600 mt-2">Manage your newsletter subscribers</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              isFilterOpen 
                ? 'bg-[#0B6D76] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔍 Filters
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-1 bg-white text-[#0B6D76] text-xs rounded-full">
                {[appliedSearchTerm, appliedStartDate, appliedEndDate].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Section */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Subscribers</label>
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full bg-[#0B6D76] text-white px-4 py-2 rounded-lg hover:bg-[#085a61] transition-colors flex items-center gap-2"
              >
                🔍 Search
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#085a61] transition-colors"
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
                {appliedStartDate && <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Start: {appliedStartDate}</span>}
                {appliedEndDate && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">End: {appliedEndDate}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl p-6 overflow-x-auto">
        {loading ? (
          <div className="text-center text-gray-500 text-lg py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B6D76] mx-auto mb-4"></div>
            Loading subscribers...
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {hasActiveFilters ? 'No subscribers found matching your filters.' : 'No subscribers available.'}
            </div>
            <p className="text-gray-400 mt-2">
              {hasActiveFilters ? 'Try adjusting your search criteria or clear filters' : 'No email subscribers yet'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#085a61] transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <table className="w-full min-w-[600px]">
            <thead className="sticky top-0 bg-gradient-to-r from-blue-50 to-cyan-50 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created At</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Updated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-600">#{subscriber.id}</td>
                  <td className="px-6 py-4 text-gray-900">{subscriber.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(subscriber.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(subscriber.updated_at)}
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

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this subscriber? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscribersList;