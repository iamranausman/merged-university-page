'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HiMenu, HiX, HiChevronDown, HiChevronRight } from 'react-icons/hi';
import { FaUserCircle, FaHeart, FaUser, FaSignOutAlt, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaEnvelope } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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
  const { data: session } = useSession();
  const router = useRouter();
  const { wishlist, fetchWishlist } = useWishlist();
  const [showWishlist, setShowWishlist] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [touchDevice, setTouchDevice] = useState(false);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState(null);
  const mobileMenuRef = useRef(null);

  const { user, fetchUser, logout, isLoggedIn } = useUserStore();

  useEffect(() => {
    if (!isLoggedIn) {
      fetchUser();
    }
  }, [isLoggedIn]);

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
    <header className="relative z-50 font-sans">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#005F5A] via-[#005F5A] to-[#E4EFF0] text-white py-2 text-sm">

        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-2 md:mb-0">
              <a href="mailto:info@universitiespage.com" className="flex items-center hover:text-teal-200 transition-colors">
                <FaEnvelope className="mr-1" />
                <span>info@universitiespage.com</span>
              </a>
              <span className="hidden md:inline">|</span>
              <Link href="/feedback" className="hover:text-teal-200 transition-colors">
                Give Feedback
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline">Follow us:</span>
             <div className="flex space-x-3">
  {/* Facebook */}
  <a 
    href="https://www.facebook.com/universitiespagelahore" 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-6 h-6 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-80 transition"
  >
    <FaFacebookF className="w-4 h-4" />
  </a>

  {/* Twitter (X) */}
  <a 
    href="https://twitter.com/UniversitiesPa1" 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-6 h-6 flex items-center justify-center rounded-full bg-[#1DA1F2] text-white hover:opacity-80 transition"
  >
    <FaTwitter className="w-4 h-4" />
  </a>

  {/* Instagram (gradient look with fallback color) */}
  <a 
    href="https://www.instagram.com/universitiespage_official/" 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white hover:opacity-80 transition"
  >
    <FaInstagram className="w-4 h-4" />
  </a>

  {/* LinkedIn */}
  <a 
    href="https://linkedin.com/in/universities-page-4728301b5" 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-6 h-6 flex items-center justify-center rounded-full bg-[#0077B5] text-white hover:opacity-80 transition"
  >
    <FaLinkedinIn className="w-4 h-4" />
  </a>
</div>

            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4 text-sm">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="text-2xl font-bold text-blue-900">UniversitiesPage</div>
            </div>

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
                        className="flex items-center text-gray-700 hover:text-teal-600 transition-colors px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
                      >
                        {category.name}
                        <HiChevronDown className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={category.href}
                      className="text-gray-700 hover:text-teal-600 transition-colors px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 block"
                    >
                      {category.name}
                    </Link>
                  )}
                  
                  {category.hasDropdown && activeCategory === category.name && (
                    <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 dropdown-menu py-2">
                      {category.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
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
              <div className="relative wishlist-dropdown">
                <button 
                  onClick={async () => {
                    if (!wishlistLoaded && isLoggedIn) {
                      await fetchWishlist();
                      setWishlistLoaded(true);
                    }
                    setShowWishlist(v => !v);
                  }}
                  className="flex items-center text-gray-600 hover:text-teal-600 transition-colors relative p-2"
                >
                  <FaHeart className="text-lg mr-1" />
                  <span className="text-sm font-medium">Wishlist</span>
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {wishlist.length}
                    </span>
                  )}
                </button>
                {showWishlist && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
                    <div className="font-semibold text-gray-800 mb-3">Wishlist ({wishlist.length})</div>
                    {wishlist.length === 0 ? (
                      <div className="text-gray-500 text-sm py-4 text-center">No items in your wishlist</div>
                    ) : (
                      <>
                        <ul className="max-h-60 overflow-y-auto divide-y divide-gray-100 mb-3">
                          {wishlist.slice(0, 5).map((item, idx) => (
                            <li key={item.key || idx} className="py-3 flex items-start gap-3">
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
                          className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition text-sm font-medium"
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
                      <button className="border border-teal-600 text-teal-600 text-center p-1.5 rounded-md font-medium">
                        Student Login
                      </button>
                    </Link>
                    <Link href="/consultant-register">
                      <button className="text-sm bg-teal-600 text-white hover:bg-teal-700 font-medium px-4 py-1.5 rounded-md transition-colors">
                        Consultant
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <FaUserCircle className="text-teal-600 text-xl" />
                      <span className="text-sm font-medium text-gray-700 max-w-xs truncate" style={{maxWidth: '120px'}}>
                        {user?.name}
                      </span>
                      <HiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 animate-fade-in">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-800">Welcome back</p>
                          <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                        </div>
                        
                        {user?.role !== 'admin' && (
                          <button
                            onClick={handleDashboard}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 transition-colors"
                          >
                            <FaUser className="text-gray-500" />
                            Dashboard
                          </button>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
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

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <HiMenu className="w-6 h-6" />
          </button>
          
          <Link href="/" onClick={() => setIsOpen(false)}>
            <div className="flex-shrink-0">
              <div className="text-xl font-bold text-blue-900">UniversitiesPage</div>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
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
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-md z-50 px-4 py-3">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-800">Signed in as</p>
              <p className="text-sm text-gray-600 truncate">{user?.email}</p>
            </div>
            <div className="flex flex-col space-y-2">
              {user?.role !== 'admin' && (
                <button
                  onClick={handleDashboard}
                  className="text-left py-2 px-3 text-sm text-gray-700 rounded-md hover:bg-gray-100"
                >
                  Dashboard
                </button>
              )}
              <button
                onClick={handleLogout}
                className="text-left py-2 px-3 text-sm text-red-600 rounded-md hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sidebar */}
      <div 
        ref={mobileMenuRef}
        className={`lg:hidden fixed inset-0 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}></div>
        <div className="relative w-80 h-full bg-white overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="text-xl font-bold text-blue-900">StudyAbroad</div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            {!isLoggedIn ? (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Sign in to access your account</p>
                <div className="flex flex-col gap-2">
                  <Link 
                    href="/student-login" 
                    onClick={() => setIsOpen(false)}
                    className="bg-teal-600 text-white text-center py-2.5 rounded-md font-medium"
                  >
                    Student Login
                  </Link>
                  <Link 
                    href="/consultant-register" 
                    onClick={() => setIsOpen(false)}
                    className="border border-teal-600 text-teal-600 text-center py-2.5 rounded-md font-medium"
                  >
                    Consultant Register
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-600 truncate">{user?.email}</p>
              </div>
            )}

            <nav className="space-y-1">
              {navCategories.map((category) => (
                <div key={category.name}>
                  {category.hasDropdown ? (
                    <>
                      <button
                        onClick={() => setMobileSubmenu(mobileSubmenu === category.name ? null : category.name)}
                        className="flex items-center justify-between w-full py-3 px-3 text-gray-700 hover:bg-gray-50 rounded-md text-left font-medium"
                      >
                        <span>{category.name}</span>
                        <HiChevronRight className={`w-4 h-4 transition-transform ${mobileSubmenu === category.name ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {mobileSubmenu === category.name && (
                        <div className="pl-6 mt-1 space-y-1">
                          {category.items.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => {
                                setIsOpen(false);
                                setMobileSubmenu(null);
                              }}
                              className="block py-2.5 px-3 text-gray-600 hover:bg-gray-50 rounded-md text-sm"
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
                      className="block py-3 px-3 text-gray-700 hover:bg-gray-50 rounded-md font-medium"
                    >
                      {category.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link 
                href="/wishlist" 
                onClick={() => setIsOpen(false)}
                className="flex items-center py-2.5 px-3 text-gray-700 hover:bg-gray-50 rounded-md font-medium"
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
                      className="flex items-center w-full py-2.5 px-3 text-gray-700 hover:bg-gray-50 rounded-md text-left font-medium"
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
                    className="flex items-center w-full py-2.5 px-3 text-red-600 hover:bg-red-50 rounded-md text-left font-medium"
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
    </header>
  );
};

export default Header;