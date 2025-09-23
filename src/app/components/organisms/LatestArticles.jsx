'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Container from '../atoms/Container';
import ArticleCard from '../molecules/ArticleCard';
import Button from '../atoms/Button';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const LatestArticles = ({ data }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    try {
      setLoading(true);

      if (data.success) {
        setArticles(data.data);
      } else {
        console.log(data.message);
        setError(data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [data]);

  // Featured article (first article or random)
  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const otherArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <section className="relative py-20 bg-gradient-to-br from-white to-gray-50 overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-[#0B6F78] rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#0a306b] rounded-full blur-3xl"></div>
      </div>

      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0B6F78 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <Container>
        {/* Enhanced Header Section */}
        <div className="text-center mb-16 relative z-10">
          
          <h3 className="font-bold text-4xl md:text-4xl lg:text-4xl text-gray-900 mb-4 leading-tight">
            Explore Our{' '}
            <span className="bg-gradient-to-r from-[#0B6F78] to-[#0a306b] bg-clip-text text-transparent">
              Latest Insights
            </span>
          </h3>
          
          <div className="w-32 h-1 bg-gradient-to-r from-[#0B6F78] to-[#0a306b] mx-auto mb-6 rounded-full"></div>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover cutting-edge research, expert opinions, and transformative educational content
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-[#0B6F78] to-[#0a306b] rounded-full animate-bounce"></div>
              <div className="w-6 h-6 bg-gradient-to-r from-[#0B6F78] to-[#0a306b] rounded-full animate-bounce delay-100"></div>
              <div className="w-6 h-6 bg-gradient-to-r from-[#0B6F78] to-[#0a306b] rounded-full animate-bounce delay-200"></div>
            </div>
            <p className="text-gray-500 text-lg mt-4">Loading insightful articles...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20 bg-red-50 rounded-2xl mx-auto max-w-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 text-lg font-medium">Error loading articles</p>
            <p className="text-gray-500 mt-2">{error}</p>
          </div>
        )}

        {/* Featured Article Section */}
        {!loading && !error && featuredArticle && (
          <div className="mb-16">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Image Section */}
                <div className="relative h-80 lg:h-full">
                  <img
                    src={featuredArticle.image || '/api/placeholder/600/400'}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-[#0B6F78] to-[#0a306b] text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Featured
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content Section */}
                <div className="p-8 lg:p-12">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="bg-[#0B6F78]/10 text-[#0B6F78] px-3 py-1 rounded-full text-sm font-medium">
                      {featuredArticle.category || 'Education'}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {new Date(featuredArticle.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {featuredArticle.title}
                  </h2>
                  
                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    {featuredArticle.excerpt || featuredArticle.content?.substring(0, 200) + '...'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#0B6F78] to-[#0a306b] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {featuredArticle.author?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{featuredArticle.author || 'Admin'}</p>
                        <p className="text-gray-500 text-sm">Author</p>
                      </div>
                    </div>
                    
                    <Link href={`/blog/${featuredArticle.slug}`}>
                      <button className="bg-gradient-to-r from-[#0B6F78] to-[#0a306b] text-white px-6 py-3 rounded-lg font-semibold hover:from-[#0a306b] hover:to-[#0B6F78] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl">
                        Read Full Article
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid/Swiper */}
        {!loading && !error && otherArticles.length > 0 && (
          <div className="relative">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">More Articles</h3>
                <p className="text-gray-600 mt-2">Explore our latest publications</p>
              </div>
              
              {/* Navigation for mobile swiper */}
              <div className="hidden md:flex space-x-3">
                <button className="more-articles-prev w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-[#0a306b] hover:bg-[#0a306b] hover:text-white transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="more-articles-next w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-[#0a306b] hover:bg-[#0a306b] hover:text-white transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Swiper for Articles */}
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              navigation={{
                nextEl: '.more-articles-next',
                prevEl: '.more-articles-prev',
              }}
              pagination={{
                clickable: true,
                el: '.articles-pagination',
              }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
              className="pb-12"
            >
              {otherArticles.map((article, index) => (
                <SwiperSlide key={index}>
                  <ArticleCard article={article} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Pagination */}
            <div className="articles-pagination flex justify-center space-x-2 mt-4"></div>
          </div>
        )}



        {/* Empty State */}
        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Articles Available</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We're currently working on new content. Check back soon for the latest articles and insights.
            </p>
          </div>
        )}
      </Container>

      <style jsx>{`
        .articles-pagination :global(.swiper-pagination-bullet) {
          width: 12px;
          height: 12px;
          background: #E5E7EB;
          opacity: 1;
          margin: 0 6px;
        }
        
        .articles-pagination :global(.swiper-pagination-bullet-active) {
          background: linear-gradient(135deg, #0B6F78, #0a306b);
          transform: scale(1.2);
        }
      `}</style>
    </section>
  );
};

export default LatestArticles;