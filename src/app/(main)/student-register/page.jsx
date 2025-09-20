'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Heading from '../../components/atoms/Heading';
import Input from '../../components/atoms/Input';
import Button from '../../components/atoms/Button';
import { getCountries, getCities, getStats } from '../../utils/countryStateCityAPI';
import Swal from 'sweetalert2';
import CountrySelect from '../../components/atoms/CountrySelect';
import { FaGlobe } from 'react-icons/fa';

export default function StudentForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: '',
    nationality: '',
    state: '',
    city: '',
    program_type: '',
    gender: '',
    agree: false,
  });

  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]); 
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


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
  

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/frontend/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          user_type: 'student',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '✅ Account created successfully!',
          text: 'Registration successful! Please login.',
          confirmButtonColor: '#0B6D76',
          timer: 2000,
          showConfirmButton: false
        });
        
        setTimeout(() => {
          router.push('/student-login');
        }, 2000);
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
      console.error('Signup error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Something went wrong, please try again later',
        text: err.message,
        confirmButtonColor: '#0B6D76'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build options for your Select component
  const countryOptions = toOptions(countries);
  const stateOptions   = toOptions(states);
  const cityOptions    = toOptions(cities);

  const formatLabel = (label) => label.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="min-h-screen bg-white py-12 px-4 flex items-center justify-center">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <Heading level={3} className="text-center lg:text-left">
            Registration <span className="text-teal-600">As Student</span>
          </Heading>

          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(form).map(([field, value]) => {
              if (['agree', 'gender', 'nationality', 'country', 'city', 'state', 'program_type'].includes(field)) return null;
              const isPassword = field === 'password' || field === 'confirm_password';
              return (
                <div key={field} className="relative">
                  <Input
                    id={field}
                    type={isPassword
                      ? field === 'password'
                        ? showPassword ? 'text' : 'password'
                        : showConfirmPassword ? 'text' : 'password'
                      : 'text'}
                    name={field}
                    value={value}
                    onChange={handleChange}
                    placeholder={formatLabel(field)}
                  />
                  {isPassword && (
                    <button
                      type="button"
                      onClick={field === 'password' ? togglePasswordVisibility : toggleConfirmPasswordVisibility}
                      className="absolute right-3 top-3 text-gray-500"
                    >
                      {field === 'password' 
                        ? (showPassword ? '🙈' : '👁️')
                        : (showConfirmPassword ? '🙈' : '👁️')}
                    </button>
                  )}
                  {errors[field] && <p className="text-sm text-red-500">{errors[field]}</p>}
                </div>
              );
            })}

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

            {/* Program Type Dropdown */}
            <div>
              <select
                name="program_type"
                value={form.program_type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none"
              >
                <option value="">Select Program Type</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Graduate">Graduate</option>
                <option value="PhD">PhD</option>
                <option value="Diploma">Diploma</option>
                <option value="Certificate">Certificate</option>
              </select>
              {errors.program_type && <p className="text-sm text-red-500">{errors.program_type}</p>}
            </div>

            {/* Gender Radio Buttons */}
            <div className="md:col-span-2 flex items-center space-x-6">
              {["Male", "Female", "Other"].map((g) => (
                <label key={g} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={handleChange}
                    className="accent-teal-600"
                  />
                  <span>{g.charAt(0) + g.slice(1).toLowerCase()}</span>
                </label>
              ))}
              {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
            </div>

            {/* Terms and Conditions */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={handleChange}
                  className="accent-teal-600"
                />
                <span>
                  I agree to the <span className="text-teal-600 underline">Terms and Conditions</span>
                </span>
              </label>
              {errors.agree && <p className="text-sm text-red-500">{errors.agree}</p>}
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex flex-wrap items-center gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
              <button
                type="button"
                onClick={() => router.push('/student-login')}
                className="text-teal-600 underline"
              >
                Already have an account? Login
              </button>
            </div>
          </form>
        </div>

        <div className="hidden lg:block relative shadow-lg rounded-3xl">
          <img
            src="/assets/comp.png"
            alt="Student"
            className="w-full rounded-[24px] object-cover"
          />
        </div>
      </div>
    </div>
  );
}