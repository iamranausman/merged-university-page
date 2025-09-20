import { 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaInstagram, 
  FaWhatsapp 
} from "react-icons/fa";

export const SocialIcons = () => (
  <div className="flex justify-center items-center gap-3">
    {/* Facebook */}
    <a 
      className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 text-white transition-all duration-300 hover:bg-blue-600 hover:scale-110 hover:shadow-lg"
      href="https://www.facebook.com/universitiespagelahore" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Visit our Facebook page"
      title="Facebook"
    >
      <FaFacebook className="text-lg" />
      <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        Facebook
      </span>
    </a>

    {/* Twitter */}
    <a 
      className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 text-white transition-all duration-300 hover:bg-blue-400 hover:scale-110 hover:shadow-lg"
      href="https://twitter.com/UniversitiesPa1" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Visit our Twitter profile"
      title="Twitter"
    >
      <FaTwitter className="text-lg" />
      <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        Twitter
      </span>
    </a>

    {/* LinkedIn */}
    <a 
      className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 text-white transition-all duration-300 hover:bg-blue-800 hover:scale-110 hover:shadow-lg"
      href="https://linkedin.com/in/universities-page-4728301b5" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Visit our LinkedIn page"
      title="LinkedIn"
    >
      <FaLinkedin className="text-lg" />
      <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        LinkedIn
      </span>
    </a>

    {/* Instagram */}
    <a 
      className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 hover:scale-110 hover:shadow-lg"
      href="https://www.instagram.com/universitiespage_official/" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Visit our Instagram profile"
      title="Instagram"
    >
      <FaInstagram className="text-lg" />
      <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        Instagram
      </span>
    </a>

    {/* WhatsApp */}
    <a 
      className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 text-white transition-all duration-300 hover:bg-green-500 hover:scale-110 hover:shadow-lg"
      href="https://whatsapp.com/channel/0029Va7vJOYJkK79737At844" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      title="WhatsApp"
    >
      <FaWhatsapp className="text-lg" />
      <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        WhatsApp
      </span>
    </a>
  </div>
);

// Alternative version with tooltips on the side for larger screens
export const SocialIconsWithLabels = () => (
  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
    {/* Facebook */}
    <a 
      className="group relative flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition-colors"
      href="https://www.facebook.com/universitiespagelahore" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Visit our Facebook page"
    >
      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors">
        <FaFacebook />
      </div>
      <span className="hidden sm:block">Facebook</span>
    </a>

    {/* Twitter */}
    <a 
      className="group relative flex items-center gap-3 text-sm text-gray-700 hover:text-blue-400 transition-colors"
      href="https://twitter.com/UniversitiesPa1" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Visit our Twitter profile"
    >
      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white group-hover:bg-blue-400 transition-colors">
        <FaTwitter />
      </div>
      <span className="hidden sm:block">Twitter</span>
    </a>

    {/* LinkedIn */}
    <a 
      className="group relative flex items-center gap-3 text-sm text-gray-700 hover:text-blue-800 transition-colors"
      href="https://linkedin.com/in/universities-page-4728301b5" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Visit our LinkedIn page"
    >
      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white group-hover:bg-blue-800 transition-colors">
        <FaLinkedin />
      </div>
      <span className="hidden sm:block">LinkedIn</span>
    </a>

    {/* Instagram */}
    <a 
      className="group relative flex items-center gap-3 text-sm text-gray-700 hover:text-pink-600 transition-colors"
      href="https://www.instagram.com/universitiespage_official/" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Visit our Instagram profile"
    >
      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:via-pink-600 group-hover:to-orange-500 transition-colors">
        <FaInstagram />
      </div>
      <span className="hidden sm:block">Instagram</span>
    </a>

    {/* WhatsApp */}
    <a 
      className="group relative flex items-center gap-3 text-sm text-gray-700 hover:text-green-600 transition-colors"
      href="https://whatsapp.com/channel/0029Va7vJOYJkK79737At844" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
    >
      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white group-hover:bg-green-500 transition-colors">
        <FaWhatsapp />
      </div>
      <span className="hidden sm:block">WhatsApp</span>
    </a>
  </div>
);