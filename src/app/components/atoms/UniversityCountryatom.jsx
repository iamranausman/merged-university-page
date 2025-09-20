'use client';
import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Heading from '../atoms/Heading';
import Link from 'next/link';
import 'swiper/css';
import Image from 'next/image';

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

const UniversityCountryatom = ({
  data = [],
  heading = 'Search By Country',
  viewType = 'grid', // 'grid' or 'swiper'
  columns = 4,
  limit = 0,
  imageSize = { width: 40, height: 30 },
  cardPadding = 'px-4 py-2',
  cardRounded = 'rounded-full',
  imageRounded = 'rounded',
  showDiscountBadge = false,
  showBottomSpace = true,
  customBottomSpaceClass = '',
  linkType = 'visit-visa-detail',
  autoplay = false,
}) => {
  const [selectedContinent, setSelectedContinent] = useState("All");

  console.log(data,"kasao ho ")
  // Define grid columns mapping
  const gridCols = {
    1: 'grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
  }[columns] || 'lg:grid-cols-4';

  // Get unique continents from data
  const availableContinents = Array.from(
    new Set(data.map(item => item.continent))
  ).filter(Boolean);


  // Add "All" option with count
  const continentOptions = [
    { 
      name: "All", 
    },

    ...availableContinents.map(continent => ({
      name: continent,
      count: data.filter(item => item.continent === continent).length
    }))
  ];

  // Filter data by continent
  const filteredData = selectedContinent === 'All' 
    ? data 
    : data.filter(item => item.continent === selectedContinent);

  const limitedData = limit > 0 ? filteredData.slice(0, limit) : filteredData;
  const bottomSpaceClass = showBottomSpace
    ? customBottomSpaceClass || 'mb-10'
    : '';

  const renderUniversityCard = (university, index) => {
    const universityName = university.name
      ? university.name.replace(/\s*\([^)]*\)/, '').trim()
      : '';
    const slug = slugify(universityName) + '-visit-visa';
    const cleanName = universityName.replace(/\s*\([^)]*\)/, '').trim();
    const searchUrl = `/search?type=university&country=${encodeURIComponent(cleanName)}`;

    return (
      <Link
        key={index}
        href={linkType === 'search' ? searchUrl : `/visit-visa-detail/${slug}`}
        className="block"
      >
        <div
          className={`${cardRounded} shadow-sm bg-white ${cardPadding} transition-all cursor-pointer flex items-center gap-3 border border-gray-300 group hover:shadow-md w-50`}
        >
          {/* University Image/Logo */}
          <div className={`w-14 h-10 mt-1 overflow-hidden ${imageRounded}`}>
            
          </div>

          {/* University Name */}
          <h4 className="text-base font-semibold text-gray-800 group-hover:text-red-600 truncate">
            {university.name}
          </h4>
        </div>
      </Link>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <Heading level={2} className="text-4xl font-bold text-gray-900 mb-2">
          {heading}
        </Heading>
        <p className="text-gray-600 text-sm">
          Explore universities by continent to find your ideal education destination
        </p>
      </div>

      {/* Continent Filter */}
      <div className="flex flex-wrap rounded-[50px] w-full max-w-[100%] bg-gray-100 p-4 gap-3 mb-10">
        {continentOptions.map((continent) => (
          <button
            key={continent.name}
            onClick={() => setSelectedContinent(continent.name)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              selectedContinent === continent.name
                ? "bg-gray-400 text-white"
                : "bg-white text-gray-700 hover:bg-red-50 border-gray-300"
            }`}
          >
            {continent.name} 
          </button>
        ))}
      </div>

      {/* Content */}
      {viewType === 'swiper' ? (
        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: columns > 4 ? columns : 4 },
          }}
          autoplay={autoplay ? { delay: 2500 } : false}
        >
          {limitedData.map((university, index) => (
            <SwiperSlide key={index} className="!h-auto">
              {renderUniversityCard(university, index)}
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className={`grid ${gridCols} sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`}>
          {limitedData.map((university, index) => (
            <React.Fragment key={index}>
              {renderUniversityCard(university, index)}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Empty State */}
      {limitedData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No universities available</div>
          <p className="text-gray-400">
            Universities will appear here once they are added to the system.
          </p>
        </div>
      )}
    </div>
  );
};

export default UniversityCountryatom;
