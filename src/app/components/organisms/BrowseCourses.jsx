'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaMinus, FaSearch, FaGraduationCap, FaUniversity, FaBook } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const AccordionItem = ({ title, items, isOpen, toggle, onItemClick, icon }) => {
  const displayItems = items ? items.slice(0, 10) : [];

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 mb-6 overflow-hidden">
      {/* Header */}
      <div
        onClick={toggle}
        className="p-6 cursor-pointer select-none flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-[#0B6D76]/5 hover:to-[#149da9]/5 transition-all duration-300"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0B6D76] to-[#149da9] rounded-xl flex items-center justify-center text-white shadow-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              Multiple options available
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-[#0B6D76] hidden sm:block">
            {isOpen ? 'Collapse' : 'Expand'}
          </span>
          <div className="w-10 h-10 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center hover:bg-[#0B6D76] hover:text-white">
            {isOpen ? <FaMinus className="text-sm" /> : <FaPlus className="text-sm" />}
          </div>
        </div>
      </div>

      {/* Animated Content */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 border-t border-gray-100">
          {displayItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onItemClick(item, title)}
                  className="group relative p-4 text-left bg-gray-50 hover:bg-gradient-to-r hover:from-[#0B6D76] hover:to-[#149da9] rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg border border-gray-200 hover:border-transparent"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 group-hover:text-white transition-colors duration-300 truncate pr-2">
                      {typeof item === 'string' ? item : (item.name || item.title || 'Unnamed Item')}
                    </span>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-2">
                      <FaSearch className="text-white text-xs" />
                      <span className="text-white text-xs font-medium">Explore</span>
                    </div>
                  </div>
                  
                  {/* Hover effect line */}
                  <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-white/30 transition-all duration-300"></div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-gray-400 text-xl" />
              </div>
              <p className="text-gray-500 font-medium">No data available</p>
              <p className="text-sm text-gray-400 mt-1">Please check back later</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BrowseCoursesAccordion = () => {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState(null);
  const [levels, setLevels] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [qualificationsRes, universitiesRes, subjectsRes] = await Promise.all([
          fetch('/api/frontend/getpostlevel', { method: "POST" }),
          fetch('/api/frontend/getfeatureduniversity', { method: "POST"}),
          fetch('/api/frontend/getsubject', { method: "POST"})
        ]);

        const [qualificationsData, universitiesData, subjectsData] = await Promise.all([
          qualificationsRes.json(),
          universitiesRes.json(),
          subjectsRes.json()
        ]);

        setUniversities(universitiesData.data || []);
        setLevels(qualificationsData.data || []);
        setSubjects(subjectsData.data || []);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleItemClick = (item, sectionTitle) => {
    let searchType = '';
    let searchValue = '';
    let qualificationValue = '';
    
    if (sectionTitle.includes('Qualification')) {
      searchType = 'course';
      searchValue = typeof item === 'string' ? item : (item.name || item.title || '');
      qualificationValue = searchValue;
    } else if (sectionTitle.includes('University')) {
      searchType = 'university';
      searchValue = typeof item === 'string' ? item : (item.name || item.title || '');
    } else if (sectionTitle.includes('Subject')) {
      searchType = 'course';
      searchValue = typeof item === 'string' ? item : (item.name || item.title || '');
    }
    
    const searchParams = new URLSearchParams();
    if (searchType) searchParams.append('type', searchType);
    if (searchValue) searchParams.append('search', searchValue);
    if (qualificationValue) searchParams.append('qualification', qualificationValue);
    
    router.push(`/search?${searchParams.toString()}`);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0B6D76] border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading course options...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-[#0B6D76] to-[#149da9] text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg">
            <FaSearch className="mr-2" />
            Smart Course Finder
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B6D76] to-[#149da9]">Program</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore thousands of courses, universities, and subjects to discover the ideal program that matches your career goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Side - Visual Section */}
          <div className="relative">
            {/* Main Image Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://www.go.study/v1.0.1/assets/best-overseas-education-consultants-in-india.jpg"
                alt="Students collaborating"
                width={600}
                height={800}
                className="w-full h-[500px] lg:h-[600px] object-cover"
              />
              
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Stats Badge */}
              <div className="absolute top-6 left-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0B6D76] to-[#149da9] rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg font-bold">🏆</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">30+ Years</p>
                      <p className="text-xs text-gray-600">Quality Education</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Text */}
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white text-lg font-semibold">
                  Join 50,000+ successful students worldwide
                </p>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -right-6 top-1/3 transform translate-y-8">
              <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FaGraduationCap className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">500+</p>
                    <p className="text-xs text-gray-600">Universities</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -left-6 bottom-1/4">
              <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FaBook className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">10K+</p>
                    <p className="text-xs text-gray-600">Courses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Accordion Section */}
          <div className="space-y-6">
            <AccordionItem
              title="Browse By Qualification Level"
              items={levels}
              isOpen={openIndex === 0}
              toggle={() => toggleAccordion(0)}
              onItemClick={handleItemClick}
              icon={<FaGraduationCap />}
            />
            
            <AccordionItem
              title="Explore Top Universities"
              items={universities}
              isOpen={openIndex === 1}
              toggle={() => toggleAccordion(1)}
              onItemClick={handleItemClick}
              icon={<FaUniversity />}
            />
            
            <AccordionItem
              title="Discover By Subject Area"
              items={subjects}
              isOpen={openIndex === 2}
              toggle={() => toggleAccordion(2)}
              onItemClick={handleItemClick}
              icon={<FaBook />}
            />

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-[#0B6D76] to-[#149da9] rounded-2xl p-8 text-white text-center shadow-xl">
              <h3 className="text-2xl font-bold mb-3">Need Personalized Guidance?</h3>
              <p className="mb-6 opacity-90">Our education experts are here to help you find the perfect program</p>
              <button className="bg-white text-[#0B6D76] px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                Book Free Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrowseCoursesAccordion;