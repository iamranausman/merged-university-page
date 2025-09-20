"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Eye, Trash2, X } from "lucide-react";
import Pagination from "../../components/Pagination";
import Swal from 'sweetalert2';

const WhatsAppEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Applied filter states
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    action_button: "",
    page_hit_name: "",
    whatsapp_button_text: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsPerPage = 15;

  // Reset to first page when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchTerm, appliedStartDate, appliedEndDate]);

  const fetchEvents = useCallback(async () => {
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
        params.append("startDate", appliedStartDate);
      }
      if (appliedEndDate) {
        params.append("endDate", appliedEndDate);
      }

      const response = await fetch(`/api/internal/web-events?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
        setTotalItems(data.meta?.totalCount || 0);
      } else {
        setEvents([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch events",
      });
      setEvents([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, appliedSearchTerm, appliedStartDate, appliedEndDate, itemsPerPage]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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


  const startView = (event) => {
    setViewingEvent(event);
    setFormData({
      type: event.type || "",
      action_button: event.action_button || "",
      page_hit_name: event.page_hit_name || "",
      whatsapp_button_text: event.whatsapp_button_text || "",
    });
  };


  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + events.length;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Button Events</h1>
          <p className="text-gray-600 mt-2">Manage web events and button interactions</p>
        </div>
        <div className="flex gap-3">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Events</label>
              <input
                type="text"
                placeholder="Search by type, action button, page name..."
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
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {hasActiveFilters ? 'No events found matching your filters.' : 'No events available.'}
            </div>
            <p className="text-gray-400 mt-2">
              {hasActiveFilters ? 'Try adjusting your search criteria or clear filters' : 'No events have been created yet'}
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
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 bg-gradient-to-r from-blue-50 to-cyan-50 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">Event Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action Button</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">WhatsApp Button Text</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created At</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{event.type}</td>
                  <td className="px-6 py-4 text-gray-600">{event.action_button}</td>
                  <td className="px-6 py-4 text-gray-600">{event.whatsapp_button_text}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {event.created_at ? new Date(event.created_at).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => startView(event)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View"
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

      {/* View Modal */}
      {(isModalOpen || viewingEvent) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                View Event
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setViewingEvent(null);
                  setFormData({ type: "", action_button: "", page_hit_name: "", whatsapp_button_text: "" });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type *</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                  placeholder="e.g., Page Visit, Button Click"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Action Button *</label>
                <input
                  type="text"
                  name="action_button"
                  value={formData.action_button}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                  placeholder="e.g., WhatsApp, Contact"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Page Hit Name</label>
                <input
                  type="text"
                  name="page_hit_name"
                  value={formData.page_hit_name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                  placeholder="e.g., Home Page, About Page"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Button Text</label>
                <input
                  type="text"
                  name="whatsapp_button_text"
                  value={formData.whatsapp_button_text}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                  placeholder="e.g., Chat on WhatsApp"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppEvents;