'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Heading from '../../components/atoms/Heading';
import Button from '../../components/atoms/Button';
import Swal from 'sweetalert2';

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {

      const response = await fetch("/api/frontend/forgot-password", {
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

      if(data.user_type === "student")
      {
        Swal.fire(
          {
              icon: 'success',
              title: '✅ Password Changed Successfully',
              text: 'Your Password is changes. You can login now.',
              confirmButtonColor: '#0B6D76'
          }
        ).then(() => {
          router.push('/student-login');
        }
        )
        return;
      }
      else if(data.user_type === "consultant")
      {
        Swal.fire(
          {
              icon: 'success',
              title: '✅ Password Changed Successfully',
              text: 'Your Password is changes. You can login now.',
              confirmButtonColor: '#0B6D76'
          }
        ).then(() => {
          router.push('/consultant-login');
        }
        )
        return;
      }

      setEmailSent(true);

      Swal.fire(
        {
            icon: 'success',
            title: '✅ Verification Code Sent',
            text: 'Please check your email for the verification code.',
            confirmButtonColor: '#0B6D76'
        }
      )
      
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
            Recover <span className="text-[#0B6D76]">Password</span>
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
                placeholder="Enter your registered email address"
              />
            </div>

            {emailSent && 
                <div className="relative">
                    <input
                        type="text"
                        name="otp"
                        value={form.otp}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-10 py-4 rounded-full bg-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] text-black"
                        placeholder="Please Enter OTP"
                    />
                    <br /><br />
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-10 py-4 rounded-full bg-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] text-black"
                        placeholder="Enter New Password"
                    />
                    <br /><br />
                    <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-10 py-4 rounded-full bg-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] text-black"
                        placeholder="Please Confirm Your Password"
                    />
                </div>
                
            }
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'In Progress...' : 'Submit'}
            </Button>

            <p className="text-sm text-center text-black">
              Continue to {' '}
              <button
                type="button"
                onClick={() => router.push('/student-login')}
                className="text-[#0B6D76] underline cursor-pointer"
              >
                Login
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