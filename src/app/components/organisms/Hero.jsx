'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearch } from '../../context/SearchContext';
import { GraduationCap, BookOpen, Award, Search, Globe, ChevronDown } from 'lucide-react';

const Hero = () => {
  // Background states
  const [currentBackground, setCurrentBackground] = useState(0);
  const backgrounds = [
    "https://thumbs.dreamstime.com/b/ai-generator-image-show-world-famous-landmarks-drawings-popular-tourist-places-around-321908021.jpg",
    // "https://gocoolgroup.com/img/masthead/bg-min.png",
  ];

  // Search states
  const [type, setType] = useState('university');
  const [country, setCountry] = useState('All Country');
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const router = useRouter();
  const inputRef = useRef(null);
  const searchBarRef = useRef(null);
  const { selectedCountry, setSelectedCountry, selectedType, setSelectedType } = useSearch();

  // Background rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('/api/frontend/getcountries', {
          method: "POST"
        });
        if (!res.ok) throw new Error('Failed to fetch countries');
        const data = await res.json();
        if (data.success && data.data) {
          setCountries(data.data);
        } else {
          setCountries([]);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountries([]);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    setCountry(selectedCountry);
  }, [selectedCountry]);

  useEffect(() => {
    setType(selectedType);
  }, [selectedType]);

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!search.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/internal/search-suggestions?q=${encodeURIComponent(search)}&type=${type}&country=${country}`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
        setActiveIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [search, type, country]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (country && country !== 'All Country') params.append('country', country);
    if (search) params.append('q', search);

    router.push(`/search?${params.toString()}`);
  };

  const handleSuggestionClick = (value) => {
    setSearch(value);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        setSearch(suggestions[activeIndex]);
        setShowSuggestions(false);
        e.preventDefault();
      }
    }
  };

  const isFormValid = type !== 'university' || country !== 'All Country' || search.trim() !== '';

  return (
    <div className="relative">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32 md:pt-24 md:pb-40">
        {/* Animated Background Images */}
        {backgrounds.map((bg, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
              index === currentBackground ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={bg}
              alt="Study abroad background"
              className="object-center object-cover"
              fill
              priority={index === 0}
            />
          </div>
        ))}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(0,0,0,0.4)] via-[rgba(0,0,0,0.6)] to-[rgba(0,0,0,0.8)]"></div>

        {/* 🎓 Floating Educational Icons */}
        <div className="absolute top-20 left-5 md:left-10 z-10 animate-float hidden sm:block">
          <GraduationCap className="w-12 h-12 md:w-16 md:h-16 text-white opacity-80" />
        </div>
        <div className="absolute bottom-40 right-5 md:right-12 z-10 animate-float delay-1000 hidden sm:block">
          <BookOpen className="w-10 h-10 md:w-14 md:h-14 text-yellow-300 opacity-80" />
        </div>
        <div className="absolute top-1/3 right-1/4 z-10 animate-float delay-2000 hidden lg:block">
          <Award className="w-8 h-8 md:w-12 md:h-12 text-green-300 opacity-80" />
        </div>

        {/* Content */}
        <div className="relative z-20 text-center px-4 max-w-6xl mx-auto w-full">
          <div className="mb-6 animate-fade-in">
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Your Global Education Journey <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 block mt-2">Starts Here</span>
            </h1>
          </div>

          <p className="text-white text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8 md:mb-10 animate-fade-in delay-300">
            Discover your perfect program at one of our 500+ partner universities across 30 countries
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in delay-500 mb-10 md:mb-16">
            <Link href={"/institutions"} className="w-full sm:w-auto">
              <button className="w-full bg-[#0a306b] hover:bg-[#1f2a40] text-white text-base md:text-lg px-6 py-3 md:px-8 md:py-4 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
  Explore Universities
</button>
            </Link>
            <Link href={"/courses"} className="w-full sm:w-auto">
              <button className="w-full border-2 border-white text-white hover:bg-white hover:text-blue-900 text-base md:text-lg px-6 py-3 md:px-8 md:py-4 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 mt-4 sm:mt-0">
                Browse Courses
              </button>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10 animate-fade-in delay-700 mb-10">
            <div className="text-center">
              <div className="text-white text-2xl md:text-3xl font-bold">500+</div>
              <div className="text-blue-200 text-sm md:text-base">Universities</div>
            </div>
            <div className="text-center">
              <div className="text-white text-2xl md:text-3xl font-bold">30+</div>
              <div className="text-blue-200 text-sm md:text-base">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-white text-2xl md:text-3xl font-bold">10K+</div>
              <div className="text-blue-200 text-sm md:text-base">Courses</div>
            </div>
          </div>
        </div>
        
        {/* SearchBar Overlay */}
        <div className="absolute z-30 left-1/2 w-full max-w-4xl transform -translate-x-1/2 bottom-8 md:bottom-16 px-4">
          <div 
            ref={searchBarRef}
            className={`bg-white rounded-2xl shadow-xl transition-all duration-300 ${isFocused ? 'ring-2 ring-blue-500 shadow-2xl' : ''}`}
          >
            <form onSubmit={handleSearch} className="w-full flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0 p-4 md:p-2">
              {/* Type Dropdown - Hidden on mobile until expanded */}
              <div className={`w-full md:w-[22%] relative transition-all duration-300 ${isSearchExpanded ? 'block' : 'hidden md:block'}`}>
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-3 md:py-4 pl-4 pr-10 rounded-xl text-sm md:text-base text-gray-800 appearance-none shadow-sm transition-all"
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      setSelectedType(e.target.value);
                    }}
                  >
                    <option value="university">Universities</option>
                    <option value="course">Courses</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Divider - Hidden on mobile */}
              <div className="hidden md:block h-10 w-px bg-gray-300 mx-2"></div>

              {/* Country Dropdown - Hidden on mobile until expanded */}
              <div className={`w-full md:w-[22%] relative transition-all duration-300 ${isSearchExpanded ? 'block' : 'hidden md:block'}`}>
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-3 md:py-4 pl-4 pr-10 rounded-xl text-sm md:text-base text-gray-800 appearance-none shadow-sm transition-all"
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setSelectedCountry(e.target.value);
                    }}
                  >
                    <option value="All Country">All Countries</option>
                    {Array.isArray(countries) && countries.map((countryItem, index) => (
                      <option key={index} value={countryItem.country}>
                        {countryItem.country}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <Globe className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Divider - Hidden on mobile */}
              <div className="hidden md:block h-10 w-px bg-gray-300 mx-2"></div>

              {/* Search Input */}
              <div className="w-full md:w-[38%] relative flex-grow">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    ref={inputRef}
                    placeholder="Search University, Course, or Country"
                    className="w-full border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-3 md:py-4 pl-10 pr-10 rounded-xl text-sm md:text-base text-gray-800 shadow-sm transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => {
                      setShowSuggestions(true);
                      setIsFocused(true);
                      setIsSearchExpanded(true);
                    }}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown}
                  />
                  {search && (
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setSearch('')}
                    >
                      <svg className="h-4 w-4 md:h-5 md:w-5 text-gray-400 hover:text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <ul className="max-h-60 overflow-y-auto py-1">
                      {suggestions.map((item, index) => (
                        <li
                          key={index}
                          className={`px-4 py-3 cursor-pointer hover:bg-blue-50 text-sm md:text-base text-gray-800 transition-colors ${
                            index === activeIndex ? 'bg-blue-50' : ''
                          }`}
                          onMouseDown={() => handleSuggestionClick(item)}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <div className="w-full md:w-[18%] mt-2 md:mt-0">
                <button 
                  type="submit" 
                  className="w-full bg-[#0a306b] m-1 hover:bg-blue-700 text-white py-3 md:py-4 rounded-xl text-sm md:text-base font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Search</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 1s ease-in-out forwards;
        }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
      `}</style>
    </div>
  );
};

export default Hero;