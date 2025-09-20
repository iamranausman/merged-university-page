'use client';

import React, { useEffect, useState } from 'react';
import Heading from '../../atoms/Heading';
import Button from '../../atoms/Button';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { getCountries, getCities, getStats } from '../../../utils/countryStateCityAPI';
import CountrySelect from '../../atoms/CountrySelect';
import { FaGlobe } from 'react-icons/fa';
import { useUserStore } from '../../../../store/useUserStore';

const ConsultantProfile = () => {
  const { user } = useUserStore();
  const router = useRouter();
  
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    nationality: '',
    gender: '',
    program_type: '',
    city: '',
    state: '',
  });

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Derived numeric IDs for fetching
    const countryId = form.nationality ? Number(form.nationality) : undefined;
    const stateId = form.state ? Number(form.state) : undefined;
  
    function toOptions(rows){
  
      if (!Array.isArray(rows)) return [];
      return rows.map(r => ({ label: r.name, value: String(r.id) }));
    }
  
        // Helper to read value for both native events and custom values
    function readSelectValue(eOrValue) {
      // If your <Select> forwards native event:
      if (eOrValue?.target?.value !== undefined) return eOrValue.target.value;
      // If it sends the value directly:
      return String(eOrValue ?? '');
    }
  
        // Specific handlers for dependent selects
    const handleCountryChange = (eOrValue) => {
      const value = readSelectValue(eOrValue); // string id or ''
      setForm(prev => ({
        ...prev,
        nationality: value,
        state: '', // reset child
        city: ''   // reset grandchild
      }));
    };
  
    const handleStateChange = (eOrValue) => {
      const value = readSelectValue(eOrValue);
      setForm(prev => ({
        ...prev,
        state: value,
        city: '' // reset child
      }));
    };
  
    const handleCityChange = (eOrValue) => {
      const value = readSelectValue(eOrValue);
      setForm(prev => ({ ...prev, city: value }));
    };
      
    // --- Countries ---
    useEffect(() => {
      const controller = new AbortController();
  
      const fetchCountries = async () => {
        try {
          const res = await getCountries();
  
          setCountries(res || []);
        } catch (err) {
          if (err.name === 'AbortError') return; // fetch aborted
          console.error('Error fetching countries:', err);
          setCountries([]);
        }
      };
  
      fetchCountries();
  
      return () => controller.abort(); // cleanup
    }, []);
  
    // --- States (dependent on country) ---
    useEffect(() => {
      if (!countryId) {
        setStates([]);
        setCities([]);
        return;
      }
  
      const controller = new AbortController();
  
      const fetchStates = async () => {
        try {
          setStates([]); // reset states on country change
          setCities([]); // reset cities on country change
  
          const res = await getStats(countryId)
  
          setStates(res || []);
        } catch (err) {
          if (err.name === 'AbortError') return; // fetch aborted
          console.error('Error fetching states:', err);
          setStates([]);
        }
      };
  
      fetchStates();
  
      return () => controller.abort();
    }, [countryId]);
  
    // --- Cities (dependent on state) ---
    useEffect(() => {
      if (!stateId) {
        setCities([]);
        return;
      }
  
      const controller = new AbortController();
  
      const fetchCities = async () => {
        try {
          setCities([]); // reset cities on state change
  
          const res = await getCities(stateId);
  
          console.log(res)
  
          setCities(res || []);
        } catch (err) {
          if (err.name === 'AbortError') return; // fetch aborted
          console.error('Error fetching cities:', err);
          setCities([]);
        }
      };
  
      fetchCities();
  
      return () => controller.abort();
    }, [stateId]);


  // Fetch student data when component mounts
  useEffect(() => {
    const fetchStudentData = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/frontend/consultant/consultantdashboard/profile/`, {
            method: "POST"
          });
          
          if(!response.ok)
          {
            const data = await response.json();
            Swal.fire({ icon: 'error', title: 'Error', text: data.message });
          }

          const data = await response.json();

          // Get values from API response or fallback to session data
          const studentData = {
            first_name: data.data?.first_name || '',
            last_name: data.data?.last_name || '',
            email: data.data?.email || '',
            phone: data.data?.phone || '',
            nationality: data.data?.nationality || '',
            gender: data.data?.gender || '',
            program_type: data.data?.prefered_program || '',
            city: data.data?.city || '',
            state: data.data?.state || '',
          };

          setForm(studentData);
        } catch (error) {
          console.error('Error fetching student data:', error);
        } finally {
          setIsLoading(false);
        }
    };

    fetchStudentData();
  }, [user?.id,]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset city when country changes
    if (name === 'nationality') {
      setForm(prev => ({ ...prev, [name]: value, city: '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/frontend/consultant/consultantdashboard/profile/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          // Ensure we don't send empty strings for optional fields
          phone: form.phone || null,
          nationality: form.nationality || null,
          city: form.city || null,
          gender: form.gender || null,
          program_type: form.program_type || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the session with new user data
        await update({
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          nationality: form.nationality,
          gender: form.gender,
          program_type: form.program_type,
          city: form.city,
        });
        
        await Swal.fire({ 
          icon: 'success', 
          title: 'Success', 
          text: 'Profile updated successfully!',
          timer: 2000,
          showConfirmButton: false
        });
        router.refresh();
      } else {
        const errorMessages = data.message || {};

        if (typeof errorMessages === 'object') {
          // Now display these erros is Swal\
          const errorMessagesString = Object.values(errorMessages).join('\n');
          Swal.fire({
            icon: 'error',
            title: 'Something went wrong, please try again later',
            text: errorMessagesString,
            confirmButtonColor: '#0B6D76'
          });
        } else {
          throw new Error(errorMessages);
        }
      }
    } catch (err) {
      console.error('Profile update error:', err);
      await Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: 'Network error',
        timer: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B6D76] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Build options for your Select component
  const countryOptions = toOptions(countries);
  const stateOptions   = toOptions(states);
  const cityOptions    = toOptions(cities);

  return (
    <div className="min-h-screen flex justify-center py-8">
      <div className="w-full max-w-4xl px-4">
        <div className="text-center mb-8">
          <Heading level={4}>Edit Profile</Heading>
          <p className="text-gray-600 mt-2">Update your personal information</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow-md">
          {/* First Name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              placeholder="First Name"
              required
            />
          </div>

          {/* Last Name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              placeholder="Last Name"
              required
            />
          </div>

          {/* Email (Disabled) */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              value={form.email}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
              placeholder="Email Address"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              name="phone"
              value={form.phone || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
              placeholder="Phone"
            />
          </div>

          {/* Country / State / City */}
          <CountrySelect
            name="country"
            icon={<FaGlobe />}
            placeholder="Select Country"
            value={form.nationality}           // string id
            onChange={handleCountryChange}      // resets state/city and loads states
            options={countryOptions}            // [{label, value}]
          />
          <CountrySelect
            name="state"
            icon={<FaGlobe />}
            placeholder={form.nationality ? "Select State" : "Select Country first"}
            value={form.state}              // string id
            onChange={handleStateChange}        // resets city and loads cities
            options={stateOptions}
          />
          <CountrySelect
            name="city"
            icon={<FaGlobe />}
            placeholder={form.state ? "Select City" : "Select State first"}
            value={form.city}               // string id
            onChange={handleCityChange}
            options={cityOptions}
          />

          {/* Program Type */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Program Type</label>
            <select
              name="program_type"
              value={form.program_type || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
            >
              <option value="">Select Program Type</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Graduate">Graduate</option>
              <option value="PhD">PhD</option>
              <option value="Diploma">Diploma</option>
              <option value="Certificate">Certificate</option>
            </select>
          </div>

          {/* Gender */}
          <div className="md:col-span-2 space-y-1">
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={form.gender === 'Male'}
                  onChange={handleChange}
                  className="text-[#0B6D76] focus:ring-[#0B6D76]"
                />
                <span>Male</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={form.gender === 'Female'}
                  onChange={handleChange}
                  className="text-[#0B6D76] focus:ring-[#0B6D76]"
                />
                <span>Female</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="Other"
                  checked={form.gender === 'Other'}
                  onChange={handleChange}
                  className="text-[#0B6D76] focus:ring-[#0B6D76]"
                />
                <span>Other</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 pt-4">
            <Button 
              type="submit" 
              className="w-full py-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : 'Update Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultantProfile;