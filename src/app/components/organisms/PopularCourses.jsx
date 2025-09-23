'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { FaChevronLeft, FaChevronRight, FaStar, FaMapMarkerAlt, FaClock, FaUsers, FaHeart, FaShare } from 'react-icons/fa';

import Container from '../atoms/Container';
import Link from 'next/link';

const PopularCourses = ({ data }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    try {
      setLoading(true);

      if (data.success) {
        setCourses(data.data);
      } else {
        console.log(data.message);
        setError(data.message);
      }
    } catch (error) {
      console.log(error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [data]);

  const toggleFavorite = (courseId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(courseId)) {
        newFavorites.delete(courseId);
      } else {
        newFavorites.add(courseId);
      }
      return newFavorites;
    });
  };

  // Enhanced Course Card Component
  const EnhancedCourseCard = ({ course }) => {
    const isFavorite = favorites.has(course.id);
    
    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden group">
        {/* Course Image with Overlay */}
        <div className="relative overflow-hidden">
          <img 
            src={course.image || '/assets/co1.png'} 
            alt={course.name || course.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Course Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {course.discount && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                {course.discount}% OFF
              </span>
            )}
            <span className="bg-[#0B6D76] text-white px-3 py-1 rounded-full text-xs font-bold">
              Featured
            </span>
          </div>
          
          {/* Favorite Button */}
          <button 
            onClick={() => toggleFavorite(course.id)}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full transition-all duration-300 transform hover:scale-110"
          >
            <FaHeart className={`${isFavorite ? "text-red-500" : "text-gray-400"} transition-colors duration-300`} />
          </button>
        </div>

        {/* Course Content */}
        <div className="p-6">
          {/* University Info */}
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0B6D76] to-[#149da9] rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
              {course.university ? course.university.charAt(0) : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {course.university || 'University'}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <FaMapMarkerAlt className="mr-1 flex-shrink-0" />
                <span className="truncate">{course.location || 'Multiple Locations'}</span>
              </div>
            </div>
          </div>

          {/* Course Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-[#0B6D76] transition-colors duration-300 min-h-[3rem]">
            {course.name || course.title || 'Course Title'}
          </h3>


          {/* Price Section */}
          <div className="flex items-center justify-between mb-4">
            <div>
              {course.discount ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#0B6D76]">
                    ${(1000 * (1 - course.discount/100)).toFixed(0)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    $1000
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-[#0B6D76]">Available</span>
              )}
              <p className="text-xs text-gray-500">Scholarship</p>
            </div>
            
            {/* Rating */}
            <div className="text-right">
              <div className="flex items-center justify-end mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar 
                    key={star} 
                    className={`text-sm ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600">4.8/5 Rating</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link 
              href={`/courses/${course.id}`} 
              className="flex-1 bg-gradient-to-r from-[#0B6D76] to-[#149da9] text-white py-3 px-4 rounded-lg text-center font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              View Details
            </Link>
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#0B6D76] rounded-2xl transition-all duration-300 pointer-events-none"></div>
      </div>
    );
  };

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-gray-25 via-white to-blue-25">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-10 left-5 w-72 h-72 bg-[#0B6D76] rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-5 w-96 h-96 bg-[#149da9] rounded-full blur-3xl"></div>
      </div>
      
      <Container className="relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-[#0B6D76] to-[#149da9] text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
            <FaStar className="mr-2" />
            Featured Programs
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B6D76] to-[#149da9]">Courses</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover world-class programs from top universities that will shape your future career path
          </p>
        </div>

        {/* Courses Slider */}
        <div className="relative">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#0B6D76] border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10 text-lg bg-red-50 rounded-2xl">
              {error}
            </div>
          ) : (
            <>
              <Swiper
                modules={[Navigation, Autoplay, Pagination]}
                spaceBetween={30}
                slidesPerView={1}
                centeredSlides={false}
                loop={true}
                autoplay={{
                  delay: 6000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                  el: '.courses-pagination',
                }}
                navigation={{
                  prevEl: '.course-prev',
                  nextEl: '.course-next',
                }}
                breakpoints={{
                  640: { 
                    slidesPerView: 1.2,
                  },
                  768: { 
                    slidesPerView: 2,
                    spaceBetween: 30,
                  },
                  1024: { 
                    slidesPerView: 3,
                    spaceBetween: 30,
                  },
                  1280: {
                    slidesPerView: 3.5,
                    spaceBetween: 30,
                  }
                }}
                className="pb-16"
              >
                {courses.map((course, index) => (
                  <SwiperSlide key={course.id || index}>
                    <EnhancedCourseCard course={course} />
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Navigation Buttons */}
              <div className="flex justify-center md:justify-end gap-4 mt-8">
                <button 
                  className="course-prev bg-white p-4 rounded-full shadow-xl text-[#0B6D76] hover:bg-[#0B6D76] hover:text-white transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#0B6D76] focus:ring-opacity-20"
                  aria-label="Previous courses"
                >
                  <FaChevronLeft className="text-xl" />
                </button>
                <button 
                  className="course-next bg-white p-4 rounded-full shadow-xl text-[#0B6D76] hover:bg-[#0B6D76] hover:text-white transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#0B6D76] focus:ring-opacity-20"
                  aria-label="Next courses"
                >
                  <FaChevronRight className="text-xl" />
                </button>
              </div>

              {/* Custom Pagination */}
              <div className="courses-pagination flex justify-center mt-8 gap-2 !important" />
            </>
          )}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-[#0B6D76] to-[#0B6D76] rounded-2xl p-8 md:p-12 text-white shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Future?</h3>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Join thousands of successful students who found their perfect course through our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses" passHref>
                <button className="bg-white text-[#0B6D76] px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  Explore All Courses
                </button>
              </Link>
              <Link href="/free-consultation" passHref>
                <button className="border-2 border-white text-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-[#0B6D76] transition-all duration-300 transform hover:-translate-y-1">
                  Get Free Consultation
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Container>

      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Custom pagination styles */
        :global(.courses-pagination .swiper-pagination-bullet) {
          width: 12px;
          height: 12px;
          margin: 0 6px;
          background-color: #0B6D76;
          opacity: 0.2;
          transition: all 0.3s ease;
        }
        
        :global(.courses-pagination .swiper-pagination-bullet-active) {
          opacity: 1;
          transform: scale(1.2);
        }
        
        :global(.courses-pagination .swiper-pagination-bullet:hover) {
          opacity: 0.7;
        }
      `}</style>
    </section>
  );
};

export default PopularCourses;