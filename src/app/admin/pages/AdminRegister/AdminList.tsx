"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import Pagination from "../../components/Pagination";
import AdvancedFilter from "../../components/AdvancedFilter";
import Swal from "sweetalert2";

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Applied filters state
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedFilterType, setAppliedFilterType] = useState("");
  const [appliedFilterStatus, setAppliedFilterStatus] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Reset to first page when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchTerm, appliedFilterType, appliedFilterStatus]);

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (appliedSearchTerm) {
        params.append("search", appliedSearchTerm);
      }
      if (appliedFilterType) {
        params.append("type", appliedFilterType);
      }
      if (appliedFilterStatus) {
        params.append("status", appliedFilterStatus);
      }

      const response = await fetch(`/api/internal/admin-register?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const adminData = (data.users || []).map(admin => ({
          ...admin,
          permissions: []
        }));
        
        setAdmins(adminData);
        setTotalItems(data.meta?.totalItems || 0);
        setTotalPages(data.meta?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch admin users",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, appliedSearchTerm, appliedFilterType, appliedFilterStatus, itemsPerPage]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedFilterType(filterType);
    setAppliedFilterStatus(filterStatus);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("");
    setFilterStatus("");
    setAppliedSearchTerm("");
    setAppliedFilterType("");
    setAppliedFilterStatus("");
  };

  const hasActiveFilters = appliedSearchTerm || appliedFilterType || appliedFilterStatus;

  const handleEditClick = (admin) => {
    setEditingAdmin(admin);
    setEditForm({
      firstName: admin.first_name || "",
      lastName: admin.last_name || "",
      email: admin.email || "",
      newPassword: "",
      confirmNewPassword: ""
    });
    setShowEditModal(true);
  };

  const toggleUserStatus = async (admin) => {
    const newStatus = !admin.is_active;
    const action = newStatus ? 'activate' : 'deactivate';
    
    try {
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${action} ${admin.first_name} ${admin.last_name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0B6D76',
        cancelButtonColor: '#d33',
        confirmButtonText: `Yes, ${action} it!`,
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        const response = await fetch(`/api/internal/admin-register/${admin.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: newStatus }),
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          await fetchAdmins(); // Refresh the list
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `Admin ${action}d successfully.`,
            confirmButtonColor: '#0B6D76',
          });
        } else {
          throw new Error(data.message || `Failed to ${action} admin`);
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing admin:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || `Failed to ${action} admin`,
        confirmButtonColor: '#0B6D76',
      });
    }
  };

  type AdminUpdatePayload = {
  first_name: string;
  last_name: string;
  email: string;
  new_password?: string;
};

  const handleEditSubmit = async (e) => {
      e.preventDefault();

  const updateData: AdminUpdatePayload = {
    first_name: editForm.firstName.trim(),
    last_name: editForm.lastName.trim(),
    email: editForm.email.trim(),
  };
    
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill in all required fields.',
        confirmButtonColor: '#0B6D76'
      });
      return;
    }
    
    if (editForm.newPassword.trim()) {
      if (editForm.newPassword !== editForm.confirmNewPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'New password and confirm password do not match.',
          confirmButtonColor: '#0B6D76'
        });
        return;
      }
      
      if (editForm.newPassword.length < 6) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'New password must be at least 6 characters long.',
          confirmButtonColor: '#0B6D76'
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
        const updateData: AdminUpdatePayload = {
    first_name: editForm.firstName.trim(),
    last_name: editForm.lastName.trim(),
    email: editForm.email.trim(),
  };

      if (editForm.newPassword.trim()) {
        updateData.new_password = editForm.newPassword;
      }

      const response = await fetch(`/api/internal/admin-register/${editingAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        await fetchAdmins(); // Refresh the list
        setShowEditModal(false);
        setEditingAdmin(null);
        setEditForm({
          firstName: "",
          lastName: "",
          email: "",
          newPassword: "",
          confirmNewPassword: ""
        });
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Admin Updated Successfully.',
          confirmButtonColor: '#0B6D76'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || "Update failed",
          confirmButtonColor: '#0B6D76'
        });
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Network error. Please try again.',
        confirmButtonColor: '#0B6D76'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0B6D76',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const response = await fetch(`/api/internal/admin-register/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          await fetchAdmins(); // Refresh the list
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Admin Deleted Successfully',
            confirmButtonColor: '#0B6D76'
          });
        } else {
          throw new Error(data.message || 'Delete failed');
        }
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete admin',
        confirmButtonColor: '#0B6D76'
      });
    }
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + admins.length;

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full text-center">
          <p>Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Users</h1>
            <p className="text-gray-600">Manage administrator accounts and permissions</p>
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
                  {[appliedSearchTerm, appliedFilterType, appliedFilterStatus].filter(Boolean).length}
                </span>
              )}
            </button>
            <Link
              href="/admin/admin-register/create"
              className="bg-[#0B6D76] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-[#085a61] transition-colors"
            >
              <Plus className="w-5 h-5" /> <span>Add Admin</span>
            </Link>
          </div>
        </div>

        {/* Filter Section */}
        {isFilterOpen && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search admins by name, email, or user type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
              
              {hasActiveFilters && (
                <div className="text-sm text-gray-600 flex flex-wrap gap-2">
                  Active filters: 
                  {appliedSearchTerm && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Search: &quot;{appliedSearchTerm}&quot;</span>}
                  {appliedFilterType && <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Type: {appliedFilterType}</span>}
                  {appliedFilterStatus && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">Status: {appliedFilterStatus}</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6 overflow-x-auto">
          {admins.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {hasActiveFilters ? 'No admin users found matching your filters.' : 'No admin users found'}
              </div>
              <p className="text-gray-400 mt-2">
                {hasActiveFilters ? 'Try adjusting your search criteria or clear filters' : 'No admin accounts have been created yet'}
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
              <thead className="sticky top-0 bg-gradient-to-r from-green-50 to-emerald-50 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created At</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{admin.first_name} {admin.last_name}</td>
                    <td className="px-6 py-4 text-gray-600">{admin.email}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{admin.user_type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(admin)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(admin)}
                          className={`p-2 rounded-lg transition-colors ${
                            admin.is_active 
                              ? 'text-orange-600 hover:bg-orange-100' 
                              : 'text-green-600 hover:bg-green-100'
                          }`}
                          title={admin.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {admin.is_active ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
            <p>Showing {admins.length} of {totalItems} admins | Page {currentPage} of {totalPages}</p>
          </div>

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

        {/* Edit Admin Modal */}
        {showEditModal && editingAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Edit Admin: {editingAdmin.first_name} {editingAdmin.last_name}
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAdmin(null);
                    setEditForm({
                      firstName: "",
                      lastName: "",
                      email: "",
                      newPassword: "",
                      confirmNewPassword: ""
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={editForm.firstName}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={editForm.lastName}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Change Password (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={editForm.newPassword}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                          placeholder="Leave blank if not changing password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showNewPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmNewPassword"
                        value={editForm.confirmNewPassword}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#085a61] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminList;