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

export default function ConsultantForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    company_name: '',
    number_of_employees: '',
    nationality: '',
    state: '',
    city: '',
    address: '',
    first_name: '',
    last_name: '',
    designation: '',
    email: '',
    mobile_number: '',
    password: '',
    confirm_password: '',
    comment: '',
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

  const employeeRanges = ['1-5', '6-10', '11-20', '20+'];

  // Password validation function
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: minLength && hasNumber && hasUppercase && hasSpecialChar,
      minLength,
      hasNumber,
      hasUppercase,
      hasSpecialChar
    };
  };

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

  const validateForm = () => {
    const newErrors = {};
    if (!form.company_name.trim()) newErrors.company_name = 'Company name is required';
    if (!form.number_of_employees) newErrors.number_of_employees = 'Number of employees is required';
    if (!form.nationality) newErrors.nationality = 'Nationality is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.city) newErrors.city = 'City is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!form.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!form.designation.trim()) newErrors.designation = 'Designation is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email is invalid';
    if (!form.mobile_number.trim()) newErrors.mobile_number = 'Mobile number is required';
    
    // Enhanced password validation
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(form.password);
      if (!passwordValidation.isValid) {
        newErrors.password = 'Password must meet required criteria.';
      }
    }
    
    if (form.password !== form.confirm_password) newErrors.confirm_password = 'Passwords do not match';
    if (!form.agree) newErrors.agree = 'You must agree to the terms';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    
    if (name === 'nationality') {
      fetchCities(value);
      setForm(prev => ({ ...prev, city: '' })); // Reset city when country changes
    }
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validateForm()) return;
    
    // Check password validation before submission
    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.isValid) {
      Swal.fire({
        icon: 'error',
        title: '❌ Password must meet required criteria.',
        html: `
          <div class="text-left">
            <p class="mb-2">Your password must contain:</p>
            <ul class="list-disc list-inside space-y-1">
              <li class="${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}">At least 8 characters</li>
              <li class="${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}">At least one number</li>
              <li class="${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-600'}">At least one uppercase letter</li>
              <li class="${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}">At least one special character (!@#$%^&*)</li>
            </ul>
          </div>
        `,
        confirmButtonColor: '#0B6D76'
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/frontend/consultant/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...form,
          phone: form.mobile_number, // Map mobile_number to phone for the API
          number_of_employees: form.number_of_employees
        })
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
        
        // Reset form
        setForm({
          company_name: '',
          number_of_employees: '',
          nationality: '',
          state: '',
          city: '',
          address: '',
          first_name: '',
          last_name: '',
          designation: '',
          email: '',
          mobile_number: '',
          password: '',
          confirm_password: '',
          comment: '',
          agree: false,
        });
        
        setTimeout(() => {
          router.push('/consultant-login');
        }, 2000);
      } else {
        // Handle specific error cases
        let errorTitle = '❌ Registration Failed';
        let errorMessage = data.message || 'Registration failed. Please try again.';
        
        if (data.message && data.message.includes('Email already registered')) {
          errorTitle = '❌ Email already registered. Please login instead.';
          errorMessage = 'This email is already in use. Please login with your existing account.';
        } else if (data.message && data.message.includes('Password')) {
          errorTitle = '❌ Password validation failed';
          errorMessage = 'Please ensure your password meets all requirements.';
        }
        
        Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
          confirmButtonColor: '#0B6D76'
        });
      }
    } catch (err) {
      console.error('Network Error:', err);
      Swal.fire({
        icon: 'error',
        title: '❌ Something went wrong, please try again later',
        text: 'Network error. Please check your connection and try again.',
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
            Registration <span className="text-teal-600">As Consultant</span>
          </Heading>

          {/* Password Requirements Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Password Requirements:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• At least 8 characters</li>
              <li>• At least one number</li>
              <li>• At least one uppercase letter</li>
              <li>• At least one special character (!@#$%^&*)</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['company_name', 'first_name', 'last_name', 'designation', 'email', 'mobile_number', 'address'].map((field) => (
              <div key={field} className="relative">
                <Input
                  id={field}
                  type="text"
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  placeholder={formatLabel(field)}
                />
                {errors[field] && <p className="text-sm text-red-500">{errors[field]}</p>}
              </div>
            ))}

            {/* Number of Employees Dropdown */}
            <div>
              <select
                name="number_of_employees"
                value={form.number_of_employees}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none"
              >
                <option value="">Number of Employees</option>
                {employeeRanges.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.number_of_employees && <p className="text-sm text-red-500">{errors.number_of_employees}</p>}
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

            {/* Password Fields */}
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                placeholder="Confirm Password"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
              {errors.confirm_password && <p className="text-sm text-red-500">{errors.confirm_password}</p>}
            </div>

            {/* Comment Textarea */}
            <div className="md:col-span-2">
              <textarea
                name="comment"
                value={form.comment}
                onChange={handleChange}
                placeholder="Comment"
                rows="3"
                className="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:outline-none"
              />
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
                onClick={() => router.push('/consultant-login')}
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
            alt="Consultant"
            className="w-full rounded-[24px] object-cover"
          />
        </div>
      </div>
    </div>
  );
}