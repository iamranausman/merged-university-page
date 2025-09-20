'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../../../../admin/components/Layout';
import { Plus } from 'lucide-react';

const AddVisaRequirement = () => {
  const router = useRouter();
  const params = useParams();
  const countryId = params.countryId;

  const id = params.countryId;

  const [visaTypes, setVisaTypes] = useState([]);
  const [form, setForm] = useState({
    visa_country_id: countryId,
    visa_type_id: '',
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {  
    const fetchData = async () => {
      try{
        const [typesResponse] = await Promise.all([
          fetch(`/api/internal/visa-types?country_id=${id}`)
        ]);

        if(!typesResponse.ok) throw new Error('Failed to fetch data')

        const typesData = await typesResponse.json();

        if(typesData.success){
          setVisaTypes(typesData.data || []);
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
    }
  

  fetchData();

  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'visa_type_id') {
      const selectedVisaType = visaTypes.find(v => v.id === parseInt(value));
      setForm({
        ...form,
        visa_type_id: value,
        visa_type_name: selectedVisaType?.name || ''
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.visa_type_id) {
      setError('Please select a visa type');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/internal/visa-requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          visa_country_id: parseInt(form.visa_country_id),
          visa_type_id: parseInt(form.visa_type_id)
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save visa requirement');
      }

      alert('Visa Requirement Saved Successfully!');
      router.push(`/admin/visit-visa/details/${countryId}`);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to save visa requirement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 text-center">Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 text-center text-red-600">
          Error: {error}
          <button 
            onClick={() => window.location.reload()}
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Add Visa Requirement for {visaTypes[0]?.country_name}
        </h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* Visa Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visa Type*
            </label>
            <select
              name="visa_type_id"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.visa_type_id}
              onChange={handleChange}
              required
              disabled={visaTypes.length === 0}
            >
              <option value="">{visaTypes.length === 0 ? 'No visa types available' : 'Select Visa Type'}</option>
              {visaTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {visaTypes.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                No visa types found for this country. Please add visa types first.
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              name="title"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              name="description"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.description}
              onChange={handleChange}
              required
              rows={6}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push(`/admin/visit-visa/details/${id}`)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || visaTypes.length === 0}
              className={`bg-[#0B6D76] hover:bg-[#09545c] text-white px-6 py-2 rounded-md shadow-sm transition-colors flex items-center gap-2 ${
                visaTypes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Plus size={18} />
              {isSubmitting ? 'Saving...' : 'Save Requirement'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddVisaRequirement;