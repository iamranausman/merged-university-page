'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import debounce from 'lodash/debounce';

const SearchPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  type FilterState = {
  type: string;
  search: string;
  country: string;
  qualification: string;
  scholarship: string;
  subject: string;
  sort: string;
};

const [filters, setFilters] = useState<FilterState>({
  type: searchParams.get('type') || 'all',
  search: searchParams.get('q') || '',
  country: searchParams.get('country') || 'Select Country',
  qualification: searchParams.get('qualification') || '',
  scholarship: searchParams.get('scholarship') || '',
  subject: searchParams.get('subject') || '',
  sort: searchParams.get('sort') || 'relevance',
});

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });
  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    qualifications: [],
    subjects: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll for mobile search
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchFilters, page = 1) => {
      setLoading(true);
      
      try {
        // Build query string
        const params = new URLSearchParams();
        Object.entries(searchFilters).forEach(([key, value]) => {
          if (value && value !== 'Select Country') {
            params.append(key, String(value));
          }
        });

        params.append('page', String(page));
        params.append('limit', String(pagination.itemsPerPage));

        
        // Update URL without page reload
        const newUrl = `/search?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
        
        // Fetch results
        const response = await fetch(`/api/frontend/search?${params}`);
        const data = await response.json();
        
        if (data.success) {
          setResults(data.data);
          setPagination(data.pagination);
          setFilterOptions(data.filters);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 500), // Wait 500ms after typing stops
    [pagination.itemsPerPage]
  );

  // Initial load and when filters change
  useEffect(() => {
    debouncedSearch(filters, 1);
  }, [filters, debouncedSearch]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    debouncedSearch(filters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      type: 'all',
      search: '',
      country: 'Select Country',
      qualification: '',
      scholarship: '',
      subject: '',
      sort: 'relevance'
    });
    setActiveTab('all');
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'type') return value !== 'all';
      if (key === 'country') return value !== 'Select Country';
      if (key === 'sort') return false;
      return value !== '';
    });
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-100 md:h-110 bg-gradient-to-r from-[#0B6D76] to-[#2D3959] overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="absolute inset-0 flex items-center justify-center text-center px-4 pt-16 md:pt-0">
          <div className="text-white z-10 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 mt-10">Discover Your Future Education</h1>
            <p className="text-lg md:text-xl mb-6">Find the perfect university or course from thousands of options worldwide</p>
            
            {/* Mobile Search Bar (sticky) */}
            <div className={`lg:hidden fixed top-16 left-0 right-0 z-50 px-4 py-3 bg-white shadow-md transition-all duration-300 ${isScrolled ? 'translate-y-0' : '-translate-y-full'}`}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search universities, courses..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] shadow-sm border border-gray-200"
                />
                <div className="absolute right-2 top-2">
                  <button className="bg-[#0B6D76] text-white p-2 rounded-lg hover:bg-[#095a62] transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div className="relative max-w-2xl mx-auto hidden lg:block">
              <input
                type="text"
                placeholder="Search universities, courses, subjects, or locations..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-6 py-4 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] shadow-lg"
              />

              <div className="absolute right-2 top-2">
                <button className="bg-[#0B6D76] text-white p-3 rounded-full hover:bg-[#095a62] transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10 pt-10">
              {[
                { value: '500+', label: 'Universities' },
                { value: '10,000+', label: 'Courses' },
                { value: '50+', label: 'Countries' },
                { value: '5,000+', label: 'Scholarships' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                  <div className="text-xs md:text-sm opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* How It Works Section - Horizontal Scroll on Mobile */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">Find Your Perfect Program in 3 Simple Steps</h2>
          <div className="overflow-x-auto pb-4 md:overflow-visible">
            <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 min-w-max md:min-w-full">
              {[
                {
                  step: 1,
                  title: "Search & Filter",
                  description: "Use our advanced filters to find programs that match your criteria",
                  icon: (
                    <svg className="w-8 h-8 text-[#0B6D76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  )
                },
                {
                  step: 2,
                  title: "Compare Options",
                  description: "Review details, rankings, and scholarship opportunities",
                  icon: (
                    <svg className="w-8 h-8 text-[#0B6D76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )
                },
                {
                  step: 3,
                  title: "Apply with Confidence",
                  description: "Get expert guidance through the application process",
                  icon: (
                    <svg className="w-8 h-8 text-[#0B6D76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )
                }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 flex-shrink-0 w-80 md:w-auto">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-[#E6F4F5] rounded-full flex items-center justify-center mb-4">
                      {item.icon}
                    </div>
                    <div className="w-8 h-8 bg-[#0B6D76] text-white rounded-full flex items-center justify-center text-sm font-bold mb-2">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-8 top-2 z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <h2 className="text-xl font-bold text-gray-800 hidden md:block">Filters</h2>
              
              {/* Type Tabs */}
              <div className="flex border-b border-gray-200 w-full md:w-auto overflow-x-auto">
                {[
                  { id: 'all', label: 'All Results' },
                  { id: 'university', label: 'Universities' },
                  { id: 'course', label: 'Courses' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      handleFilterChange('type', tab.id);
                      setActiveTab(tab.id);
                    }}
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition whitespace-nowrap ${
                      filters.type === tab.id
                        ? 'text-[#0B6D76] border-b-2 border-[#0B6D76]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              {/* Country Filter */}
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent text-sm flex-1 md:flex-none"
              >
                <option value="Select Country">Select Country</option>
                {filterOptions.countries.map((country, index) => (
                  <option key={index} value={country}>{country}</option>
                ))}
              </select>

              {/* Scholarship Filter */}
              <select
                value={filters.scholarship}
                onChange={(e) => handleFilterChange('scholarship', e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent text-sm flex-1 md:flex-none"
              >
                <option value="">Scholarship: Any</option>
                <option value="With Scholarship">With Scholarship</option>
                <option value="Without Scholarship">Without Scholarship</option>
              </select>

              {/* Qualification Filter (for courses) */}
              {(filters.type === 'course' || filters.type === 'all') && (
                <select
                  value={filters.qualification}
                  onChange={(e) => handleFilterChange('qualification', e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent text-sm flex-1 md:flex-none"
                >
                  <option value="">Qualification: Any</option>
                  {filterOptions.qualifications.map((qual) => (
                    <option key={qual.id} value={qual.id}>
                      {qual.title}
                    </option>
                  ))}
                </select>
              )}

              {/* Subject Filter (for courses) */}
              {(filters.type === 'course' || filters.type === 'all') && (
                <select
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent text-sm flex-1 md:flex-none"
                >
                  <option value="">Subject: Any</option>
                  {filterOptions.subjects.map((subject) => (
                    <option key={subject.id} value={subject.name}>{subject.name}</option>
                  ))}
                </select>
              )}

              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="text-sm text-[#0B6D76] hover:text-[#095a62] font-medium flex items-center whitespace-nowrap"
                >
                  Clear All
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div>
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {filters.type === 'all' ? 'Universities & Courses' : 
                 filters.type === 'university' ? 'Universities' : 'Courses'}
              </h2>
              <p className="text-gray-600">
                {loading ? 'Searching...' : `Found ${pagination.totalItems} results`}
              </p>
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2 hidden sm:block">Sort by:</span>
              <select
  value={filters.sort}
  onChange={(e) => handleFilterChange('sort', e.target.value)}
  className="text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
>
  <option value="relevance">Relevance</option>
  <option value="popularity">Most Popular</option>
  <option value="ranking">Highest Ranked</option>
  <option value="newest">Newest</option>
</select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B6D76]"></div>
            </div>
          )}

          {/* Results Grid */}
          {!loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {results.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="relative">
                      <Image
                        src={item.image || (item.type === 'university'
                          ? '/university-placeholder.png'
                          : '/course-placeholder.png')}
                        alt={item.name}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover"
                      />

                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.type === 'university' 
                            ? 'bg-[#E6F4F5] text-[#0B6D76]' 
                            : 'bg-[#EAECF5] text-[#2D3959]'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      {item.scholarship && (
                        <div className="absolute top-4 right-4">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            Scholarship
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{item.name}</h3>
                      
                      {item.type === 'course' && item.university && (
                        <p className="text-gray-600 mb-3 text-sm">{item.university}</p>
                      )}
                      
                      <div className="flex items-center text-gray-600 mb-4 text-sm">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{item.location}</span>
                      </div>

                      {item.type === 'course' && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.qualification && (
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              {item.qualification}
                            </span>
                          )}
                          {item.subject && (
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              {item.subject}
                            </span>
                          )}
                          {item.duration && (
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              {item.duration} Year{item.duration > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Link 
                          href={`/${item.type === 'university' ? 'university' : 'courses'}/${item.slug || item.id}`}
                          className="flex-1 bg-[#0B6D76] text-white text-center py-2 rounded-lg hover:bg-[#095a62] transition font-medium text-sm"
                        >
                          View Details
                        </Link>
                        <Link href="free-consultation" className="flex-1 text-center border border-[#0B6D76] text-[#0B6D76] py-2 rounded-lg hover:bg-[#E6F4F5] transition font-medium text-sm">
                          Free Consultation
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {results.length === 0 && (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                  <button 
                    onClick={clearFilters}
                    className="bg-[#0B6D76] text-white px-6 py-2 rounded-lg hover:bg-[#095a62] transition"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === pagination.totalPages || 
                        Math.abs(page - pagination.currentPage) <= 1
                      )
                      .map((page, index, array) => {
                        const showEllipsis = index > 0 && page - array[index - 1] > 1;
                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsis && <span className="px-2">...</span>}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`w-10 h-10 rounded-lg ${
                                pagination.currentPage === page
                                  ? 'bg-[#0B6D76] text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
                    >
                      Next
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mt-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">Why Thousands of Students Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Trusted Guidance",
                description: "Our experts provide personalized advice to help you make the right choice.",
                icon: (
                  <svg className="w-8 h-8 text-[#0B6D76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              {
                title: "Scholarship Access",
                description: "Exclusive access to thousands of scholarships worth millions of dollars.",
                icon: (
                  <svg className="w-8 h-8 text-[#0B6D76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: "Fast Processing",
                description: "Streamlined application process with faster response times.",
                icon: (
                  <svg className="w-8 h-8 text-[#0B6D76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                title: "Visa Support",
                description: "Comprehensive visa guidance and documentation support.",
                icon: (
                  <svg className="w-8 h-8 text-[#0B6D76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              }
            ].map((item, index) => (
              <div key={index} className="text-center p-4">
                <div className="w-16 h-16 bg-[#E6F4F5] rounded-full flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#0B6D76] to-[#2D3959] rounded-xl shadow-lg p-8 my-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Educational Journey?</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">Get free personalized consultation from our education experts and take the first step toward your dream education.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="free-consultation" className="bg-white text-[#0B6D76] font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition">
              Free Consultation
            </Link>
            <button className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:bg-opacity-10 transition">
              Browse All Programs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;