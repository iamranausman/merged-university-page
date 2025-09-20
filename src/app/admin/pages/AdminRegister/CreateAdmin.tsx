"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

const CreateAdmin = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
    country: "",
    postal: "",
    userGroup: "Administrator",
    dob: "",
    address: "",
    profileImage: null,
    active: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields.',
        confirmButtonColor: '#0B6D76'
      });
      return;
    }

    if (formData.password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Password Too Short',
        text: 'Password must be at least 6 characters long.',
        confirmButtonColor: '#0B6D76'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match.',
        confirmButtonColor: '#0B6D76'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append("first_name", formData.firstName.trim());
      body.append("last_name", formData.lastName.trim());
      body.append("email", formData.email.trim());
      body.append("password", formData.password);
      body.append("confirm_password", formData.confirmPassword);
      body.append("phone", formData.phone.trim());
      body.append("city", formData.city.trim());
      body.append("country", formData.country.trim());
      body.append("postal", formData.postal.trim());
      body.append("user_group", formData.userGroup);
      body.append("dob", formData.dob);
      body.append("address", formData.address.trim());
      body.append("active", formData.active.toString());
      
      if (formData.profileImage) {
        body.append("profile_image", formData.profileImage);
      }

      const response = await fetch("/api/internal/auth/users/signup", {
        method: "POST",
        body,
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Admin created successfully',
          confirmButtonColor: '#0B6D76',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          router.push("/admin/admin-register/list");
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: data.message || "Failed to create admin account",
          confirmButtonColor: '#0B6D76'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Network error. Please try again.',
        confirmButtonColor: '#0B6D76'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            href="/admin-register/list"
            className="p-2 mr-4 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Create Admin Account</h1>
            <p className="text-gray-600">Add a new administrator to the system</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent transition-colors"
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent transition-colors"
                placeholder="Enter last name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent transition-colors"
                placeholder="Enter email address"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent transition-colors"
                placeholder="Enter phone number"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent transition-colors"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent transition-colors"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* User Group */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                User Group
              </label>
              <select
                name="userGroup"
                value={formData.userGroup}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent transition-colors"
              >
                <option value="Administrator">Administrator</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent transition-colors"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent transition-colors"
                placeholder="Enter city"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent transition-colors"
                placeholder="Enter country"
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                name="postal"
                value={formData.postal}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent transition-colors"
                placeholder="Enter postal code"
              />
            </div>

            {/* Profile Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Profile Image
              </label>
              <input
                type="file"
                name="profileImage"
                onChange={handleChange}
                accept="image/*"
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent transition-colors"
              placeholder="Enter full address"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="w-5 h-5 text-[#0B6D76] border-gray-300 rounded focus:ring-[#0B6D76]"
            />
            <label className="text-sm font-semibold text-gray-700">
              Active Account
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#0B6D76] text-white px-8 py-3 rounded-xl hover:bg-[#085a61] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? "Creating..." : "Create Admin"}
            </button>
            <Link
              href="/admin/admin-register/list"
              className="flex items-center justify-center bg-gray-200 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdmin;