"use client";

import { useState, useEffect, useCallback } from "react";
import { Eye, Trash2, Check, X } from "lucide-react";
import Pagination from '../../components/Pagination';
import Swal from 'sweetalert2';

const ConsultantList = () => {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Applied filters state
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Reset to first page when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchTerm, appliedStatusFilter, appliedStartDate, appliedEndDate]);

  const fetchConsultants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (appliedSearchTerm) {
        params.append("search", appliedSearchTerm);
      }
      if (appliedStatusFilter) {
        params.append("status", appliedStatusFilter);
      }
      if (appliedStartDate) {
        params.append("start_date", appliedStartDate);
      }
      if (appliedEndDate) {
        params.append("end_date", appliedEndDate);
      }

      const response = await fetch(`/api/internal/consultants?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch consultants');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setConsultants(data.users || []);
        setTotalItems(data.meta?.totalItems || 0);
        setTotalPages(data.meta?.totalPages || 1);
      } else {
        setConsultants([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch consultants",
      });
      setConsultants([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, appliedSearchTerm, appliedStatusFilter, appliedStartDate, appliedEndDate, itemsPerPage]);

  useEffect(() => {
    fetchConsultants();
  }, [fetchConsultants]);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStatusFilter(statusFilter);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setAppliedSearchTerm("");
    setAppliedStatusFilter("");
    setAppliedStartDate("");
    setAppliedEndDate("");
  };

  const hasActiveFilters = appliedSearchTerm || appliedStatusFilter || appliedStartDate || appliedEndDate;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const toggleConsultantStatus = async (id) => {
    try {
      const currentConsultant = consultants.find(s => s.id === id);
      const newStatus = !currentConsultant.is_active;
      
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${newStatus ? 'activate' : 'deactivate'} this consultant?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0B6D76',
        cancelButtonColor: '#d33',
        confirmButtonText: `Yes, ${newStatus ? 'activate' : 'deactivate'} it!`,
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        const response = await fetch(`/api/internal/consultants`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, is_active: newStatus }),
        });
        
        if (!response.ok) throw new Error("Failed to update status");
        
        await fetchConsultants();
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Consultant ${newStatus ? 'activated' : 'deactivated'} successfully.`,
          confirmButtonColor: '#0B6D76',
        });
      }
    } catch (error) {
      console.error("Status update error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to update consultant status.',
        confirmButtonColor: '#0B6D76',
      });
    }
  };

  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + consultants.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B6D76]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Consultant Management</h1>
          <p className="text-gray-600 mt-2">Manage all consultant records</p>
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
              {[appliedSearchTerm, appliedStatusFilter, appliedStartDate, appliedEndDate].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Section */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Consultants</label>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#085a61] transition-colors flex items-center gap-2"
              >
                🔍 Search
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
                {appliedStatusFilter && <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Status: {appliedStatusFilter === 'active' ? 'Active' : 'Inactive'}</span>}
                {appliedStartDate && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">Start: {formatDate(appliedStartDate)}</span>}
                {appliedEndDate && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">End: {formatDate(appliedEndDate)}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl p-6 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="sticky top-0 bg-gradient-to-r from-blue-50 to-cyan-50 z-10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created At</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 rounded-r-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {consultants.map((consultant) => (
              <tr key={consultant.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{consultant.first_name} {consultant.last_name}</td>
                <td className="px-6 py-4 text-gray-600">{consultant.email}</td>
                <td className="px-6 py-4 text-gray-600">{consultant.phone || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    consultant.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {consultant.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(consultant.created_at)}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedConsultant(consultant);
                        setShowModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleConsultantStatus(consultant.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        consultant.is_active
                          ? "text-red-600 hover:bg-red-100"
                          : "text-green-600 hover:bg-green-100"
                      }`}
                      title={consultant.is_active ? "Deactivate" : "Activate"}
                    >
                      {consultant.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {consultants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {hasActiveFilters ? 'No consultants found matching your filters.' : 'No consultants available.'}
            </div>
            <p className="text-gray-400 mt-2">
              {hasActiveFilters ? 'Try adjusting your search criteria or clear filters' : 'No consultant records have been created yet'}
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

      {/* Consultant Details Modal */}
      {showModal && selectedConsultant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Consultant Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{selectedConsultant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{selectedConsultant.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Phone:</span>
                <span>{selectedConsultant.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedConsultant.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {selectedConsultant.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">User Type:</span>
                <span>{selectedConsultant.userType || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Created:</span>
                <span>{formatDate(selectedConsultant.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantList;