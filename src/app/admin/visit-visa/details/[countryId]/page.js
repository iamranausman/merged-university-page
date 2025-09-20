'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';
import { Delete, Pencil, Plus } from 'lucide-react';
import Pagination from '../../../components/Pagination';
import Swal from 'sweetalert2';

const VisaCountryDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const id = params.countryId;
  
  // State management
  const [visaTypes, setVisaTypes] = useState([]);
  const [visaRequirements, setVisaRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  
  // Pagination states for each table
  const [typesPage, setTypesPage] = useState(1);
  const [requirementsPage, setRequirementsPage] = useState(1);
  const itemsPerPage = 5;
  
  // Modal states
  const [showAddVisaTypeModal, setShowAddVisaTypeModal] = useState(false);
  
  // Form states
  const [newVisaType, setNewVisaType] = useState({
    name: ''
  });

  const fetchData = useCallback( async () => {
      try{
        const [typesResponse, reqResponse] = await Promise.all([
          fetch(`/api/internal/visa-types?country_id=${id}`),
          fetch(`/api/internal/visa-requirements?country_id=${id}`),
        ]);

        if(!typesResponse.ok || !reqResponse.ok) throw new Error('Failed to fetch data')

        const typesData = await typesResponse.json();
        const reqData = await reqResponse.json();

        console.log("TypesData", typesData)
        console.log("ReqData", reqData)

        if(typesData.success && reqData.success){
          setVisaTypes(typesData.data || []);
          setVisaRequirements(reqData.data || []);
        }else{
          throw new Error('Failed to fetch data')
        }
      } catch(error){

        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.message
        })
      }
    }, [id])

  useEffect(() => {
    
  fetchData();

  }, [fetchData])

  // Modal handlers
  const handleCloseModal = () => {
    setShowAddVisaTypeModal(false);
  };

  // Visa Type handlers
  const handleAddVisaType = () => {
    setShowAddVisaTypeModal(true);
  };

  const handleSaveVisaType = async () => {
    try {
      const response = await fetch('/api/internal/visa-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visa_country_id: id,
          ...newVisaType
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create visa type');

      handleCloseModal();
      setNewVisaType({ name: '' });

      fetchData()
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteVisaType = async (id) => {
    try {

      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {

        const response = await fetch(`/api/internal/visa-types/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete visa type');

        fetchData()
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Visa Requirement handlers
const handleDeleteRequirement = async (id) => {
  try {

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {

      const response = await fetch(`/api/internal/visa-requirements/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete visa requirement');

      fetchData();
    }
  } catch (err) {
    setError(err.message);
  }
};


  // Navigation handlers
  const handleAddVisaRequirement = () => {
    router.push(`/admin/visit-visa/details/${params.countryId}/add-requirement`);
  };


  // Pagination calculation functions
  const getPaginatedData = (data, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data) => Math.ceil(data.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B6D76]"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visa Country Details</h1>
            <p className="text-gray-600 mt-1">Manage visa types, requirements for selected country</p>
          </div>
          <div className="flex gap-3">
            <button
              className="bg-[#0B6D76] hover:bg-[#09545c] text-white px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
              onClick={handleAddVisaType}
            >
              <Plus size={18} />
              Add Visa Type
            </button>
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {/* Visa Types Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Visa Types ({visaTypes.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Country</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getPaginatedData(visaTypes, typesPage, itemsPerPage).map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{(typesPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-6 py-2 text-gray-700">{item?.country_name}</td>
                    <td className="px-6 py-2 text-gray-700">{item?.name}</td>
                    <td className="px-6 py-2 text-gray-700">{formatDate(item.created_at)}</td>
                    <td className="px-6 py-2 text-center">
                      <button 
                        onClick={() => handleDeleteVisaType(item.id)}
                        className="bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visaTypes.length === 0 && (
              <div className="text-center py-8 text-gray-500">No visa types found</div>
            )}
          </div>
          
          {/* Pagination for Visa Types */}
          {visaTypes.length > 0 && (
            <Pagination
              currentPage={typesPage}
              totalPages={getTotalPages(visaTypes)}
              onPageChange={setTypesPage}
              totalItems={visaTypes.length}
              startIndex={(typesPage - 1) * itemsPerPage}
              endIndex={typesPage * itemsPerPage}
            />
          )}
        </div>

        {/* Add Buttons */}
        <div className="flex justify-center gap-4">
          <button
            className="bg-[#0B6D76] text-white px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
            onClick={handleAddVisaRequirement}
          >
            <Plus size={18} />
            Add Visa Requirement
          </button>
        </div>

        {/* Visa Requirements Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Visa Requirements ({visaRequirements.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 rounded-l-xl">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Country</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Edit</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 rounded-r-xl">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getPaginatedData(visaRequirements, requirementsPage, itemsPerPage).map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{(requirementsPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-6 py-2 text-gray-700">{item.title}</td>
                    <td className="px-6 py-2 text-gray-700">{item.visa_country_name}</td>
                    <td className="px-6 py-2 text-gray-700">{item.visa_type_name}</td>
                    <td className="px-6 py-2 text-gray-700 max-w-xs truncate">{item.description}</td>
                    <td className="px-6 py-2 text-center">
                      <button
                        onClick={() => router.push(`/admin/visit-visa/details/${params.countryId}/edit-requirement/${item.id}`)}
                        className="hover:bg-yellow-100 px-3 py-1 rounded-lg transition-colors text-sm"
                      >
                        <Pencil size={18} />
                      </button>
                    </td>
                    <td className="px-6 py-2 text-center">
                      <button 
                        onClick={() => handleDeleteRequirement(item.id)}
                        className="text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors text-sm"
                      >
                        <Delete size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visaRequirements.length === 0 && (
              <div className="text-center py-8 text-gray-500">No visa requirements found</div>
            )}
          </div>
          
          {/* Pagination for Visa Requirements */}
          {visaRequirements.length > 0 && (
            <Pagination
              currentPage={requirementsPage}
              totalPages={getTotalPages(visaRequirements)}
              onPageChange={setRequirementsPage}
              totalItems={visaRequirements.length}
              startIndex={(requirementsPage - 1) * itemsPerPage}
              endIndex={requirementsPage * itemsPerPage}
            />
          )}
        </div>

        {/* Add Visa Type Modal */}
        {showAddVisaTypeModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={handleCloseModal}
              >
                &times;
              </button>
              <h2 className="text-xl font-semibold mb-4">Add Visa Type</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Visa Title</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={newVisaType.name}
                    onChange={(e) => setNewVisaType({...newVisaType, name: e.target.value})}
                  />
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleSaveVisaType}
                    className="bg-[#0B6D76] hover:bg-[#09545c] text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default VisaCountryDetailsPage;