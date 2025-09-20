"use client";

import { useState, useEffect, useCallback } from "react";
import { Eye, Trash2, X, Star } from "lucide-react";
import Pagination from "../../components/Pagination";
import Swal from 'sweetalert2';

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Applied filters state
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedRatingFilter, setAppliedRatingFilter] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const itemsPerPage = 15;

  // Reset to first page when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchTerm, appliedRatingFilter, appliedStartDate, appliedEndDate]);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (appliedSearchTerm) {
        params.append("search", appliedSearchTerm);
      }
      if (appliedRatingFilter) {
        params.append("rating", appliedRatingFilter);
      }
      if (appliedStartDate) {
        params.append("start_date", appliedStartDate);
      }
      if (appliedEndDate) {
        params.append("end_date", appliedEndDate);
      }

      const response = await fetch(`/api/internal/feedback?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedbacks');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setFeedbacks(data.data || []);
        setTotalItems(data.meta?.totalItems || 0);
        setTotalPages(data.meta?.totalPages || 1);
      } else {
        setFeedbacks([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch feedbacks",
      });
      setFeedbacks([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, appliedSearchTerm, appliedRatingFilter, appliedStartDate, appliedEndDate, itemsPerPage]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedRatingFilter(ratingFilter);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRatingFilter("");
    setStartDate("");
    setEndDate("");
    setAppliedSearchTerm("");
    setAppliedRatingFilter("");
    setAppliedStartDate("");
    setAppliedEndDate("");
  };

  const hasActiveFilters = appliedSearchTerm || appliedRatingFilter || appliedStartDate || appliedEndDate;



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

  const renderStars = (rating) => {
    const numericRating = parseFloat(rating);
    if (isNaN(numericRating)) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < numericRating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({numericRating})</span>
      </div>
    );
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + feedbacks.length;

  // Rating options for filter
  const ratingOptions = ["1", "2", "3", "4", "5"];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Customer Feedback</h1>
          <p className="text-gray-600 mt-2">Manage customer feedback and ratings</p>
        </div>
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
              {[appliedSearchTerm, appliedRatingFilter, appliedStartDate, appliedEndDate].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Section */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Feedback</label>
              <input
                type="text"
                placeholder="Search by name, or comments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              >
                <option value="">All Ratings</option>
                {ratingOptions.map(rating => (
                  <option key={rating} value={rating}>
                    {rating} Star{rating !== '1' ? 's' : ''}
                  </option>
                ))}
              </select>
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
                {appliedRatingFilter && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Rating: {appliedRatingFilter} stars</span>}
                {appliedStartDate && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">Start: {appliedStartDate}</span>}
                {appliedEndDate && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">End: {appliedEndDate}</span>}
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
            Loading feedbacks...
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {hasActiveFilters ? 'No feedbacks found matching your filters.' : 'No feedbacks available.'}
            </div>
            <p className="text-gray-400 mt-2">
              {hasActiveFilters ? 'Try adjusting your search criteria or clear filters' : 'No customer feedback yet'}
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
          <table className="w-full min-w-[1000px]">
            <thead className="sticky top-0 bg-gradient-to-r from-blue-50 to-cyan-50 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rating</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Avg Rating</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created At</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {feedbacks.map((feedback) => (
                <tr key={feedback.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{feedback.full_name}</td>
                  <td className="px-6 py-4 text-gray-600">{feedback.contact_number}</td>
                  <td className="px-6 py-4">
                    {renderStars(feedback.rating)}
                  </td>
                  <td className="px-6 py-4">
                    {feedback.average_rating ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-900">
                          {parseFloat(feedback.average_rating).toFixed(1)}
                        </span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(feedback.created_at)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setShowDetailModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
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

      {/* Feedback Detail Modal */}
      {showDetailModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Feedback Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900">{selectedFeedback.full_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
                  <p className="text-gray-900">{selectedFeedback.contact_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Rating</label>
                  <div className="flex items-center gap-2">
                    {renderStars(selectedFeedback.rating)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Average Rating</label>
                  <p className="text-gray-900">
                    {selectedFeedback.average_rating ? parseFloat(selectedFeedback.average_rating).toFixed(1) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Behaviour Satisfaction</label>
                  <p className="text-gray-900">{selectedFeedback.behaviour_satis_level}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Timely Response</label>
                  <p className="text-gray-900">{selectedFeedback.timely_response}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Call Response</label>
                  <p className="text-gray-900">{selectedFeedback.call_response}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Knowledge</label>
                  <p className="text-gray-900">{selectedFeedback.knowledge}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Likelihood to Recommend</label>
                  <p className="text-gray-900">{selectedFeedback.likelihood}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Customer Experience</label>
                  <p className="text-gray-900">{selectedFeedback.customer_experience}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Created At</label>
                  <p className="text-gray-900">{formatDate(selectedFeedback.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Updated At</label>
                  <p className="text-gray-900">{formatDate(selectedFeedback.updated_at)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FeedbackList;