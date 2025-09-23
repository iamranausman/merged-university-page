'use client';
import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Image from "next/image";

const reviews = [
  {
    id: 1,
    name: 'Sarah Chen',
    country: 'China',
    destination: 'University of Toronto, Canada',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&w=150',
    review: 'The guidance I received was exceptional. From visa processing to accommodation, every step was seamlessly handled. My dream of studying in Canada became reality thanks to their dedicated support.',
    flag: 'https://flagcdn.com/w40/cn.png',
    course: 'Masters in Computer Science'
  },
  {
    id: 2,
    name: 'Ahmed Hassan',
    country: 'Egypt',
    destination: 'University of Melbourne, Australia',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150',
    review: 'Outstanding service! The team helped me secure a scholarship I never thought possible. The cultural adaptation support made my transition to Australia smooth and enjoyable.',
    flag: 'https://flagcdn.com/w40/eg.png',
    course: 'Bachelor of Business Administration'
  },
  {
    id: 3,
    name: 'Maria Rodriguez',
    country: 'Brazil',
    destination: 'University College London, UK',
    rating: 4,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&w=150',
    review: 'Professional and reliable. They matched me with the perfect program and provided excellent pre-departure orientation. My experience in London has been transformative.',
    flag: 'https://flagcdn.com/w40/br.png',
    course: 'PhD in International Relations'
  },
  {
    id: 4,
    name: 'David Kim',
    country: 'South Korea',
    destination: 'ETH Zurich, Switzerland',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-4.0.3&w=150',
    review: 'The personalized attention I received was beyond expectations. They navigated the complex Swiss admission process effortlessly. Highly recommended for ambitious students!',
    flag: 'https://flagcdn.com/w40/kr.png',
    course: 'Masters in Mechanical Engineering'
  },
  {
    id: 5,
    name: 'Priya Patel',
    country: 'India',
    destination: 'University of Sydney, Australia',
    rating: 4,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=150',
    review: 'From application to arrival, everything was perfectly coordinated. The post-arrival support helped me settle in quickly. A truly life-changing experience!',
    flag: 'https://flagcdn.com/w40/in.png',
    course: 'Bachelor of Medicine'
  },
  {
    id: 6,
    name: 'James Wilson',
    country: 'United States',
    destination: 'National University of Singapore',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=150',
    review: 'Exceptional service! They helped me navigate Asian education systems and cultural differences. My Singapore experience has been academically rewarding.',
    flag: 'https://flagcdn.com/w40/us.png',
    course: 'MBA'
  }
];

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const StudentsReviews = () => {
  const [activeReview, setActiveReview] = useState(0);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#0B6F78] opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0a306b] opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0B6F78 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-[#0B6F78] to-[#0a306b] mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Student Success Stories
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#0B6F78] to-[#0a306b] mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Hear from our students who have transformed their lives through international education
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-2xl mx-auto">
          {[
            { number: '2,500+', label: 'Students Placed' },
            { number: '50+', label: 'Countries' },
            { number: '98%', label: 'Success Rate' },
            { number: '4.9/5', label: 'Student Rating' }
          ].map((stat, index) => (
            <div key={index} className="text-center p-4">
              <div className="text-2xl md:text-3xl font-bold text-[#0a306b] mb-2">{stat.number}</div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Reviews Swiper */}
        <div className="max-w-6xl mx-auto">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            autoplay={{ 
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            pagination={{
              clickable: true,
              el: '.reviews-pagination',
              bulletClass: 'reviews-bullet',
              bulletActiveClass: 'reviews-bullet-active'
            }}
            navigation={{
              nextEl: '.reviews-button-next',
              prevEl: '.reviews-button-prev',
            }}
            loop={true}
            grabCursor={true}
            speed={800}
            onSlideChange={(swiper) => setActiveReview(swiper.realIndex)}
            className="pb-16"
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.id}>
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 p-8 h-full border border-gray-100 group hover:border-[#0B6F78]/20">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Image
                          src={review.image}
                          alt={review.name}
                          width={56} // w-14 = 56px
                          height={56}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                        />

                        <Image
                          src={review.flag}
                          alt={review.country}
                          width={20} // w-5 = 20px
                          height={20}
                          className="w-5 h-5 rounded-full absolute -bottom-1 -right-1 border border-white"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{review.name}</h4>
                        <p className="text-sm text-gray-600">{review.country}</p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>

                  {/* Review Content */}
                  <blockquote className="text-gray-700 leading-relaxed mb-6 italic">
                    {review.review}
                  </blockquote>

                  {/* Destination Info */}
                  <div className="border-t border-gray-100 pt-6">
                    <div className="text-sm font-medium text-[#0a306b] mb-1">{review.destination}</div>
                    <div className="text-xs text-gray-600">{review.course}</div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0B6F78]/5 to-[#0a306b]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Pagination */}
          <div className="reviews-pagination flex justify-center space-x-2 mt-8"></div>

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button className="reviews-button-prev w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-[#0a306b] hover:bg-[#0a306b] hover:text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0a306b]/20 group">
              <svg className="w-6 h-6 transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-sm text-gray-600 font-medium">
              {activeReview + 1} / {reviews.length}
            </div>
            
            <button className="reviews-button-next w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-[#0a306b] hover:bg-[#0a306b] hover:text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0a306b]/20 group">
              <svg className="w-6 h-6 transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-[#0B6F78] to-[#0a306b] rounded-2xl p-8 max-w-4xl mx-auto shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Your Journey?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Join thousands of successful students who have achieved their dreams with our guidance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                  href="https://www.google.com/search?q=universitiespage&rlz=1C1ONGR_en-GBPK1174PK1174&oq=universitiespage+&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIGCAEQRRg8MgYIAhBFGDwyBggDEEUYPDIGCAQQRRg8MgYIBRBFGDwyBggGEEUYQdIBBzgxNWowajSoAgCwAgE&sourceid=chrome&ie=UTF-8#lrd=0x391903a687766e03:0xb3d2577d5a2fe6ce,1,,,,"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="px-8 py-3 bg-white text-[#0a306b] font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 shadow-lg">
                    Share Your Story
                  </button>
                </a>

                <a
                  href="https://www.google.com/search?q=universitiespage&rlz=1C1ONGR_en-GBPK1174PK1174&oq=universitiespage+&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIGCAEQRRg8MgYIAhBFGDwyBggDEEUYPDIGCAQQRRg8MgYIBRBFGDwyBggGEEUYQdIBBzgxNWowajSoAgCwAgE&sourceid=chrome&ie=UTF-8#lrd=0x391903a687766e03:0xb3d2577d5a2fe6ce,1,,,,"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#0a306b] transition-all duration-300 transform hover:-translate-y-1">
                    Read More Reviews
                  </button>
                </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .reviews-bullet {
          display: inline-block;
          width: 12px;
          height: 12px;
          background: #E5E7EB;
          border-radius: 50%;
          margin: 0 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .reviews-bullet-active {
          background: linear-gradient(135deg, #0B6F78, #0a306b);
          transform: scale(1.2);
        }
        
        .swiper-pagination {
          position: relative;
          margin-top: 2rem;
        }
      `}</style>
    </section>
  );
};

export default StudentsReviews;