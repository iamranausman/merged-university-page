'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { useRouter } from 'next/navigation';
import { useSearch } from '../../context/SearchContext';
import Heading from '../atoms/Heading';
import 'swiper/css';
import 'swiper/css/navigation';

const countries = [
  { name: 'Brazil', flag: 'https://flagcdn.com/w320/br.png' },
  { name: 'Australia', flag: 'https://flagcdn.com/w320/au.png' },
  { name: 'Colombia', flag: 'https://flagcdn.com/w320/co.png' },
  { name: 'Austria', flag: 'https://flagcdn.com/w320/at.png' },
  { name: 'New Zealand', flag: 'https://flagcdn.com/w320/nz.png' },
  { name: 'China', flag: 'https://flagcdn.com/w320/cn.png' },
  { name: 'Belgium', flag: 'https://flagcdn.com/w320/be.png' },
  { name: 'Bulgaria', flag: 'https://flagcdn.com/w320/bg.png' },
  { name: 'Canada', flag: 'https://flagcdn.com/w320/ca.png' },
  { name: 'Germany', flag: 'https://flagcdn.com/w320/de.png' },
  { name: 'Malaysia', flag: 'https://flagcdn.com/w320/my.png' },
  { name: 'France', flag: 'https://flagcdn.com/w320/fr.png' },
  { name: 'Japan', flag: 'https://flagcdn.com/w320/jp.png' },
  { name: 'United Kingdom', flag: 'https://flagcdn.com/w320/gb.png' },
  { name: 'United States', flag: 'https://flagcdn.com/w320/us.png' },
];

const CountryList = () => {
  const router = useRouter();
  const { setSelectedCountry, setSelectedType } = useSearch();

  const handleCountryClick = (countryName) => {
    setSelectedCountry(countryName);
    setSelectedType('country');
    const slug = encodeURIComponent(countryName);
    router.push(`/search?type=university&country=${slug}`);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-green-100 to-blue-100 relative overflow-hidden">
      {/* Premium decorative elements */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-[#0B6F78] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#0a306b] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-64 bg-gradient-to-r from-[#0B6F78] to-[#0a306b] opacity-3 blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-[#0B6F78] to-[#0a306b] mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <Heading level={3} className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Global Study Destinations
          </Heading>
          <div className="w-24 h-1 bg-gradient-to-r from-[#0B6F78] to-[#0a306b] mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover world-class education opportunities across our curated selection of premier study destinations
          </p>
        </div>

        {/* Enhanced Swiper Container */}
        <div className="relative max-w-7xl mx-auto">
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              400: { slidesPerView: 2 },
              640: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 5 },
              1280: { slidesPerView: 6 },
              1536: { slidesPerView: 7 },
            }}
            autoplay={{ 
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            navigation={{
              nextEl: '.country-swiper-button-next',
              prevEl: '.country-swiper-button-prev',
            }}
            loop={true}
            centeredSlides={false}
            grabCursor={true}
            speed={800}
          >
            {countries.map((country, index) => (
              <SwiperSlide key={index}>
                <div
                  className="group flex flex-col items-center text-center bg-white cursor-pointer rounded-2xl shadow-sm px-6 py-8 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl border border-gray-100 hover:border-[#0B6F78]/20 relative overflow-hidden"
                  onClick={() => handleCountryClick(country.name)}
                >
                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 group-hover:from-[#0B6F78]/5 group-hover:to-[#0a306b]/5 transition-all duration-500"></div>
                  
                  <div className="relative mb-6 z-10">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-lg border-4 border-white group-hover:border-[#0B6F78]/20 transition-all duration-500 group-hover:scale-110">
                      <img
                        src={country.flag}
                        alt={country.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#0B6F78] to-[#0a306b] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200"></div>
                  </div>
                  
                  <span className="text-lg font-semibold text-gray-900 group-hover:text-[#0a306b] transition-colors duration-300 relative z-10 leading-tight">
                    {country.name}
                  </span>
                  
                  {/* Subtle badge */}
                  <div className="mt-3 px-3 py-1 bg-gray-100 group-hover:bg-[#0B6F78]/10 rounded-full transition-colors duration-300">
                    <span className="text-xs font-medium text-gray-600 group-hover:text-[#0B6F78]">Explore</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Enhanced Navigation Buttons */}
          <button className="country-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-[#0a306b] hover:bg-[#0a306b] hover:text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0a306b]/20 group">
            <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="country-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-[#0a306b] hover:bg-[#0a306b] hover:text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0a306b]/20 group">
            <svg className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center mt-16">
          <button 
            onClick={() => {
              setSelectedType('country');
              router.push('/search?type=university');
            }}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#0B6F78] to-[#0a306b] text-white font-semibold rounded-xl hover:from-[#0a306b] hover:to-[#0B6F78] transition-all duration-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#0B6F78]/30 group"
          >
            <span className="mr-3">Explore All Destinations</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          
          {/* Supporting text */}
          <p className="text-gray-500 text-sm mt-4 max-w-md mx-auto">
            Browse through 50+ countries and find your perfect study destination
          </p>
        </div>
      </div>

      <style jsx>{`
        .country-swiper-button-prev,
        .country-swiper-button-next {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .swiper-container:hover .country-swiper-button-prev,
        .swiper-container:hover .country-swiper-button-next,
        .country-swiper-button-prev:focus,
        .country-swiper-button-next:focus {
          opacity: 1;
        }
        
        @media (min-width: 1024px) {
          .country-swiper-button-prev,
          .country-swiper-button-next {
            opacity: 0.7;
          }
          
          .country-swiper-button-prev:hover,
          .country-swiper-button-next:hover {
            opacity: 1;
          }
        }
        
        .swiper-slide {
          height: auto;
          opacity: 0.9;
          transition: opacity 0.3s ease;
        }
        
        .swiper-slide-active,
        .swiper-slide:hover {
          opacity: 1;
        }
      `}</style>
    </section>
  );
};

export default CountryList;