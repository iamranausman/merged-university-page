'use client';
import React, { useState, useEffect, useRef } from 'react';
import Button from '../atoms/Button';
import Container from '../atoms/Container';
import { useRouter } from 'next/navigation';
import { useSearch } from '../../context/SearchContext';

const SearchBar = () => {
  const [type, setType] = useState('university');
  const [country, setCountry] = useState('All Country');
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const router = useRouter();
  const inputRef = useRef(null);
  const searchBarRef = useRef(null);

  const { selectedCountry, setSelectedCountry, selectedType, setSelectedType } = useSearch();

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
    <Container>
      <div 
        ref={searchBarRef}
        className={`bg-white rounded-2xl shadow-xl py-6 px-6 flex justify-center transition-all duration-300 ${isFocused ? 'ring-2 ring-blue-500 shadow-2xl' : ''}`}
      >
        <form onSubmit={handleSearch} className="w-full flex flex-col md:flex-row items-center gap-4 md:gap-5">
          {/* Type Dropdown */}
          <div className="w-full md:w-[22%] relative">
            <label className="block text-sm font-medium text-gray-700 mb-2 ml-4">Search For</label>
            <div className="relative">
              <select
                className="w-full border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-4 pl-4 pr-10 rounded-xl text-base text-gray-800 appearance-none shadow-sm transition-all"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setSelectedType(e.target.value);
                }}
              >
                <option value="university">Universities</option>
                <option value="course">Courses</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 pt-4">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Country Dropdown */}
          <div className="w-full md:w-[22%] relative">
            <label className="block text-sm font-medium text-gray-700 mb-2 ml-4">Select Country</label>
            <div className="relative">
              <select
                className="w-full border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-4 pl-4 pr-10 rounded-xl text-base text-gray-800 appearance-none shadow-sm transition-all"
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
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 pt-4">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-[38%] relative">
            <label className="block text-sm font-medium text-gray-700 mb-2 ml-4">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none pt-2">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                ref={inputRef}
                placeholder="Search University, Course, or Country"
                className="w-full border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-4 pl-12 pr-4 rounded-xl text-base text-gray-800 shadow-sm transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => {
                  setShowSuggestions(true);
                  setIsFocused(true);
                }}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
              />
              {search && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center pt-2"
                  onClick={() => setSearch('')}
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
                      className={`px-4 py-3 cursor-pointer hover:bg-blue-50 text-base text-gray-800 transition-colors ${
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
          <div className="w-full md:w-[18%] flex items-end mt-2 md:mt-0 mt-20">
            <Button 
              type="submit" 
              className="w-full py-4 rounded-xl text-base font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Search</span>
                  <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default SearchBar;