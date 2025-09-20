"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trash2 } from "lucide-react";
import Pagination from '../../components/Pagination';
import Swal from 'sweetalert2';

const ApplyNowList = () => {
  const [list, setList] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [educationFilter, setEducationFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Applied filters state
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [appliedEducationFilter, setAppliedEducationFilter] = useState('');
  const [appliedCountryFilter, setAppliedCountryFilter] = useState('');

  // Reset to first page when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchTerm, appliedStartDate, appliedEndDate, appliedEducationFilter, appliedCountryFilter]);

  const fetchList = useCallback(async () => {
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
      if (appliedEducationFilter) {
        params.append("education", appliedEducationFilter);
      }
      if (appliedCountryFilter) {
        params.append("country", appliedCountryFilter);
      }

      const response = await fetch(`/api/internal/visit-visa-apply?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch apply now entries');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setList(data.data || []);
        setTotalItems(data.meta?.totalItems || 0);
        setTotalPages(data.meta?.totalPages || 1);
      } else {
        setList([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching applynow:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch entries",
      });
      setList([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, appliedSearchTerm, appliedStartDate, appliedEndDate, appliedEducationFilter, appliedCountryFilter, itemsPerPage]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedEducationFilter(educationFilter);
    setAppliedCountryFilter(countryFilter);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setEducationFilter('');
    setCountryFilter('');
    setAppliedSearchTerm('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setAppliedEducationFilter('');
    setAppliedCountryFilter('');
  };

  const hasActiveFilters = appliedSearchTerm || appliedStartDate || appliedEndDate || appliedEducationFilter || appliedCountryFilter;

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/internal/applynow/${deleteId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Entry has been deleted successfully.',
          confirmButtonColor: '#0B6D76',
        });
        fetchList();
      } else {
        throw new Error(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to delete entry',
        confirmButtonColor: '#0B6D76',
      });
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + list.length;

  // Education options for filter dropdown
  const educationOptions = [
    "High School", "Diploma", "Bachelor", "Master", "PhD", "Other"
  ];

  // Common countries for filter dropdown
  const commonCountries = [
    "Australia", "Canada", "USA", "UK", "Germany", "France", "Netherlands", 
    "Japan", "South Korea", "Singapore", "Malaysia", "New Zealand", "Ireland"
  ];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Visit Visa Apply List</h1>
          <p className="text-gray-600 mt-2">Manage all application submissions</p>
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
              {[appliedSearchTerm, appliedStartDate, appliedEndDate, appliedEducationFilter, appliedCountryFilter].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Section */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Applications</label>
              <input
                type="text"
                placeholder="Search by name, city, phone, education, or country..."
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
                {appliedStartDate && <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Start: {appliedStartDate}</span>}
                {appliedEndDate && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">End: {appliedEndDate}</span>}
                {appliedEducationFilter && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">Education: {appliedEducationFilter}</span>}
                {appliedCountryFilter && <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded">Country: {appliedCountryFilter}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl p-6 overflow-x-auto">
<table className="w-full min-w-[1000px]">
  <thead className="sticky top-0 bg-gradient-to-r from-blue-50 to-cyan-50 z-10">
    <tr>
      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">Name</th>
      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Gender</th>
      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Passport #</th>
      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Taxpayer Type</th>
      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200">
    {loading ? (
      <tr>
        <td colSpan={7} className="px-6 py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B6D76] mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading entries...</p>
        </td>
      </tr>
    ) : list.length === 0 ? (
      <tr>
        <td colSpan={7} className="px-6 py-12 text-center">
          <div className="text-gray-500 text-lg">
            {hasActiveFilters ? 'No entries found matching your filters.' : 'No entries available.'}
          </div>
          <p className="text-gray-400 mt-2">
            {hasActiveFilters ? 'Try adjusting your search criteria or clear filters' : 'No application submissions yet'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#085a61] transition-colors"
            >
              Clear all filters
            </button>
          )}
        </td>
      </tr>
    ) : (
      list.map((c: any) => (
        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
          <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
          <td className="px-6 py-4 text-gray-600">{c.email}</td>
          <td className="px-6 py-4 text-gray-600">{c.phone}</td>
          <td className="px-6 py-4 text-gray-600">{c.gender || '-'}</td>
          <td className="px-6 py-4 text-gray-600">{c.passport_number || '-'}</td>
          <td className="px-6 py-4 text-gray-600">{c.taxpayer_type || '-'}</td>
          <td className="px-6 py-4 text-sm text-gray-500">
            {c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>


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
            <p className="text-gray-600 mb-6">Are you sure you want to delete this application entry?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyNowList;