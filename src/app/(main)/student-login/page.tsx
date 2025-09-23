'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Heading from '../../components/atoms/Heading';
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaLinkedinIn, FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '../../components/atoms/Button';
import { signIn } from 'next-auth/react';
import Swal from 'sweetalert2';
import {useUserStore} from '../../../store/useUserStore';
import toast from 'react-hot-toast';

export default function LoginForm() {

  const setUser = useUserStore((state) => state.setUser);

  const router = useRouter();
  const pathname = usePathname();

  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleGoogleLogin = () => {
    window.location.href = "/api/frontend/login/auth/google/";
  }

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    setIsSubmitting(true)

    const response  = await fetch("/api/frontend/login/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(form)
    })

    if(!response.ok) {
      const errorData = await response.json();

      const errorMessages = errorData.message;

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMessages || 'An error occurred',
      });

      setIsSubmitting(false)
      return;
    }

    const data = await response.json();

    setUser(data.data);

    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    // If there is no wishlist, just return
    if (wishlist.length === 0) {
      console.log('No wishlist to sync');
    }

    // Prepare the data to be sent to the server
    const wishdata = {
      items: wishlist,
    };

    // Send the wishlist to the backend API
    await fetch('/api/frontend/wishlist', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wishdata),
    });

    toast.success(data.message);

    if(data.role === "admin"){
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }

  } catch {
    setIsSubmitting(false)
  } finally {
    setIsSubmitting(false);
  }

}
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-6xl w-full items-center gap-12 md:gap-20 rounded-3xl bg-white shadow-xl p-8 md:p-12">
        {/* Form Section */}
        <div className="w-full order-2 md:order-1">
          <div className="text-center md:text-left mb-8">
            <Heading level={2} className="font-bold text-3xl text-gray-800 mb-2">
              Welcome Back
            </Heading>
            <p className="text-gray-600">
              Login to access your {pathname.includes('/admin') ? 'admin' : 'student'} account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border border-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent transition-all duration-200 text-gray-800"
                placeholder="Email address"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-gray-50 border border-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent transition-all duration-200 text-gray-800"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center text-gray-700 gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-[#0B6D76] focus:ring-[#0B6D76]" />
                <span>Remember Me</span>
              </label>
              <button type="button" className="text-[#0B6D76] hover:text-teal-700 font-medium transition-colors duration-200">
                Forgot Password?
              </button>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full py-4 rounded-xl font-medium text-white bg-gradient-to-r from-[#0B6D76] to-teal-600 hover:from-teal-600 hover:to-[#0B6D76] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {isSubmitting ? 'Logging in...' : 'Sign In'}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FcGoogle size={18} /> Login With Google
              </button>
            {/*  <button
                type="button"
                onClick={() => signIn('github')}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FaGithub size={18} />
              </button>
              <button
                type="button"
                onClick={() => signIn('linkedin')}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FaLinkedinIn size={18} />
              </button>*/}
            </div>

            <p className="text-sm text-center text-gray-600 mt-6">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/student-register')}
                className="text-[#0B6D76] font-medium hover:text-teal-700 transition-colors duration-200"
              >
                {pathname.includes('/admin') ? 'Register As Admin' : 'Register As Student'}
              </button>
            </p>
          </form>
        </div>

        {/* Image Section */}
        <div className="relative order-1 md:order-2">
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 h-4/5 w-6 bg-gradient-to-b from-[#0B6D76] to-teal-500 rounded-r-2xl z-10 hidden md:block"></div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src="/assets/dsic.png"
              alt="Free Consultation"
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B6D76]/80 to-transparent p-6 text-white">
            <h3 className="text-xl font-bold">Learning Made Accessible</h3>
            <p className="text-sm mt-1">Access courses, track progress, and achieve your goals</p>
          </div>
        </div>
      </div>
    </div>
  );
}