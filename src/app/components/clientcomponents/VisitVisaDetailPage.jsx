'use client'
import { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  Star,
  Users,
  FileText,
  Shield,
  TrendingUp,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import Button from "../../components/atoms/Button";

export default function VisitVisaDetailPage({visaData}) {

  const [country, setCountry] = useState(null);
  const [visaRequirements, setVisaRequirements] = useState([]);
  const [adminVisaTypes, setAdminVisaTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const safeImage = (url) => {
    if (!url) return '/assets/visit.webp';
    const str = url.toString();
    if (str.startsWith('/filemanager')) return '/assets/visit.png';
    return str;
  };

  useEffect(() => {
    try
    {
      setLoading(true);

      if(!visaData.success){
        throw new Error(visaData.message);
      }

      if(visaData.success){

        setCountry(visaData.country_details);
        setAdminVisaTypes(visaData.visa_types)
        setVisaRequirements(visaData.visa_requirements)

      } else {

        console.log(data.message);
        setError(data.message);
        router.push('/404');

      }

    } catch (error){
      console.log(error.message);
      setError(error.message);
      setLoading(false)
    } finally{
      setLoading(false);
    }
  }, [visaData]);

 // State for the outer accordion (Visa Types)
  const [openVisaTypeIndex, setOpenVisaTypeIndex] = useState(null);

  // State for the inner accordion (Visa Requirements)
  const [openRequirementIndex, setOpenRequirementIndex] = useState(null);

  // Toggle for outer accordion (Visa Types)
  const toggleAccordionType = (index) => {
    setOpenVisaTypeIndex(openVisaTypeIndex === index ? null : index);
  };

  // Toggle for inner accordion (Visa Requirements)
  const toggleAccordionRequirement = (index) => {
    setOpenRequirementIndex(openRequirementIndex === index ? null : index);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  }

  if (!country) {
    return <div className="text-center py-12">Country not found</div>;
  }

  return (
    <>
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${safeImage(country.banner_image) || '/assets/default-banner.jpg'}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        </div>
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {country.country_name}
                <span className="block text-primary-glow">Visit Visa</span>
              </h1>
              <p className="text-xl mb-6 opacity-90">
                {country.description || `Discover the beauty of ${country.country_name} with our visa services.`}
                {country.discount_price && ' Discount available!'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Rating and Overview */}
            <div className="bg-card rounded-lg shadow-xl p-12">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400" />
                  ))}
                  <span className="text-lg font-semibold ml-2 text-foreground">4.5</span>
                </div>
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-secondary text-foreground">
                  {country.visa_details?.[0]?.review_count || '156'} reviews
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {country.visa_details?.[0]?.visa_description || 
                  `${country.country_name} visit visa: Find all required documents, fees, and complete information on visa requirements.`}
              </p>
            </div>
          {/* Visa Types */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
              <div className="border-b p-6 bg-gradient-to-r from-[#E7F1F2] to-[#d6eaeb]">
                <div className="flex items-center gap-2 text-xl font-semibold text-[#0B6D76]">
                  <FileText className="h-6 w-6" />
                  Visa Types
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Different visa options available for {country.country_name}.
                </p>
              </div>

              <div className="p-6">
                {adminVisaTypes.map((type, idx1) => {
                  const isOpen = openVisaTypeIndex === idx1;
                  const filteredRequirements = visaRequirements.filter(req => req.visa_type_id === type.id);

                  return (
                    <div key={idx1} className="border rounded-lg p-4 hover:shadow-md transition-shadow mb-5">
                      {/* Toggle Button */}
                      <button
                        onClick={() => toggleAccordionType(idx1)}
                        className="w-full text-left flex items-center justify-between"
                      >
                        <h3 className="font-semibold text-lg text-[#0B6D76]">{type.name}</h3>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180 text-[#0B6D76]' : ''}`}
                        />
                      </button>

                      {/* Description (Only visible when toggled) */}
                      {isOpen && (
                        <div>
                          {filteredRequirements.map((req, idx2) => {
                            const isOpen = openRequirementIndex === idx2;
                            return (
                              <div key={idx2} className="transition-all duration-300">
                                <button
                                  onClick={() => toggleAccordionRequirement(idx2)}
                                  className="w-full flex items-center justify-between px-6 py-4 text-left font-medium text-gray-800 hover:text-[#0B6D76] focus:outline-none"
                                >
                                  <span>{req.title}</span>
                                  <ChevronDown
                                    className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180 text-[#0B6D76]' : ''}`}
                                  />
                                </button>
                                <div
                                  className={`px-6 overflow-hidden transition-all ${isOpen ? 'max-h-[1000px] py-4' : 'max-h-0'}`}
                                >
                                  <ul className="space-y-3 bg-[#0B6D76] p-4 rounded-lg">
                                    {req.description.split('\n').map((line, index) => (
                                      <li key={index} className="text-white">{line}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>


            {/* Key Features */}
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Clock className="h-6 w-6 text-primary" />,
                  title: "Fast Processing",
                  desc: "Quick visa processing with expert guidance.",
                  bg: "bg-primary/10 text-primary",
                },
                {
                  icon: <Shield className="h-6 w-6 text-green-600" />,
                  title: "Secure Process",
                  desc: "Your documents and personal information are completely secure.",
                  bg: "bg-green-100 text-green-600",
                },
                {
                  icon: <Users className="h-6 w-6 text-blue-500" />,
                  title: "Expert Support",
                  desc: "Dedicated team to help you throughout your visa journey.",
                  bg: "bg-blue-100 text-blue-500",
                },
                {
                  icon: <TrendingUp className="h-6 w-6 text-orange-500" />,
                  title: "High Success Rate",
                  desc: "Over 95% success rate in visa approvals.",
                  bg: "bg-orange-100 text-orange-500",
                },
              ].map((feat, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${feat.bg}`}>
                      {feat.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{feat.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="rounded-2xl shadow-md border border-gray-200 overflow-hidden bg-white">
              <div className="text-center p-6 border-b bg-gray-50">
                <div className="flex items-center justify-center gap-2 text-lg font-semibold text-[#0B6D76]">
                  <MapPin className="h-5 w-5" />
                  {country.country_name}
                </div>
                <p className="text-sm text-gray-500 mt-1">Consultation Fee</p>
              </div>

              <div className="p-6 space-y-4 text-center">
                {country.discount_price && (
                  <span className="inline-block bg-[#0B6D76]/10 text-[#0B6D76] px-3 py-1 text-xs font-medium rounded-full">
                    Discounted
                  </span>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Discounted Fee:</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {country.currency} {(country.price - (country.price * (country.discount_price / 100)))}
                  </p>
                </div>
                {country.discount_price && (
                  <p className="text-sm text-gray-400 line-through">
                    Original Price: {country.currency} {country.price}
                  </p>
                )}
                <Link href={`/visa-apply-now/${country.slug || slug}`}>
                  <button className="w-full py-3 rounded-lg font-semibold text-white bg-[#0B6D76] hover:bg-[#09575f] transition">
                    Apply Now
                  </button>
                </Link>
              </div>
            </div>

            {/* Other Visa Countries - Limited to 3 */}
            <div className="bg-card rounded-lg shadow-xl px-[20px] overflow-hidden">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-[#0B6D76] mb-4">Other Visa Countries</h3>
                {/*<div className="space-y-4">
                  {otherCountries.map((country) => (
                    <Link 
                      key={country.id} 
                      href={`/visit-visa-detail/${country.slug}`}
                      className="block group"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                          <img 
                            src={country.image} 
                            alt={country.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate group-hover:text-[#0B6D76] transition-colors">
                            {country.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {country.currency} {country.price}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#0B6D76] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>*/}
              </div>
              <div className="py-6 flex gap-[20px]">
                <Link href={'/visit-visa'}>
                  <Button>View more countries</Button>
                </Link>
                <Link href={`/visa-apply-now/${country.slug || slug}`}>
                  <Button>Apply Now</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}