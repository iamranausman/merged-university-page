'use client';
import { useState } from 'react';
import Container from "../atoms/Container";
import FooterMolecule from "../molecules/FooterMolecule";
import { SocialIcons } from "../molecules/SocialIcons";
import Link from 'next/link';
import Image from 'next/image';
import Button from '../atoms/Button';
import Swal from 'sweetalert2';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';

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

  const [selectedCity, setSelectedCity] = useState('');
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
    <footer className="relative bg-gradient-to-b from-[#E7F1F2] to-[#d0e5e7] pt-[160px] mt-28">
      {/* Newsletter Card - Overlapping */}
      <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[80%] lg:w-[70%] mb-16">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-teal-100">
          {/* Left Side */}
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-teal-600 font-semibold mb-2">Stay Updated</p>
            <h3 className="text-2xl font-bold text-gray-800 font-sans mb-4">
              Get the latest study abroad insights delivered to your inbox!
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                {loading ? "Subscribing..." : "Subscribe Now"}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">We respect your privacy. Unsubscribe at any time.</p>
          </div>
          {/* Right Side Image */}
          <div className="hidden md:block flex-shrink-0">
            <div className="rounded-xl overflow-hidden p-4 flex items-center justify-center bg-teal-50">
              <Image
                src="/assets/newsletter_img.png"
                alt="Newsletter illustration"
                width={160}
                height={160}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Main Content */}
      <Container>
        <div className="text-gray-800 px-4 sm:px-6 py-10 space-y-12">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="text-2xl font-bold text-teal-800">Universities Page</div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your trusted partner in global education. We help students find the best international opportunities with expert guidance and support.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiPhone className="text-teal-600" />
                <span>+92 123 456 7890</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiMail className="text-teal-600" />
                <span>info@universitiespage.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiClock className="text-teal-600" />
                <span>Mon-Fri: 9AM - 6PM</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-5 text-teal-800 border-b pb-2">Quick Links</h4>
              <div className="grid grid-cols-2 gap-4">
                <ul className="space-y-3">
                  <li><Link href="/CountriesGuide" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">Country Guides</Link></li>
                  <li><Link href="/universities" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">Universities</Link></li>
                  <li><Link href="/courses" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">Courses</Link></li>
                  <li><Link href="/blogs" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">Articles</Link></li>
                </ul>
                <ul className="space-y-3">
                  <li><Link href="/services" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">Services</Link></li>
                  <li><Link href="/visit-visa" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">Visit Visa</Link></li>
                  <li><Link href="/free-consultation" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">Free Consultation</Link></li>
                  <li><Link href="/ourteam" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">Our Team</Link></li>
                </ul>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-lg mb-5 text-teal-800 border-b pb-2">Our Services</h4>
              <ul className="space-y-3">
                <li><Link href="/services" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">University Admissions</Link></li>
                <li><Link href="/services" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">Visa Assistance</Link></li>
                <li><Link href="/services" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">Scholarship Guidance</Link></li>
                <li><Link href="/services" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">Test Preparation</Link></li>
                <li><Link href="/services" className="text-gray-600 hover:text-teal-600 transition-colors text-sm">Career Counseling</Link></li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h4 className="font-semibold text-lg mb-5 text-teal-800 border-b pb-2">Follow Us</h4>
              <p className="text-gray-600 text-sm mb-4">Stay connected with us on social media for the latest updates.</p>
              <div className="mb-6">
                <SocialIcons />
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-teal-800 mb-2">Download Our App (Coming Soon)</p>
                <div className="flex gap-2">
                  <button className="bg-black text-white text-xs py-2 px-3 rounded flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                    </svg>
                    App Store
                  </button>
                  <button className="bg-black text-white text-xs py-2 px-3 rounded flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                    </svg>
                    Play Store
                  </button>
                </div>
              </div>
            </div>
          </div>

 {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {addresses.map((address, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => setSelectedCity(address)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-teal-100 p-3 rounded-full mb-3">
                <FiMapPin className="text-teal-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{address.city}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{address.address}</p>
              <button className="mt-3 text-teal-600 text-sm font-medium hover:text-teal-700">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedCity && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50 p-4"
    onClick={() => setSelectedCity(null)} // close when clicking outside
  >
    <div
      className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
    >
      <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-xl">
        <h2 className="text-2xl font-bold text-gray-800">
          {selectedCity.city} Office
        </h2>
      </div>

      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-teal-100 p-3 rounded-full flex-shrink-0">
            <FiMapPin className="text-teal-600 text-xl" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Address</h3>
            <p className="text-gray-600">{selectedCity.address}</p>
          </div>
        </div>

        {selectedCity.phones.length > 0 && (
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-teal-100 p-3 rounded-full flex-shrink-0">
              <FiPhone className="text-teal-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Phone Numbers</h3>
              {selectedCity.phones.map((phone, index) => (
                <p key={index} className="text-gray-600">{phone}</p>
              ))}
            </div>
          </div>
        )}

        {selectedCity.emails.length > 0 && (
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-teal-100 p-3 rounded-full flex-shrink-0">
              <FiMail className="text-teal-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Email</h3>
              {selectedCity.emails.map((email, index) => (
                <p key={index} className="text-gray-600">{email}</p>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex gap-3">
            <button
  onClick={() => setSelectedCity(null)}
  className="bg-teal-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors"
>
  Close
</button>

          </div>
        </div>
      </div>
    </div>
  </div>
)}

        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="bg-teal-800 mt-10">
        <Container>
          <div className="text-white py-5 px-4 text-sm flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} Universities Page. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap gap-5 justify-center">
              <Link href="/terms-and-condition" className="hover:text-teal-200 transition-colors">Terms & Conditions</Link>
              <Link href="/privacy-policy" className="hover:text-teal-200 transition-colors">Privacy Policy</Link>
              <Link href="/feedback" className="hover:text-teal-200 transition-colors">Feedback</Link>
              <Link href="/jobs" className="hover:text-teal-200 transition-colors">Careers</Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default FooterOrganism;