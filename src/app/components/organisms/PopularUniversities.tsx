'use client';

import { useEffect, useState } from 'react';
import Container from '../atoms/Container';
import UniversityCard from '../atoms/UniversityCard';
import Link from 'next/link';

const PopularUniversities = ({ data }) => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    try {
      setLoading(true);

      if (data.success) {
        setUniversities(data.data);
      } else {
        console.log(data.message);
        setError(data.message);
      }
    } catch (error) {
      console.log(error);
      setError('Failed to load universities');
    } finally {
      setLoading(false);
    }
  }, [data]);

  // Handle navigation for mobile carousel
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === universities.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? universities.length - 1 : prevIndex - 1
    );
  };

  // Auto-rotate carousel
  useEffect(() => {
    if (universities.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === universities.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [universities.length]);

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Popular <span className="text-[#0B6D76]">Universities</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore world-renowned universities offering top-tier education,
            diverse programs, and vibrant campus life. Choose your path to
            success at prestigious institutions.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B6D76]"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10 text-lg">{error}</div>
        ) : (
          <>
            {/* Desktop View - Full grid with connectors */}
            <div className="hidden lg:grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
              {universities.map((university, index) => {
                const image = university.logo && typeof university.logo === 'string' && university.logo.trim() !== ''
                  ? university.logo
                  : '/assets/university_icon.png';
                const name = university.name || 'University';
                const id = university.id;
                const slug = university.slug || '';
                
                return (
                  <div key={id} className="flex flex-col items-center relative">
                    <UniversityCard
                      name={name}
                      logo={image}
                      style={{}}
                      image={image}
                      id={id}
                      slug={slug}
                      className="transition-transform duration-300 hover:scale-105"
                    />
                    
                    {/* Connector lines between cards */}
                    {index < universities.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2 w-16 h-1 bg-gradient-to-r from-[#0B6D76] to-transparent opacity-50"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tablet View - 2 columns */}
            <div className="hidden md:grid lg:hidden grid-cols-2 gap-6">
              {universities.map((university) => {
                const image = university.logo && typeof university.logo === 'string' && university.logo.trim() !== ''
                  ? university.logo
                  : '/assets/university_icon.png';
                const name = university.name || 'University';
                const id = university.id;
                const slug = university.slug || '';
                
                return (
                  <div key={id} className="flex justify-center">
                    <UniversityCard
                      name={name}
                      image={image}
                      logo={image}
                      style={{}}
                      id={id}
                      slug={slug}
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                );
              })}
            </div>

            {/* Mobile View - Carousel */}
            <div className="md:hidden relative overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {universities.map((university) => {
                  const image = university.logo && typeof university.logo === 'string' && university.logo.trim() !== ''
                    ? university.logo
                    : '/assets/university_icon.png';
                  const name = university.name || 'University';
                  const id = university.id;
                  const slug = university.slug || '';
                  
                  return (
                    <div key={id} className="w-full flex-shrink-0 px-4">
                      <UniversityCard
                        name={name}
                        image={image}
                        logo={image}
                        style={{}}
                        id={id}
                        slug={slug}
                        className="mx-auto transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  );
                })}
              </div>
              
              {/* Navigation arrows for mobile */}
              {universities.length > 1 && (
                <>
                  <button 
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 focus:outline-none"
                    aria-label="Previous university"
                  >
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 focus:outline-none"
                    aria-label="Next university"
                  >
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              {/* Dots indicator for mobile */}
              {universities.length > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  {universities.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentIndex ? 'bg-[#0B6D76]' : 'bg-gray-300'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16 md:mt-24">
          <Link  href={"/search?type=university"} className="bg-[#0B6D76] hover:bg-[#095a62] text-white font-medium py-3 px-8 rounded-lg transition-colors duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg">
            Explore All Universities
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default PopularUniversities;