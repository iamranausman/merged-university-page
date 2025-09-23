'use client';
import { useState } from 'react';
import Container from "../atoms/Container";
import FooterMolecule from "../molecules/FooterMolecule";
import { SocialIcons } from "../molecules/SocialIcons";
import Link from 'next/link';
import Image from 'next/image';
import Button from '../atoms/Button';
import Swal from 'sweetalert2';
import { FiMapPin, FiPhone, FiMail, FiClock, FiArrowRight } from 'react-icons/fi';

const FooterOrganism = () => {
  const addresses = [
    {
      city: 'Lahore',
      address: 'Universities Page, 2nd Floor faisal bank, Raja Market, Garden town, Lahore, Pakistan',
      phones: ['0324 3640038', '0333 0033235', '0310 3162004'],
      emails: []
    },
    {
      city: 'Islamabad',
      address: 'Universities Page, Punjab market, Venus Plaza, 1st Floor, Office No. 1, Sector G13/4, Islamabad',
      phones: ['0335 9990308', '0310 3172004', '0300 4010286'],
      emails: []
    },
    {
      city: 'Karachi',
      address: 'Universities Page, 1st floor, Amber Estate, Shahrah-e-Faisal Rd, Bangalore Town Block A Shah, Karachi, Sindh',
      phones: ['0310 6225430', '0310 6225408', '0310 6225410'],
      emails: []
    },
    {
      city: 'Thailand',
      address: '70 Young Pl Alley, Khwaeng Khlong Toei Nuea, Watthana, Krung Thep Maha Nakhon, Thailand',
      phones: [],
      emails: ['Thailand@universitiespage.com']
    },
    {
      city: 'China',
      address: 'Universities Page, East road of Madian plaza, Hai Dian District, Beijing, China',
      phones: [],
      emails: []
    }
  ];

  const [selectedCity, setSelectedCity] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim()) {
      Swal.fire("Error", "Please enter a valid email.", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/frontend/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire("Subscribed!", "You have successfully subscribed.", "success");
        setEmail("");
      } else {
        Swal.fire("Error", data.error || "Something went wrong.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Unable to subscribe. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-gray-50 to-white pt-32 mt-60 border-t border-gray-100">
      {/* Newsletter Card - Enhanced Overlapping Section */}
      <div className="absolute -top-55 left-1/2 transform -translate-x-1/2 w-[95%] md:w-[85%] lg:w-[75%] xl:w-[65%] mb-16">
        <div className="bg-gradient-to-r from-[#0B6F78] to-[#0a306b] rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 2px, transparent 0)`,
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          
          {/* Content */}
          <div className="flex-1 text-center lg:text-left relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              STAY CONNECTED
            </h3>
            <p className="text-white/90 text-lg mb-6 max-w-2xl">
              Receive the latest university updates, scholarship opportunities, and visa guidance directly in your inbox.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 max-w-md lg:max-w-full">
              <div className="relative flex-1 w-full">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 pl-12 rounded-xl border-0 text-gray-900 text-base focus:outline-none focus:ring-4 focus:ring-white/20 bg-white/95 backdrop-blur-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                />
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              </div>
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="bg-white text-[#0a306b] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center gap-2 min-w-[160px] justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#0a306b] border-t-transparent rounded-full animate-spin"></div>
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe
                    <FiArrowRight className="text-lg" />
                  </>
                )}
              </button>
            </div>
            
            <p className="text-white/70 text-xs mt-4">No spam ever. Unsubscribe anytime with one click.</p>
          </div>
          
          {/* Illustration */}
          <div className="hidden lg:block flex-shrink-0 relative z-10">
            <div className="rounded-2xl overflow-hidden p-6 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20">
              <Image
                src="/assets/newsletter_img.png"
                alt="Newsletter illustration"
                width={180}
                height={180}
                className="object-contain filter"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Main Content */}
      <Container>
        <div className="px-4 sm:px-6 py-16 space-y-16">
          {/* Top Section - Enhanced Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#0B6F78] to-[#0a306b] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">UP</span>
                </div>
                <div className="text-2xl font-bold text-[#0a306b]">Universities Page</div>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                Your premier partner in global education. We empower students to achieve international academic success through expert guidance and comprehensive support.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-[#0B6F78]/10 rounded-lg flex items-center justify-center">
                    <FiPhone className="text-[#0B6F78] text-sm" />
                  </div>
                  <span className="font-medium">+92 123 456 7890</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-[#0B6F78]/10 rounded-lg flex items-center justify-center">
                    <FiMail className="text-[#0B6F78] text-sm" />
                  </div>
                  <span className="font-medium">info@universitiespage.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-[#0B6F78]/10 rounded-lg flex items-center justify-center">
                    <FiClock className="text-[#0B6F78] text-sm" />
                  </div>
                  <span className="font-medium">Mon-Fri: 9AM - 6PM</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-[#0a306b] border-l-4 border-[#0B6F78] pl-3">Quick Links</h4>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { href: "/CountriesGuide", label: "Country Guides" },
                  { href: "/universities", label: "Universities" },
                  { href: "/courses", label: "Courses" },
                  { href: "/blogs", label: "Articles & Blog" },
                  { href: "/services", label: "Our Services" },
                  { href: "/visit-visa", label: "Visit Visa" },
                ].map((link, index) => (
                  <Link key={index} href={link.href} className="group flex items-center gap-2 text-gray-600 hover:text-[#0B6F78] transition-all duration-300 py-1">
                    <FiArrowRight className="text-xs opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-[#0a306b] border-l-4 border-[#0B6F78] pl-3">Our Services</h4>
              <div className="space-y-3">
                {[
                  "University Admissions",
                  "Visa Assistance",
                  "Scholarship Guidance",
                  "Test Preparation",
                  "Career Counseling",
                  "Document Processing"
                ].map((service, index) => (
                  <div key={index} className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-2 h-2 bg-[#0B6F78] rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                    <span className="text-gray-600 font-medium group-hover:text-[#0B6F78] transition-colors duration-300">
                      {service}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social & App */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-[#0a306b] border-l-4 border-[#0B6F78] pl-3">Connect With Us</h4>
              <p className="text-gray-600 mb-6">Follow us for the latest updates and success stories.</p>
              
              <div className="mb-8">
                <SocialIcons />
              </div>
              
              {/* App Download */}
              <div className="bg-gradient-to-r from-[#0B6F78]/5 to-[#0a306b]/5 p-5 rounded-xl border border-[#0B6F78]/10">
                <p className="font-semibold text-[#0a306b] mb-3">Download Our App</p>
                <p className="text-gray-600 text-sm mb-4">Get instant access to university information on the go.</p>
                <div className="flex gap-3">
                  <button className="flex-1 bg-gray-900 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                    </svg>
                    App Store
                  </button>
                  <button className="flex-1 bg-gray-900 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                    </svg>
                    Play Store
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Global Offices Section */}
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-[#0a306b] mb-3">Our Global Offices</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                With strategically located offices worldwide, we provide personalized support to students across the globe
              </p>
            </div>

            {/* Address Cards Grid - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {addresses.map((address, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-5 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group"
                  onClick={() => setSelectedCity(address)}
                >
                  <div className="flex flex-col items-center text-center h-full">
                    <div className="w-14 h-14 bg-gradient-to-r from-[#0B6F78] to-[#0a306b] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <FiMapPin className="text-white text-xl" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-3 text-lg">{address.city}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4 line-clamp-3">
                      {address.address}
                    </p>
                    <button className="text-[#0B6F78] font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                      View Details
                      <FiArrowRight className="text-xs" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Office Details Modal */}
      {selectedCity && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedCity(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-[#0B6F78] to-[#0a306b] p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{selectedCity.city} Office</h2>
                <button onClick={() => setSelectedCity(null)} className="text-white hover:text-gray-200 text-2xl">
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#0B6F78]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="text-[#0B6F78] text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">Office Address</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedCity.address}</p>
                </div>
              </div>

              {selectedCity.phones.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#0B6F78]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiPhone className="text-[#0B6F78] text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 text-lg">Contact Numbers</h3>
                    <div className="space-y-1">
                      {selectedCity.phones.map((phone, index) => (
                        <p key={index} className="text-gray-600 font-medium">{phone}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedCity.emails.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#0B6F78]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiMail className="text-[#0B6F78] text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 text-lg">Email Address</h3>
                    <div className="space-y-1">
                      {selectedCity.emails.map((email, index) => (
                        <p key={index} className="text-gray-600 font-medium">{email}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedCity(null)}
                  className="bg-gradient-to-r from-[#0B6F78] to-[#0a306b] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#0a306b] hover:to-[#0B6F78] transition-all duration-300"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar - Enhanced */}
      <div className="bg-gradient-to-r from-[#0B6F78] to-[#0a306b] mt-12">
        <Container>
          <div className="text-white py-6 px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 text-sm md:text-base">
              <span>© {new Date().getFullYear()} Universities Page. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap gap-6 justify-center text-sm">
              {['Terms & Conditions', 'Privacy Policy', 'Feedback', 'Careers', 'Sitemap'].map((item, index) => (
                <Link 
                  key={index} 
                  href={`/${item.toLowerCase().replace(' & ', '-').replace(' ', '-')}`} 
                  className="hover:text-gray-200 transition-colors duration-300 font-medium"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default FooterOrganism;