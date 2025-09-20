'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Heading from '../../components/atoms/Heading';
import { FcGoogle } from "react-icons/fc";
import {   FaGithub, FaLinkedinIn } from 'react-icons/fa';
import Button from '../../components/atoms/Button';
import { signIn } from 'next-auth/react';
import {useUserStore} from '../../../store/useUserStore';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const setUser = useUserStore((state) => state.setUser);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/frontend/consultant/login/auth/google/";
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Enhanced email validation
      if (!form.email || !form.email.trim()) {
        Swal.fire({
          icon: 'error',
          title: '❌ Email Required',
          text: 'Please enter your email address.',
          confirmButtonColor: '#0B6D76'
        });
        setIsSubmitting(false);
        return;
      }

      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        Swal.fire({
          icon: 'error',
          title: '❌ Invalid Email Format',
          text: 'Please enter a valid email address (e.g., user@example.com).',
          confirmButtonColor: '#0B6D76'
        });
        setIsSubmitting(false);
        return;
      }

      // Enhanced password validation
      if (!form.password || !form.password.trim()) {
        Swal.fire({
          icon: 'error',
          title: '❌ Password Required',
          text: 'Please enter your password.',
          confirmButtonColor: '#0B6D76'
        });
        setIsSubmitting(false);
        return;
      }

      // Check password length
      if (form.password.trim().length < 1) {
        Swal.fire({
          icon: 'error',
          title: '❌ Password Too Short',
          text: 'Password must be at least 1 character long.',
          confirmButtonColor: '#0B6D76'
        });
        setIsSubmitting(false);
        return;
      }

      // Proceed directly with NextAuth login
      console.log('🔍 Proceeding with NextAuth login...');

      const response = await fetch("/api/frontend/consultant/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })

      if(!response.ok){
        const data = await response.json();

        Swal.fire({
          icon: 'error',
          title: '❌ Login Failed',
          text: data.message || 'Login failed. Please try again.',
          confirmButtonColor: '#0B6D76'
        });

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

      if(data.role === "consultant"){
        router.push('/consultant-dashboard');
      }
      else{
        router.push("/")
      }
      
    } catch (err) {
      console.error('Login error:', err);
      Swal.fire({
        icon: 'error',
        title: '❌ Something went wrong, please try again later',
        text: 'An unexpected error occurred. Please try again.',
        confirmButtonColor: '#0B6D76'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-6xl w-full items-center gap-[80px]">
        {/* Form Section */}
        <div className="w-full">
          <Heading level={3}>
            Login <span className="text-[#0B6D76]">As Consultant</span>
          </Heading>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">

            <div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-4 rounded-full bg-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] text-black"
                placeholder="Email"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-10 py-4 rounded-full bg-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] text-black"
                placeholder="Password"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 cursor-pointer text-gray-600"
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center text-black gap-2">
                <input type="checkbox" />
                <span>Remember Me</span>
              </label>
              <Link href={"/forgot-password"}><button type="button" className="text-[#0B6D76] underline cursor-pointer">
                Forgot Password
              </button></Link>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Logging in...' : 'Submit'}
            </Button>

            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-full py-2 px-4 text-sm"
              >
                <FcGoogle/>
                Google
              </button>
              <button
                type="button"
                onClick={() => signIn('github')}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-full py-2 px-4 text-sm"
              >
                <FaGithub/>
                GitHub
              </button>
              <button
                type="button"
                onClick={() => signIn('linkedin')}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-full py-2 px-4 text-sm"
              >
                <FaLinkedinIn/>
                LinkedIn
              </button>
            </div>

            <p className="text-sm text-center text-black">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/consultant-register')}
                className="text-[#0B6D76] underline cursor-pointer"
              >
                Register As Consultant
              </button>
            </p>
          </form>
        </div>

        {/* Image Section */}
                <div className="relative rounded-3xl  shadow-lg hidden md:block">
           <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 h-[80%] w-[30px] bg-[#0B6D76] rounded-bl-3xl rounded-tl-3xl z-10"></div>
           <img
            src="/assets/dsic.png"
            alt="Free Consultation"
            className="w-full h-auto object-cover relative z-0 rounded-3xl"
          />
        </div>
      </div>
    </div>
  );
}