'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HiMenu, HiX, HiChevronDown, HiChevronRight } from 'react-icons/hi';
import { FaUserCircle, FaHeart, FaUser, FaSignOutAlt, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaEnvelope } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useWishlist } from '../../context/WishlistContext';
import { useUserStore } from '../../../store/useUserStore';
import Swal from 'sweetalert2';

const navCategories = [
  {
    name: 'Home',
    href: '/',
    hasDropdown: false
  },
  {
    name: 'Study Abroad',
    hasDropdown: true,
    href: '/study-abroad',
    items: [
      { name: 'Guides', href: '/guides' },
      { name: 'Universities', href: '/institutions' },
      { name: 'Courses', href: '/courses' },
      { name: 'Articles', href: '/blog' }
    ]
  },
  {
    name: 'Services',
    hasDropdown: true,
    href: '/services',
    items: [
      { name: 'our Services', href: '/services' },
      { name: 'Visit Visa', href: '/visit-visa' },
      { name: 'Free Consultation', href: '/free-consultation' },
      { name: 'Track Application', href: '/track-application' },
      { name: 'Discount Offer', href: '/discount-offer' }
    ]
  },
  {
    name: 'Apply',
    hasDropdown: true,
    href: '/apply',
    items: [
      { name: 'Apply Online', href: '/apply-online' },
      { name: 'Job Opportunities', href: '/jobs' }
    ]
  },
  {
    name: 'Support',
    hasDropdown: true,
    href: '/support',
    items: [
      { name: 'Student Support Documents', href: '/student-support-documents' },
      { name: 'Complaint', href: '/complaint' }
    ]
  },
  {
    name: 'About',
    hasDropdown: true,
    href: '/about',
    items: [
      { name: 'About Us', href: '/aboutus' },
      { name: 'Our Team', href: '/ourteam' },
      { name: 'Contact Us', href: '/contact-us' }
    ]
  },
  {
    name: 'Tools',
    hasDropdown: true,
    href: '/tools',
    items: [
      { name: 'Compare Universities & Courses', href: '/comparison' },
      { name: 'AI CV Analysis Tool', href: '/cv-analysis' }
    ]
  },
  {
    name: 'Minhaj University',
    href: '/minhaj-university-lahore',
    hasDropdown: false
  },
  {
    name: 'Search',
    href: '/search',
    hasDropdown: false
  }
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const { wishlist, fetchWishlist } = useWishlist();
  const [showWishlist, setShowWishlist] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [touchDevice, setTouchDevice] = useState(false);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef(null);
  const headerRef = useRef(null);

  const { user, fetchUser, logout, isLoggedIn } = useUserStore();

  useEffect(() => {
    if (!isLoggedIn) {
      fetchUser();
    }
  }, [isLoggedIn]);

  // Scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when clicking outside
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsOpen(false);
        setMobileSubmenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    const response = await fetch("/api/frontend/logout", {
      method: "POST"
    })

    const data = await response.json();

    if(!response.ok){
      throw new Error(data.message)
    }

    logout()
    setShowMenu(false);
    setIsOpen(false);

    Swal.fire(
      'Logged Out!',
      'You have been logged out successfully.',
      'success'
    ).then(() => {
      router.push('/');
    })
  };

  const handleDashboard = () => {
    if(user?.role === "admin") {
      router.push("/admin")
    } else if( user?.role === "student") {
      router.push("/dashboard")
    } else if( user?.role === "consultant") {
      router.push("/consultant-dashboard")
    }
    
    setShowMenu(false);
    setIsOpen(false);
  };

  useEffect(() => {
    setTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }, [isOpen]);

  useEffect(() => {
    if (!showWishlist) return;
    const handler = (e) => {
      if (!e.target.closest('.wishlist-dropdown')) setShowWishlist(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showWishlist]);

  useEffect(() => {
    if (!activeCategory || touchDevice) return;
    const handler = (e) => {
      if (!e.target.closest('.dropdown-menu')) setActiveCategory(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeCategory, touchDevice]);

  const handleCategoryClick = (category) => {
    if (touchDevice) {
      setActiveCategory(activeCategory === category.name ? null : category.name);
    }
  };

  return (
    <header className="relative z-50 font-sans" ref={headerRef}>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#0B6F78] to-[#0a306b] text-white py-2 text-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-2 md:mb-0">
              <a href="mailto:info@universitiespage.com" className="flex items-center hover:text-gray-200 transition-colors">
                <FaEnvelope className="mr-2 text-sm" />
                <span>info@universitiespage.com</span>
              </a>
              <span className="hidden md:inline text-white/50">|</span>
              <Link href="/feedback" className="hover:text-gray-200 transition-colors">
                Give Feedback
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="hidden md:inline text-white/80">Follow us:</span>
              <div className="flex space-x-2">
                {/* Facebook */}
                <a 
                  href="https://www.facebook.com/universitiespagelahore" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-300"
                >
                  <FaFacebookF className="w-3 h-3" />
                </a>

                {/* Twitter (X) */}
                <a 
                  href="https://twitter.com/UniversitiesPa1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-300"
                >
                  <FaTwitter className="w-3 h-3" />
                </a>

                {/* Instagram */}
                <a 
                  href="https://www.instagram.com/universitiespage_official/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-300"
                >
                  <FaInstagram className="w-3 h-3" />
                </a>

                {/* LinkedIn */}
                <a 
                  href="https://linkedin.com/in/universities-page-4728301b5" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-300"
                >
                  <FaLinkedinIn className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className={`hidden lg:block bg-white shadow-sm border-b border-gray-100 transition-all duration-300 ${isScrolled ? 'sticky top-0 shadow-lg' : ''}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#0B6F78] to-[#0a306b] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">UP</span>
                </div>
                <div className="text-1xl font-bold text-[#0a306b]">UniversitiesPage</div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-1">
              {navCategories.map((category) => (
                <div 
                  key={category.name} 
                  className="relative group"
                  onMouseEnter={() => setActiveCategory(category.name)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  {category.hasDropdown ? (
                    <div className="flex items-center">
                      <Link
                        href={category.href}
                        className="flex items-center text-gray-700 hover:text-[#0B6F78] transition-colors px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 group"
                      >
                        {category.name}
                        <HiChevronDown className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform duration-200" />
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={category.href}
                      className="text-gray-700 hover:text-[#0B6F78] transition-colors px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 block"
                    >
                      {category.name}
                    </Link>
                  )}
                  
                  {category.hasDropdown && activeCategory === category.name && (
                    <div className="absolute left-0 top-full w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 dropdown-menu py-2 animate-fade-in">
                      {category.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#0B6F78]/5 hover:text-[#0B6F78] transition-colors border-b border-gray-100 last:border-b-0"
                          onClick={() => setActiveCategory(null)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Wishlist */}
              <div className="relative wishlist-dropdown">
                <button 
                  onClick={async () => {
                    if (!wishlistLoaded && isLoggedIn) {
                      await fetchWishlist();
                      setWishlistLoaded(true);
                    }
                    setShowWishlist(v => !v);
                  }}
                  className="flex items-center text-gray-600 hover:text-[#0B6F78] transition-colors relative p-2 rounded-lg hover:bg-gray-50 group"
                >
                  <FaHeart className="text-lg mr-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Wishlist</span>
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {wishlist.length}
                    </span>
                  )}
                </button>
                {showWishlist && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-4 animate-fade-in">
                    <div className="font-semibold text-gray-800 mb-3 text-lg">My Wishlist ({wishlist.length})</div>
                    {wishlist.length === 0 ? (
                      <div className="text-gray-500 text-sm py-6 text-center">No items in your wishlist yet</div>
                    ) : (
                      <>
                        <ul className="max-h-60 overflow-y-auto divide-y divide-gray-100 mb-4">
                          {wishlist.slice(0, 5).map((item, idx) => (
                            <li key={item.key || idx} className="py-3 flex items-start gap-3 hover:bg-gray-50 rounded-lg px-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 text-sm truncate">
                                  {item.title || item.name || 'Unnamed Item'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {item.label || (item.course_id ? 'Course' : 'University')}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <button
                          className="w-full bg-gradient-to-r from-[#0B6F78] to-[#0a306b] text-white py-2.5 rounded-lg hover:from-[#0a306b] hover:to-[#0B6F78] transition-all duration-300 text-sm font-semibold"
                          onClick={() => { setShowWishlist(false); router.push('/wishlist'); }}
                        >
                          View All Wishlist Items
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* User Menu */}
              <div className="relative">
                {!isLoggedIn ? (
                  <div className="flex items-center gap-3">
                    <Link href="/student-login">
                      <button className="border border-[#0B6F78] text-[#0B6F78] hover:bg-[#0B6F78] hover:text-white text-center px-4 py-2 rounded-lg font-medium transition-all duration-300">
                        Student Login
                      </button>
                    </Link>
                    <Link href="/consultant-register">
                      <button className="bg-gradient-to-r from-[#0B6F78] to-[#0a306b] text-white hover:from-[#0a306b] hover:to-[#0B6F78] font-medium px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
                        Consultant
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-[#0B6F78] transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <FaUserCircle className="text-[#0B6F78] text-xl" />
                      <span className="text-sm font-medium text-gray-700 max-w-xs truncate" style={{maxWidth: '120px'}}>
                        {user?.name}
                      </span>
                      <HiChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2 animate-fade-in">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#0B6F78]/5 to-[#0a306b]/5">
                          <p className="text-sm font-semibold text-gray-800">Welcome back</p>
                          <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                        </div>
                        
                        {user?.role !== 'admin' && (
                          <button
                            onClick={handleDashboard}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-[#0B6F78]/5 hover:text-[#0B6F78] transition-colors duration-200"
                          >
                            <FaUser className="text-gray-500" />
                            Dashboard
                          </button>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 border-t border-gray-100"
                        >
                          <FaSignOutAlt />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header - Enhanced Sticky */}
      <div className={`lg:hidden bg-white border-b border-gray-200 transition-all duration-300 ${isScrolled ? 'sticky top-0 shadow-lg z-40' : 'sticky top-0 z-40'}`}>
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            <HiMenu className="w-6 h-6" />
          </button>
          
          <Link href="/" onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#0B6F78] to-[#0a306b] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">UP</span>
              </div>
              <div className="text-lg font-bold text-[#0a306b]">UniversitiesPage</div>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            {/* Mobile Wishlist */}
            {isLoggedIn && wishlist.length > 0 && (
              <Link href="/wishlist" className="relative p-2">
                <FaHeart className="w-5 h-5 text-red-500" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                  {wishlist.length}
                </span>
              </Link>
            )}
            
            {isLoggedIn && (
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-700"
              >
                <FaUserCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile user menu dropdown */}
        {showMenu && isLoggedIn && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 px-4 py-3 animate-fade-in">
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-800">Signed in as</p>
              <p className="text-sm text-gray-600 truncate">{user?.email}</p>
            </div>
            <div className="flex flex-col space-y-2">
              {user?.role !== 'admin' && (
                <button
                  onClick={handleDashboard}
                  className="text-left py-2 px-3 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Dashboard
                </button>
              )}
              <button
                onClick={handleLogout}
                className="text-left py-2 px-3 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sidebar - Enhanced */}
      <div 
        ref={mobileMenuRef}
        className={`lg:hidden fixed inset-0 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}
      >
        <div className="absolute inset-0 bg-black/20" onClick={() => setIsOpen(false)}></div>
        <div className="relative w-80 h-full bg-white overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#0B6F78] to-[#0a306b] text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">UP</span>
              </div>
              <div className="text-lg font-bold">UniversitiesPage</div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {!isLoggedIn ? (
              <div className="mb-6 bg-gradient-to-r from-[#0B6F78]/5 to-[#0a306b]/5 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-3">Sign in to access your account</p>
                <div className="flex flex-col gap-2">
                  <Link 
                    href="/student-login" 
                    onClick={() => setIsOpen(false)}
                    className="bg-gradient-to-r from-[#0B6F78] to-[#0a306b] text-white text-center py-3 rounded-lg font-semibold transition-all duration-300"
                  >
                    Student Login
                  </Link>
                  <Link 
                    href="/consultant-register" 
                    onClick={() => setIsOpen(false)}
                    className="border border-[#0B6F78] text-[#0B6F78] text-center py-3 rounded-lg font-semibold transition-all duration-300"
                  >
                    Consultant Register
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gradient-to-r from-[#0B6F78]/5 to-[#0a306b]/5 rounded-xl">
                <p className="font-semibold text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-600 truncate">{user?.email}</p>
              </div>
            )}

            {/* Navigation */}
            <nav className="space-y-1">
              {navCategories.map((category) => (
                <div key={category.name}>
                  {category.hasDropdown ? (
                    <>
                      <button
                        onClick={() => setMobileSubmenu(mobileSubmenu === category.name ? null : category.name)}
                        className="flex items-center justify-between w-full py-3 px-3 text-gray-700 hover:bg-gray-50 rounded-lg text-left font-semibold transition-colors duration-200"
                      >
                        <span>{category.name}</span>
                        <HiChevronRight className={`w-4 h-4 transition-transform duration-200 ${mobileSubmenu === category.name ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {mobileSubmenu === category.name && (
                        <div className="pl-6 mt-1 space-y-1 animate-fade-in">
                          {category.items.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => {
                                setIsOpen(false);
                                setMobileSubmenu(null);
                              }}
                              className="block py-2.5 px-3 text-gray-600 hover:bg-gray-50 rounded-md text-sm transition-colors duration-200"
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={category.href}
                      onClick={() => setIsOpen(false)}
                      className="block py-3 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors duration-200"
                    >
                      {category.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Additional Links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link 
                href="/wishlist" 
                onClick={() => setIsOpen(false)}
                className="flex items-center py-2.5 px-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors duration-200 mb-2"
              >
                <FaHeart className="text-red-500 mr-3" />
                Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
              </Link>
              
              {isLoggedIn && (
                <>
                  {user?.role !== 'admin' && (
                    <button
                      onClick={() => {
                        handleDashboard();
                        setIsOpen(false);
                      }}
                      className="flex items-center w-full py-2.5 px-3 text-gray-700 hover:bg-gray-50 rounded-lg text-left font-semibold transition-colors duration-200"
                    >
                      <FaUser className="text-gray-500 mr-3" />
                      Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center w-full py-2.5 px-3 text-red-600 hover:bg-red-50 rounded-lg text-left font-semibold transition-colors duration-200 mt-2"
                  >
                    <FaSignOutAlt className="mr-3" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Header;