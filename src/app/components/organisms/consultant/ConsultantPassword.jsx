'use client';

import React, { useState } from 'react';
import Heading from '../../atoms/Heading';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';


const ConsultantPassword = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.newPassword !== form.confirmPassword) {
      await Swal.fire({ icon: 'error', title: 'Error', text: 'New password and confirm password do not match.' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/frontend/consultant/consultantdashboard/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Password updated successfully!' });
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
      console.error(err);
      await Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <Heading level={5} className="text-center mb-6">
        Change Password
      </Heading>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-[#0B6D76]"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-[#0B6D76]"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-[#0B6D76]"
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#0B6D76] text-white py-2 px-4 rounded-lg hover:bg-[#095a62] disabled:opacity-70"
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ConsultantPassword;